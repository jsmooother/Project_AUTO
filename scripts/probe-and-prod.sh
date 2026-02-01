#!/usr/bin/env bash
# Probe + SCRAPE_PROD for Riddermark, Ivars, Jonassons. Uses API only.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[[ -f "${REPO_ROOT}/.env" ]] && set -a && . "${REPO_ROOT}/.env" && set +a

API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
CUSTOMER_ID="${CUSTOMER_ID:-}"
DATABASE_URL="${DATABASE_URL:-}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-3}"
POLL_TIMEOUT_SECONDS="${POLL_TIMEOUT_SECONDS:-120}"
OUT_DIR="${REPO_ROOT}/scripts/out"
RUNS_DIR="${OUT_DIR}/runs"
mkdir -p "${OUT_DIR}" "${RUNS_DIR}"

need_cmd () { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: Missing $1" >&2; exit 1; }; }
need_cmd curl
need_cmd jq

api () {
  local method="$1" path="$2" body="${3:-}"
  [[ -z "${CUSTOMER_ID}" ]] && { echo "ERROR: CUSTOMER_ID not set" >&2; exit 1; }
  if [[ -n "${body}" ]]; then
    curl -sS -X "${method}" "${API_BASE_URL}${path}" -H "content-type: application/json" -H "x-customer-id: ${CUSTOMER_ID}" -d "${body}"
  else
    curl -sS -X "${method}" "${API_BASE_URL}${path}" -H "x-customer-id: ${CUSTOMER_ID}"
  fi
}

poll_run () {
  local run_id="$1" start_ts=$(date +%s)
  while true; do
    local status="$(api GET "/v1/scrape-runs/${run_id}" | jq -r '.status')"
    [[ "${status}" == "success" || "${status}" == "failed" || "${status}" == "canceled" ]] && echo "${status}" && return 0
    (( $(date +%s) - start_ts > POLL_TIMEOUT_SECONDS )) && echo "timeout" && return 0
    sleep "${POLL_INTERVAL_SECONDS}"
  done
}

fetch_run_events () {
  local run_id="$1"
  api GET "/v1/scrape-runs/${run_id}/events?limit=10" > "${RUNS_DIR}/${run_id}_events.json" || true
}

maybe_create_customer () {
  [[ -n "${CUSTOMER_ID}" ]] && return 0
  [[ -z "${DATABASE_URL}" ]] && { echo "CUSTOMER_ID or DATABASE_URL required" >&2; exit 1; }
  need_cmd psql
  CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "SELECT id FROM customers LIMIT 1;" 2>/dev/null | head -n1 | tr -d '[:space:]')"
  [[ -z "${CUSTOMER_ID}" ]] && CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "INSERT INTO customers (name) VALUES ('Probe Prod Customer') RETURNING id;" | head -n1 | tr -d '[:space:]')"
  export CUSTOMER_ID
  echo "Using CUSTOMER_ID=${CUSTOMER_ID}"
}

# Fixture sites: name, baseUrl (listing)
FIXTURES=(
  "Riddermark|https://www.riddermarkbil.se/kopa-bil/?types=personbil"
  "Ivars|https://www.ivarsbil.se/bilar-i-lager/"
  "Jonassons|https://www.jonassonsbil.se/fordon-i-lager/"
)

HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${API_BASE_URL}/health" 2>/dev/null || true)"
[[ "${HTTP_CODE}" != "200" ]] && { echo "API not reachable at ${API_BASE_URL}. Start API and worker first." >&2; exit 1; }

maybe_create_customer

for entry in "${FIXTURES[@]}"; do
  IFS='|' read -r name baseUrl <<< "${entry}"
  echo "=== ${name} (${baseUrl}) ==="

  ds_json="$(api POST "/v1/data-sources" "$(jq -n --arg name "${name}" --arg baseUrl "${baseUrl}" '{ name: $name, baseUrl: $baseUrl, strategy: "http" }')")"
  ds_id="$(echo "${ds_json}" | jq -r '.id')"
  [[ -z "${ds_id}" || "${ds_id}" == "null" ]] && { echo "  Failed to create data source" >&2; continue; }
  echo "  data_source_id=${ds_id}"

  probe_json="$(api POST "/v1/data-sources/${ds_id}/probe")"
  probe_run_id="$(echo "${probe_json}" | jq -r '.runId')"
  [[ -z "${probe_run_id}" || "${probe_run_id}" == "null" ]] && { echo "  Probe enqueue failed" >&2; continue; }
  echo "  Probe runId=${probe_run_id}; waiting for worker..."
  status="$(poll_run "${probe_run_id}")"
  if [[ "${status}" == "timeout" || "${status}" == "failed" ]]; then
    echo "  WARN: probe run ${probe_run_id} status=${status}" >&2
    fetch_run_events "${probe_run_id}"
  fi
  ds_after="$(api GET "/v1/data-sources/${ds_id}")"
  strategy="$(echo "${ds_after}" | jq -r '.configJson.discovery.strategy // "unknown"')"
  echo "  Strategy selected: ${strategy}"

  run_json="$(api POST "/v1/data-sources/${ds_id}/prod-run")"
  run_id="$(echo "${run_json}" | jq -r '.runId')"
  [[ -z "${run_id}" || "${run_id}" == "null" ]] && { echo "  Prod-run enqueue failed" >&2; continue; }
  status="$(poll_run "${run_id}")"
  echo "  SCRAPE_PROD run_id=${run_id} status=${status}"
  if [[ "${status}" == "timeout" || "${status}" == "failed" ]]; then
    fetch_run_events "${run_id}"
  fi

  run_row="$(api GET "/v1/scrape-runs/${run_id}")"
  items_seen="$(echo "${run_row}" | jq -r '.itemsSeen // .items_seen // 0')"
  items_new="$(echo "${run_row}" | jq -r '.itemsNew // .items_new // 0')"
  items_removed="$(echo "${run_row}" | jq -r '.itemsRemoved // .items_removed // 0')"
  echo "  items_seen=${items_seen} items_new=${items_new} items_removed=${items_removed}"
  echo ""
done

echo "Done. Check run_events and items in DB for sample title/image counts."
