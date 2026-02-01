#!/usr/bin/env bash
set -euo pipefail

# Load .env from repo root when running as ./scripts/smoke-test.sh
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
REDIS_URL="${REDIS_URL:-}"
SUCCESS_URL="${SUCCESS_URL:-https://example.com}"
FAIL_URL="${FAIL_URL:-https://httpstat.us/403}"

POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-2}"
POLL_TIMEOUT_SECONDS="${POLL_TIMEOUT_SECONDS:-60}"

# --- helpers ---
need_cmd () {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: Missing required command: $1" >&2
    case "$1" in
      jq) echo "Install: brew install jq" >&2 ;;
      psql) echo "Install: brew install postgresql@16" >&2 ;;
      redis-cli) echo "Install: brew install redis" >&2 ;;
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
    echo "Set DATABASE_URL in .env (e.g. postgres://localhost:5432/project_auto) or create a customer via psql:" >&2
    echo "  psql \$DATABASE_URL -c \"insert into customers (name) values ('Local Dev Customer') returning id;\"" >&2
    echo "Then re-run with: CUSTOMER_ID=<uuid> ./scripts/smoke-test.sh" >&2
    echo "See docs/20_local_dev_postgres_redis.md" >&2
    exit 1
  fi

  if ! have_cmd psql; then
    echo "CUSTOMER_ID not set and psql not installed, cannot auto-create customer." >&2
    echo "Install: brew install postgresql@16" >&2
    echo "Or create a customer via psql and re-run with CUSTOMER_ID=<uuid>. See docs/20_local_dev_postgres_redis.md" >&2
    exit 1
  fi

  echo "CUSTOMER_ID not provided. Creating a customer via psql..."
  CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "insert into customers (name) values ('Local Smoke Test Customer') returning id;" | head -n 1 | tr -d '[:space:]')"
  if [[ -z "${CUSTOMER_ID}" ]]; then
    echo "ERROR: Failed to create customer via psql." >&2
    exit 1
  fi
  export CUSTOMER_ID
  echo "Created CUSTOMER_ID=${CUSTOMER_ID}"
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

print_run_summary () {
  local run_id="$1"
  echo
  echo "Run summary (${run_id}):"
  api GET "/v1/scrape-runs/${run_id}" | jq .
}

print_run_events () {
  local run_id="$1"
  echo
  echo "Run events (${run_id}):"
  api GET "/v1/scrape-runs/${run_id}/events?limit=200" | jq .
}

maybe_verify_repro_bundles () {
  local run_id="$1"

  if [[ -z "${run_id}" || "${run_id}" == "null" ]]; then
    return 0
  fi
  if [[ -z "${DATABASE_URL}" || ! $(have_cmd psql && echo yes || echo no) == "yes" ]]; then
    echo
    echo "Skipping DB verification of repro_bundles (psql or DATABASE_URL not available)."
    echo "If storage is configured, verify artifacts in Supabase Storage bucket 'repro'."
    return 0
  fi

  echo
  echo "DB check: repro_bundles rows for run_id=${run_id}:"
  psql "${DATABASE_URL}" -c "select id, job_type, job_id, run_id, data_source_id, storage_key, created_at from repro_bundles where run_id = '${run_id}'::uuid order by created_at desc limit 20;"
}

# --- main ---
need_cmd curl
need_cmd jq

# Fail fast if DATABASE_URL is missing or placeholder
if [[ -z "${DATABASE_URL}" || "${DATABASE_URL}" == "postgres://user:pass@host:5432/dbname" ]]; then
  echo "ERROR: Set DATABASE_URL to your local Postgres (e.g. postgres://localhost:5432/project_auto)." >&2
  echo "See docs/20_local_dev_postgres_redis.md" >&2
  exit 1
fi

# Postgres connectivity
if have_cmd psql; then
  if ! psql "${DATABASE_URL}" -c "select 1" >/dev/null 2>&1; then
    echo "ERROR: Cannot connect to Postgres at DATABASE_URL." >&2
    echo "Start Postgres: brew services start postgresql@16" >&2
    echo "Create DB: createdb project_auto" >&2
    echo "See docs/20_local_dev_postgres_redis.md" >&2
    exit 1
  fi
else
  echo "ERROR: psql not found. Install: brew install postgresql@16" >&2
  exit 1
fi

# Redis connectivity
if have_cmd redis-cli; then
  if [[ -n "${REDIS_URL}" ]]; then
    if ! redis-cli -u "${REDIS_URL}" ping >/dev/null 2>&1; then
      echo "ERROR: Cannot connect to Redis at REDIS_URL." >&2
      echo "Start Redis: brew services start redis" >&2
      echo "See docs/20_local_dev_postgres_redis.md" >&2
      exit 1
    fi
  else
    if ! redis-cli ping >/dev/null 2>&1; then
      echo "ERROR: Cannot connect to Redis." >&2
      echo "Start Redis: brew services start redis" >&2
      echo "See docs/20_local_dev_postgres_redis.md" >&2
      exit 1
    fi
  fi
