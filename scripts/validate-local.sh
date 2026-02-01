#!/usr/bin/env bash
# Local validation harness: probe -> profile -> prod -> incremental -> removals
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[[ -f "${REPO_ROOT}/.env" ]] && set -a && . "${REPO_ROOT}/.env" && set +a

API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
DATABASE_URL="${DATABASE_URL:-}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
CUSTOMER_ID="${CUSTOMER_ID:-}"

RIDDERMARK_LISTING="${RIDDERMARK_LISTING:-https://www.riddermarkbil.se/kopa-bil/?types=personbil}"
IVARS_LISTING="${IVARS_LISTING:-https://www.ivarsbil.se/bilar-i-lager/}"
JONASSONS_LISTING="${JONASSONS_LISTING:-https://www.jonassonsbil.se/fordon-i-lager/}"

POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-3}"
POLL_TIMEOUT_SECONDS="${POLL_TIMEOUT_SECONDS:-180}"
CURL_MAX_TIME="${CURL_MAX_TIME:-20}"

RUN_REMOVALS_ONLY=0
START_SERVICES=0
for arg in "$@"; do
  case "$arg" in
    --removals-only) RUN_REMOVALS_ONLY=1 ;;
    --start) START_SERVICES=1 ;;
  esac
done

OUT_DIR="${REPO_ROOT}/scripts/out"
PROFILES_DIR="${OUT_DIR}/profiles"
RUNS_DIR="${OUT_DIR}/runs"
ISSUES_FILE="${OUT_DIR}/validate_issues.txt"
mkdir -p "${OUT_DIR}" "${PROFILES_DIR}" "${RUNS_DIR}"
echo "" > "${ISSUES_FILE}"

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

log_issue () {
  local msg="$1"
  echo "ISSUE: ${msg}" | tee -a "${ISSUES_FILE}" >&2
}

warn_cmd () {
  command -v "$1" >/dev/null 2>&1 || {
    echo "WARN: Optional command missing: $1" >&2
    return 1
  }
  return 0
}

api () {
  local method="$1" path="$2" body="${3:-}"
  [[ -z "${CUSTOMER_ID}" ]] && { echo "ERROR: CUSTOMER_ID not set" >&2; exit 1; }
  if [[ -n "${body}" ]]; then
    curl -sS --max-time "${CURL_MAX_TIME}" -X "${method}" "${API_BASE_URL}${path}" \
      -H "content-type: application/json" \
      -H "x-customer-id: ${CUSTOMER_ID}" \
      -d "${body}"
  else
    curl -sS --max-time "${CURL_MAX_TIME}" -X "${method}" "${API_BASE_URL}${path}" \
      -H "x-customer-id: ${CUSTOMER_ID}"
  fi
}

fetch_run_events () {
  local run_id="$1"
  local events
  events="$(api GET "/v1/scrape-runs/${run_id}/events?limit=10" || echo '[]')"
  echo "${events}" > "${RUNS_DIR}/${run_id}_events.json"
}

poll_run () {
  local run_id="$1"
  local start_ts
  start_ts="$(date +%s)"
  while true; do
    local status
    status="$(api GET "/v1/scrape-runs/${run_id}" | jq -r '.status')"
    if [[ "${status}" == "success" || "${status}" == "failed" || "${status}" == "canceled" ]]; then
      echo "${status}"
      return 0
    fi
    if (( $(date +%s) - start_ts > POLL_TIMEOUT_SECONDS )); then
      echo "timeout"
      return 0
    fi
    sleep "${POLL_INTERVAL_SECONDS}"
  done
}

ensure_env () {
  need_cmd curl
  need_cmd jq
  need_cmd psql

  if [[ -z "${DATABASE_URL}" || "${DATABASE_URL}" == *"your_db"* ]]; then
    echo "ERROR: DATABASE_URL is not set or looks like a placeholder." >&2
    exit 1
  fi
}

check_postgres () {
  psql "${DATABASE_URL}" -c "select 1" >/dev/null 2>&1 || {
    log_issue "Postgres not reachable via DATABASE_URL."
    exit 1
  }
}

check_redis () {
  if ! warn_cmd redis-cli; then
    return 0
  fi
  local host port
  local tmp="${REDIS_URL#redis://}"
  host="${tmp%%:*}"
  port="${tmp#*:}"
  port="${port%%/*}"
  [[ -z "${host}" ]] && host="localhost"
  [[ -z "${port}" ]] && port="6379"
  redis-cli -h "${host}" -p "${port}" ping >/dev/null 2>&1 || {
    log_issue "Redis not reachable at ${host}:${port} (REDIS_URL=${REDIS_URL})"
  }
}

