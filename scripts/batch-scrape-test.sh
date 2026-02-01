#!/usr/bin/env bash
set -euo pipefail

# Load .env from repo root when running as ./scripts/batch-scrape-test.sh
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -f "${REPO_ROOT}/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  . "${REPO_ROOT}/.env"
  set +a
fi

API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
CUSTOMER_ID="${CUSTOMER_ID:-}"
DATABASE_URL="${DATABASE_URL:-}"
SITES_FILE="${SITES_FILE:-}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-2}"
POLL_TIMEOUT_SECONDS="${POLL_TIMEOUT_SECONDS:-60}"

# Default URLs if no CSV provided (5–10 sites)
DEFAULT_URLS=(
  "https://example.com"
  "https://example.org"
  "https://example.net"
  "https://httpbin.org/html"
  "https://www.w3.org"
  "https://info.cern.ch"
)

# --- helpers ---
need_cmd () {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: Missing required command: $1" >&2
    case "$1" in
      jq) echo "Install: brew install jq" >&2 ;;
      psql) echo "Install: brew install postgresql@16" >&2 ;;
      *) ;;
    esac
    exit 1
  }
}

have_cmd () {
  command -v "$1" >/dev/null 2>&1
}

api () {
  local method="$1"
  local path="$2"
  local body="${3:-}"

  if [[ -z "${CUSTOMER_ID}" ]]; then
    echo "ERROR: CUSTOMER_ID is not set (and could not be auto-created)." >&2
    exit 1
  fi

  if [[ -n "${body}" ]]; then
    curl -sS -X "${method}" "${API_BASE_URL}${path}" \
      -H "content-type: application/json" \
      -H "x-customer-id: ${CUSTOMER_ID}" \
      -d "${body}"
  else
    curl -sS -X "${method}" "${API_BASE_URL}${path}" \
      -H "x-customer-id: ${CUSTOMER_ID}"
  fi
}

poll_run () {
  local run_id="$1"
  local start_ts
  start_ts="$(date +%s)"

  while true; do
    local now_ts elapsed status
    now_ts="$(date +%s)"
    elapsed=$(( now_ts - start_ts ))
    status="$(api GET "/v1/scrape-runs/${run_id}" | jq -r '.status')"

    if [[ "${status}" == "success" || "${status}" == "failed" || "${status}" == "canceled" ]]; then
      echo "${status}"
      return 0
    fi

    if (( elapsed > POLL_TIMEOUT_SECONDS )); then
      echo "timeout"
      return 0
    fi

    sleep "${POLL_INTERVAL_SECONDS}"
  done
}

maybe_create_customer () {
  if [[ -n "${CUSTOMER_ID}" ]]; then
    return 0
  fi

  if [[ -z "${DATABASE_URL}" ]]; then
    echo "CUSTOMER_ID not set and DATABASE_URL not set, cannot auto-create customer." >&2
    echo "Set DATABASE_URL in .env or pass CUSTOMER_ID=... See docs/20_local_dev_postgres_redis.md" >&2
    exit 1
  fi

  if ! have_cmd psql; then
    echo "CUSTOMER_ID not set and psql not installed. Install: brew install postgresql@16" >&2
    exit 1
  fi

  echo "CUSTOMER_ID not provided. Creating a customer via psql..."
  CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "insert into customers (name) values ('Local Batch Test Customer') returning id;" | head -n 1 | tr -d '[:space:]')"
  if [[ -z "${CUSTOMER_ID}" ]]; then
    echo "ERROR: Failed to create customer via psql." >&2
    exit 1
  fi
  export CUSTOMER_ID
  echo "Created CUSTOMER_ID=${CUSTOMER_ID}"
}

# Derive a short name from URL (hostname)
url_to_name () {
  local url="$1"
  echo "${url}" | sed -e 's|https\?://||' -e 's|/.*||' -e 's|^www\.||' | tr -d '[:space:]' | head -c 80
}

create_data_source () {
  local name="$1"
  local base_url="$2"
  api POST "/v1/data-sources" \
    "$(jq -n --arg name "${name}" --arg baseUrl "${base_url}" '{
      name: $name,
      baseUrl: $baseUrl,
      strategy: "http",
      scheduleEnabled: false
    }')"
}

trigger_test_run () {
  local data_source_id="$1"
  api POST "/v1/data-sources/${data_source_id}/test-run"
}

# --- main ---
need_cmd curl
need_cmd jq