else
  echo "ERROR: redis-cli not found. Install: brew install redis" >&2
  exit 1
fi

echo "== Smoke test starting =="
echo "API_BASE_URL=${API_BASE_URL}"
echo "SUCCESS_URL=${SUCCESS_URL}"
echo "FAIL_URL=${FAIL_URL}"
echo "POLL_TIMEOUT_SECONDS=${POLL_TIMEOUT_SECONDS}"

echo
echo "1) Checking API health..."
curl -sS "${API_BASE_URL}/health" | jq . >/dev/null
echo "OK: API is healthy"

maybe_create_customer

echo
echo "2) Creating SUCCESS data source..."
SUCCESS_DS_JSON="$(create_data_source "SmokeTest Success Source" "${SUCCESS_URL}")"
SUCCESS_DS_ID="$(echo "${SUCCESS_DS_JSON}" | jq -r '.id')"
if [[ -z "${SUCCESS_DS_ID}" || "${SUCCESS_DS_ID}" == "null" ]]; then
  echo "ERROR: Failed to create success data source. Response:" >&2
  echo "${SUCCESS_DS_JSON}" >&2
  exit 1
fi
echo "Created data source: ${SUCCESS_DS_ID}"

echo
echo "3) Triggering SCRAPE_TEST (success path)..."
SUCCESS_RUN_JSON="$(trigger_test_run "${SUCCESS_DS_ID}")"
SUCCESS_RUN_ID="$(echo "${SUCCESS_RUN_JSON}" | jq -r '.runId')"
SUCCESS_JOB_ID="$(echo "${SUCCESS_RUN_JSON}" | jq -r '.jobId')"
if [[ -z "${SUCCESS_RUN_ID}" || "${SUCCESS_RUN_ID}" == "null" ]]; then
  echo "ERROR: Test-run did not return runId (Redis/queue may be down). Response:" >&2
  echo "${SUCCESS_RUN_JSON}" >&2
  echo "Ensure Redis is running: brew services start redis" >&2
  exit 1
fi
echo "Enqueued jobId=${SUCCESS_JOB_ID}, runId=${SUCCESS_RUN_ID}"

echo "Polling run status..."
SUCCESS_STATUS="$(poll_run "${SUCCESS_RUN_ID}")"
echo "Final status: ${SUCCESS_STATUS}"

print_run_summary "${SUCCESS_RUN_ID}"
print_run_events "${SUCCESS_RUN_ID}"
maybe_verify_repro_bundles "${SUCCESS_RUN_ID}"

echo
echo "4) Creating FAIL data source (expected failure)..."
FAIL_DS_JSON="$(create_data_source "SmokeTest Fail Source" "${FAIL_URL}")"
FAIL_DS_ID="$(echo "${FAIL_DS_JSON}" | jq -r '.id')"
if [[ -z "${FAIL_DS_ID}" || "${FAIL_DS_ID}" == "null" ]]; then
  echo "ERROR: Failed to create fail data source. Response:" >&2
  echo "${FAIL_DS_JSON}" >&2
  exit 1
fi
echo "Created data source: ${FAIL_DS_ID}"

echo
echo "5) Triggering SCRAPE_TEST (failure path)..."
FAIL_RUN_JSON="$(trigger_test_run "${FAIL_DS_ID}")"
FAIL_RUN_ID="$(echo "${FAIL_RUN_JSON}" | jq -r '.runId')"
FAIL_JOB_ID="$(echo "${FAIL_RUN_JSON}" | jq -r '.jobId')"
if [[ -z "${FAIL_RUN_ID}" || "${FAIL_RUN_ID}" == "null" ]]; then
  echo "ERROR: Test-run did not return runId. Response:" >&2
  echo "${FAIL_RUN_JSON}" >&2
  exit 1
fi
echo "Enqueued jobId=${FAIL_JOB_ID}, runId=${FAIL_RUN_ID}"

echo "Polling run status..."
FAIL_STATUS="$(poll_run "${FAIL_RUN_ID}")"
echo "Final status: ${FAIL_STATUS}"

print_run_summary "${FAIL_RUN_ID}"
print_run_events "${FAIL_RUN_ID}"
maybe_verify_repro_bundles "${FAIL_RUN_ID}"

echo
echo "== Smoke test complete =="
echo "Customer: ${CUSTOMER_ID}"
echo "Success run: ${SUCCESS_RUN_ID} (status: ${SUCCESS_STATUS})"
echo "Fail run:    ${FAIL_RUN_ID} (status: ${FAIL_STATUS})"