run_migrations () {
  echo "== Running migrations =="
  pnpm --filter @repo/db db:migrate
}

check_api () {
  local code
  code="$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' "${API_BASE_URL}/health" 2>/dev/null || true)"
  if [[ "${code}" != "200" ]]; then
    log_issue "API not reachable at ${API_BASE_URL}"
    echo "Start API: pnpm --filter @repo/api dev" >&2
    exit 1
  fi
}

start_services () {
  if [[ "${START_SERVICES}" -ne 1 ]]; then
    return 0
  fi
  echo "== Starting API + worker (best-effort) =="
  if ! curl -sS --max-time 5 -o /dev/null -w '%{http_code}' "${API_BASE_URL}/health" 2>/dev/null | grep -q "200"; then
    nohup pnpm --filter @repo/api dev > "${OUT_DIR}/api.log" 2>&1 & echo $! > "${OUT_DIR}/api.pid"
    sleep 2
  fi
  nohup pnpm --filter @repo/worker dev > "${OUT_DIR}/worker.log" 2>&1 & echo $! > "${OUT_DIR}/worker.pid"
  sleep 2
}

ensure_customer () {
  if [[ -n "${CUSTOMER_ID}" ]]; then
    echo "Using CUSTOMER_ID=${CUSTOMER_ID}"
    return 0
  fi
  CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "select id from customers limit 1;" | head -n1 | tr -d '[:space:]')"
  if [[ -z "${CUSTOMER_ID}" ]]; then
    CUSTOMER_ID="$(psql "${DATABASE_URL}" -t -A -c "insert into customers (name) values ('Local Validation Customer') returning id;" | head -n1 | tr -d '[:space:]')"
  fi
  if [[ -z "${CUSTOMER_ID}" ]]; then
    echo "ERROR: Failed to create customer via psql." >&2
    exit 1
  fi
  export CUSTOMER_ID
  echo "Using CUSTOMER_ID=${CUSTOMER_ID}"
}

ensure_data_source () {
  local name="$1" base_url="$2"
  local list ds_id
  list="$(api GET "/v1/data-sources")"
  ds_id="$(echo "${list}" | jq -r --arg baseUrl "${base_url}" '.data[] | select(.baseUrl==$baseUrl) | .id' | head -n1)"
  if [[ -n "${ds_id}" ]]; then
    echo "${ds_id}"
    return 0
  fi
  local ds_json
  ds_json="$(api POST "/v1/data-sources" "$(jq -n --arg name "${name}" --arg baseUrl "${base_url}" '{ name: $name, baseUrl: $baseUrl, strategy: "http" }')")"
  ds_id="$(echo "${ds_json}" | jq -r '.id')"
  echo "${ds_id}"
}

get_sample_items () {
  local ds_id="$1"
  psql "${DATABASE_URL}" -t -A -c "
    select coalesce(json_agg(row_to_json(t)), '[]'::json)
    from (
      select url, title, primary_image_url, detail_fetched_at, is_active,
             coalesce(jsonb_array_length(image_urls_json), 0) as image_count
      from items
      where customer_id='${CUSTOMER_ID}' and data_source_id='${ds_id}'
      order by last_seen_at desc nulls last
      limit 3
    ) t;
  " | tr -d '\n'
}