# Require API (and worker) running
HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${API_BASE_URL}/health" 2>/dev/null || true)"
if [[ "${HTTP_CODE}" != "200" ]]; then
  echo "ERROR: API not reachable at ${API_BASE_URL}. Start API and worker first:" >&2
  echo "  pnpm --filter @repo/api dev" >&2
  echo "  pnpm --filter @repo/worker dev" >&2
  echo "See docs/20_local_dev_postgres_redis.md" >&2
  exit 1
fi

maybe_create_customer

# Collect URLs: from CSV file or default list
URLS=()
if [[ -n "${SITES_FILE}" && -f "${SITES_FILE}" ]]; then
  while IFS= read -r line || [[ -n "${line}" ]]; do
    url="$(echo "${line}" | cut -d',' -f1 | tr -d '"' | tr -d '\r')"
    [[ -z "${url}" ]] && continue
    [[ "${url}" == "url" || "${url}" == "URL" ]] && continue
    URLS+=("${url}")
  done < "${SITES_FILE}"
fi
if [[ ${#URLS[@]} -eq 0 ]]; then
  echo "No SITES_FILE provided or file empty; using default list of ${#DEFAULT_URLS[@]} URLs."
  URLS=("${DEFAULT_URLS[@]}")
fi

OUT_DIR="${REPO_ROOT}/scripts/out"
mkdir -p "${OUT_DIR}"
RESULTS_FILE="${OUT_DIR}/batch_results.ndjson"
: > "${RESULTS_FILE}"

echo "== Batch scrape test: ${#URLS[@]} URLs =="
echo "API_BASE_URL=${API_BASE_URL}"
echo "CUSTOMER_ID=${CUSTOMER_ID}"
echo ""

for url in "${URLS[@]}"; do
  name="$(url_to_name "${url}")"
  echo "  [${url}] -> name=${name}"

  ds_json="$(create_data_source "${name}" "${url}")"
  ds_id="$(echo "${ds_json}" | jq -r '.id')"
  if [[ -z "${ds_id}" || "${ds_id}" == "null" ]]; then
    echo "    ERROR: Failed to create data source. Response: ${ds_json}" >&2
    jq -n --arg url "${url}" --arg error "create_data_source_failed" '{
      url: $url,
      data_source_id: null,
      run_id: null,
      status: "error",
      error_code: $error,
      title: null,
      events_count: 0
    }' >> "${RESULTS_FILE}"
    continue
  fi

  run_json="$(trigger_test_run "${ds_id}")"
  run_id="$(echo "${run_json}" | jq -r '.runId')"
  if [[ -z "${run_id}" || "${run_id}" == "null" ]]; then
    echo "    ERROR: Failed to trigger test run." >&2
    jq -n --arg url "${url}" --arg ds_id "${ds_id}" --arg error "trigger_failed" '{
      url: $url,
      data_source_id: $ds_id,
      run_id: null,
      status: "error",
      error_code: $error,
      title: null,
      events_count: 0
    }' >> "${RESULTS_FILE}"
    continue
  fi

  status="$(poll_run "${run_id}")"
  echo "    run_id=${run_id} status=${status}"

  summary="$(api GET "/v1/scrape-runs/${run_id}/summary")"
  events_count="$(echo "${summary}" | jq -r '.eventsCount // 0')"
  error_code="$(echo "${summary}" | jq -r '.latestErrorEventCode // ""')"
  title="$(echo "${summary}" | jq -r '.title // ""')"

  jq -n \
    --arg url "${url}" \
    --arg ds_id "${ds_id}" \
    --arg run_id "${run_id}" \
    --arg status "${status}" \
    --arg error_code "${error_code}" \
    --arg title "${title}" \
    --argjson events_count "${events_count}" \
    '{
      url: $url,
      data_source_id: $ds_id,
      run_id: $run_id,
      status: $status,
      error_code: (if $error_code == "" then null else $error_code end),
      title: (if $title == "" then null else $title end),
      events_count: $events_count
    }' >> "${RESULTS_FILE}"
done

# Build JSON report
jq -s '.' "${RESULTS_FILE}" > "${OUT_DIR}/batch_report.json"

# Human-readable table
{
  echo "url	data_source_id	run_id	status	error_code	title	events_count"
  jq -r '.[] | [.url, .data_source_id, .run_id, .status, (.error_code // "-"), (.title // "-"), .events_count] | @tsv' "${OUT_DIR}/batch_report.json"
} > "${OUT_DIR}/batch_report.txt"

echo ""
echo "== Batch scrape test complete =="
echo "Results: ${OUT_DIR}/batch_report.json"
echo "Table:  ${OUT_DIR}/batch_report.txt"
cat "${OUT_DIR}/batch_report.txt"
