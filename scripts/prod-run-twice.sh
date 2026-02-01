#!/usr/bin/env bash
# Run SCRAPE_PROD twice for one site (Ivars) to verify incremental: run2 new≈0.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[[ -f "${REPO_ROOT}/.env" ]] && set -a && . "${REPO_ROOT}/.env" && set +a

API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
CUSTOMER_ID="${CUSTOMER_ID:-}"
DATABASE_URL="${DATABASE_URL:-}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-3}"
POLL_TIMEOUT_SECONDS="${POLL_TIMEOUT_SECONDS:-180}"
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
  CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "SELECT id FROM customers LIMIT 1;" | head -n1 | tr -d '[:space:]')"
  [[ -z "${CUSTOMER_ID}" ]] && CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "INSERT INTO customers (name) VALUES ('Prod Twice Customer') RETURNING id;" | head -n1 | tr -d '[:space:]')"
  export CUSTOMER_ID
  echo "Using CUSTOMER_ID=${CUSTOMER_ID}"
}

BASE_URL="${1:-https://www.ivarsbil.se/bilar-i-lager/}"
NAME="${2:-Ivars}"

HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${API_BASE_URL}/health" 2>/dev/null || true)"
[[ "${HTTP_CODE}" != "200" ]] && { echo "API not reachable at ${API_BASE_URL}. Start API and worker." >&2; exit 1; }

maybe_create_customer

ds_json="$(api POST "/v1/data-sources" "$(jq -n --arg name "${NAME}" --arg baseUrl "${BASE_URL}" '{ name: $name, baseUrl: $baseUrl, strategy: "http" }')")"
ds_id="$(echo "${ds_json}" | jq -r '.id')"
[[ -z "${ds_id}" || "${ds_id}" == "null" ]] && { echo "Failed to create data source" >&2; exit 1; }
echo "Data source ${ds_id}. Running probe..."
probe_json="$(api POST "/v1/data-sources/${ds_id}/probe")"
probe_run_id="$(echo "${probe_json}" | jq -r '.runId')"
[[ -z "${probe_run_id}" || "${probe_run_id}" == "null" ]] && { echo "Probe enqueue failed" >&2; exit 1; }
poll_run "${probe_run_id}" >/dev/null

echo "=== Run 1 ==="
r1="$(api POST "/v1/data-sources/${ds_id}/prod-run")"
run1="$(echo "${r1}" | jq -r '.runId')"
status1="$(poll_run "${run1}")"
row1="$(api GET "/v1/scrape-runs/${run1}")"
echo "run_id=${run1} status=${status1}"
if [[ "${status1}" == "timeout" || "${status1}" == "failed" ]]; then
  fetch_run_events "${run1}"
fi
echo "items_seen=$(echo "${row1}" | jq -r '.itemsSeen // .items_seen // 0') items_new=$(echo "${row1}" | jq -r '.itemsNew // .items_new // 0') items_removed=$(echo "${row1}" | jq -r '.itemsRemoved // .items_removed // 0')"

echo "=== Run 2 ==="
r2="$(api POST "/v1/data-sources/${ds_id}/prod-run")"
run2="$(echo "${r2}" | jq -r '.runId')"
status2="$(poll_run "${run2}")"
row2="$(api GET "/v1/scrape-runs/${run2}")"
echo "run_id=${run2} status=${status2}"
if [[ "${status2}" == "timeout" || "${status2}" == "failed" ]]; then
  fetch_run_events "${run2}"
fi
echo "items_seen=$(echo "${row2}" | jq -r '.itemsSeen // .items_seen // 0') items_new=$(echo "${row2}" | jq -r '.itemsNew // .items_new // 0') items_removed=$(echo "${row2}" | jq -r '.itemsRemoved // .items_removed // 0')"

echo ""
echo "Expect run2 items_new ≈ 0 (incremental). SIMULATE_REMOVALS=1 on worker to test removal marking."