run_fixture () {
  local name="$1" base_url="$2"
  local ds_id probe_run_id prod_run_id status profile_json run_json samples

  ds_id="$(ensure_data_source "${name}" "${base_url}")"
  if [[ -z "${ds_id}" || "${ds_id}" == "null" ]]; then
    echo "ERROR: Failed to create data source for ${name}" >&2
    return 1
  fi

  local probe_json
  probe_json="$(api POST "/v1/data-sources/${ds_id}/probe")"
  probe_run_id="$(echo "${probe_json}" | jq -r '.runId')"
  status="$(poll_run "${probe_run_id}")"
  if [[ "${status}" == "timeout" || "${status}" == "failed" ]]; then
    log_issue "Probe run ${probe_run_id} status=${status} (worker may not be running)"
    echo "Start worker: pnpm --filter @repo/worker dev" >&2
    fetch_run_events "${probe_run_id}"
  fi

  profile_json="$(api GET "/v1/data-sources/${ds_id}")"
  echo "${profile_json}" > "${PROFILES_DIR}/${ds_id}.json"

  local prod_json
  prod_json="$(api POST "/v1/data-sources/${ds_id}/prod-run")"
  prod_run_id="$(echo "${prod_json}" | jq -r '.runId')"
  status="$(poll_run "${prod_run_id}")"
  if [[ "${status}" == "timeout" || "${status}" == "failed" ]]; then
    log_issue "Prod run ${prod_run_id} status=${status} (worker may not be running)"
    echo "Start worker: pnpm --filter @repo/worker dev" >&2
    fetch_run_events "${prod_run_id}"
  fi
  run_json="$(api GET "/v1/scrape-runs/${prod_run_id}")"
  echo "${run_json}" > "${RUNS_DIR}/${prod_run_id}.json"

  samples="$(get_sample_items "${ds_id}" 2>/dev/null || echo '[]')"

  jq -n \
    --arg name "${name}" \
    --arg baseUrl "${base_url}" \
    --arg dataSourceId "${ds_id}" \
    --arg probeRunId "${probe_run_id}" \
    --arg prodRunId "${prod_run_id}" \
    --argjson profile "${profile_json}" \
    --argjson run "${run_json}" \
    --argjson samples "${samples}" \
    '{
      name: $name,
      baseUrl: $baseUrl,
      dataSourceId: $dataSourceId,
      probeRunId: $probeRunId,
      prodRunId: $prodRunId,
      profile: $profile,
      run: $run,
      samples: $samples
    }'
}

incremental_check () {
  local ds_id="$1" base_url="$2" name="$3"
  local run1 run2 row1 row2
  local r1 r2 status1 status2

  r1="$(api POST "/v1/data-sources/${ds_id}/prod-run")"
  run1="$(echo "${r1}" | jq -r '.runId')"
  status1="$(poll_run "${run1}")"
  row1="$(api GET "/v1/scrape-runs/${run1}")"
  echo "${row1}" > "${RUNS_DIR}/${run1}.json"

  r2="$(api POST "/v1/data-sources/${ds_id}/prod-run")"
  run2="$(echo "${r2}" | jq -r '.runId')"
  status2="$(poll_run "${run2}")"
  row2="$(api GET "/v1/scrape-runs/${run2}")"
  echo "${row2}" > "${RUNS_DIR}/${run2}.json"

  local new1 new2
  new1="$(echo "${row1}" | jq -r '.itemsNew // .items_new // 0')"
  new2="$(echo "${row2}" | jq -r '.itemsNew // .items_new // 0')"

  jq -n --arg run1 "${run1}" --arg run2 "${run2}" --argjson new1 "${new1}" --argjson new2 "${new2}" \
    '{ run1: $run1, run2: $run2, items_new_run1: $new1, items_new_run2: $new2 }'
}

removals_check () {
  local ds_id="$1"
  local r run_id row removed
  r="$(api POST "/v1/data-sources/${ds_id}/prod-run")"
  run_id="$(echo "${r}" | jq -r '.runId')"
  poll_run "${run_id}" >/dev/null
  row="$(api GET "/v1/scrape-runs/${run_id}")"
  removed="$(echo "${row}" | jq -r '.itemsRemoved // .items_removed // 0')"
  jq -n --arg runId "${run_id}" --argjson removed "${removed}" '{ runId: $runId, items_removed: $removed }'
}

main () {
  ensure_env
  check_postgres
  check_redis
  run_migrations
  start_services
  check_api
  ensure_customer

  local fixtures_json incremental_json removals_json
  local failures=0

  if [[ "${RUN_REMOVALS_ONLY}" -eq 0 ]]; then
    fixtures_json="$(jq -n --argjson arr "[]" '$arr')"
    local f1 f2 f3
    f1="$(run_fixture "Riddermark" "${RIDDERMARK_LISTING}" || echo '{}')"
    [[ "${f1}" == "{}" ]] && failures=$((failures+1))
    f2="$(run_fixture "Ivars" "${IVARS_LISTING}" || echo '{}')"
    [[ "${f2}" == "{}" ]] && failures=$((failures+1))
    f3="$(run_fixture "Jonassons" "${JONASSONS_LISTING}" || echo '{}')"
    [[ "${f3}" == "{}" ]] && failures=$((failures+1))
    fixtures_json="$(jq -n --argjson a "${f1}" --argjson b "${f2}" --argjson c "${f3}" '[ $a, $b, $c ]')"

    # Incremental: use Ivars
    local ds_id
    ds_id="$(echo "${f2}" | jq -r '.dataSourceId')"
    if [[ -n "${ds_id}" && "${ds_id}" != "null" ]]; then
      incremental_json="$(incremental_check "${ds_id}" "${IVARS_LISTING}" "Ivars")"
    else
      incremental_json="null"
    fi
  else
    fixtures_json="[]"
    incremental_json="null"
  fi

  # Removals check
  local ds_id_for_removals
  ds_id_for_removals="$(api GET "/v1/data-sources" | jq -r --arg baseUrl "${IVARS_LISTING}" '.data[] | select(.baseUrl==$baseUrl) | .id' | head -n1)"
  if [[ -n "${ds_id_for_removals}" ]]; then
    removals_json="$(removals_check "${ds_id_for_removals}")"
  else
    removals_json="null"
  fi

  local report
  report="$(jq -n \
    --arg customerId "${CUSTOMER_ID}" \
    --arg apiBaseUrl "${API_BASE_URL}" \
    --arg redisUrl "${REDIS_URL}" \
    --arg databaseUrl "${DATABASE_URL}" \
    --argjson fixtures "${fixtures_json}" \
    --argjson incremental "${incremental_json}" \
    --argjson removals "${removals_json}" \
    '{
      customerId: $customerId,
      apiBaseUrl: $apiBaseUrl,
      redisUrl: $redisUrl,
      databaseUrl: $databaseUrl,
      fixtures: $fixtures,
      incremental: $incremental,
      removals: $removals
    }')"

  echo "${report}" > "${OUT_DIR}/validate_report.json"

  {
    echo "== Local Validation Report =="
    echo "customer_id=${CUSTOMER_ID}"
    echo ""
    echo "-- Fixtures --"
    echo "${report}" | jq -r '.fixtures[] | "\(.name): items_seen=\(.run.itemsSeen // .run.items_seen // 0) items_new=\(.run.itemsNew // .run.items_new // 0) items_removed=\(.run.itemsRemoved // .run.items_removed // 0)"'
    echo ""
    echo "-- Incremental --"
    echo "${report}" | jq -r 'if .incremental == null then "skipped" else "run1 new=\(.incremental.items_new_run1) run2 new=\(.incremental.items_new_run2)" end'
    echo ""
    echo "-- Removals --"
    echo "${report}" | jq -r 'if .removals == null then "skipped" else "items_removed=\(.removals.items_removed) run_id=\(.removals.runId)" end'
    if [[ "${RUN_REMOVALS_ONLY}" -eq 1 ]]; then
      echo "Note: If items_removed=0, restart worker with SIMULATE_REMOVALS=1 and re-run --removals-only."
    fi
    echo ""
    echo "-- Issues --"
    if [[ -s "${ISSUES_FILE}" ]]; then
      cat "${ISSUES_FILE}"
    else
      echo "none"
    fi
  } > "${OUT_DIR}/validate_report.txt"

  echo "Report: ${OUT_DIR}/validate_report.json"
  echo "Summary: ${OUT_DIR}/validate_report.txt"

  if [[ "${RUN_REMOVALS_ONLY}" -eq 1 ]]; then
    exit 0
  fi

  # Exit non-zero if all fixtures failed
  if [[ "${failures}" -ge 3 ]]; then
    log_issue "All fixtures failed."
    exit 1
  fi

  # Incremental soft assertion: new count should decrease meaningfully
  if [[ "${RUN_REMOVALS_ONLY}" -eq 0 && "${incremental_json}" != "null" ]]; then
    local new1 new2
    new1="$(echo "${incremental_json}" | jq -r '.items_new_run1')"
    new2="$(echo "${incremental_json}" | jq -r '.items_new_run2')"
    if [[ "${new1}" =~ ^[0-9]+$ && "${new2}" =~ ^[0-9]+$ && "${new1}" -gt 0 ]]; then
      local threshold=$(( new1 * 9 / 10 ))
      if (( threshold < 5 )); then threshold=5; fi
      if (( new2 > threshold )); then
        log_issue "Incremental check failed (run2 new=${new2} > threshold=${threshold})."
        exit 2
      fi
    fi
  fi

  exit 0
}

main
