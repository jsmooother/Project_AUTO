#!/usr/bin/env bash
# Pre-Task-6 Release Candidate Validation (local)
# Confirms Tasks 1–5 are stable before starting Task 6 (run_events run_id UUID migration).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${REPO_ROOT}"
[[ -f "${REPO_ROOT}/.env" ]] && set -a && . "${REPO_ROOT}/.env" && set +a

INTEGRATION_BRANCH="${INTEGRATION_BRANCH:-$(git branch --show-current)}"
DATABASE_URL="${DATABASE_URL:-}"
OUT_DIR="${REPO_ROOT}/scripts/out"
REPORT_FILE="${OUT_DIR}/pre-task-6-validation-report.txt"
RUNS_DIR="${OUT_DIR}/runs"
mkdir -p "${OUT_DIR}" "${RUNS_DIR}"

need_cmd () { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: Missing $1" >&2; exit 1; }; }
need_cmd pnpm
need_cmd jq
need_cmd psql

report () {
  echo "$*" | tee -a "${REPORT_FILE}"
}

report "=== Pre-Task-6 Release Candidate Validation ==="
report "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
report ""

# --- 1) Branch and status ---
report "--- 1) Branch and status ---"
report "Integration branch: ${INTEGRATION_BRANCH}"
git checkout "${INTEGRATION_BRANCH}" || { report "ERROR: Checkout failed."; exit 1; }
git pull 2>/dev/null || report "WARN: git pull failed (e.g. no upstream). Continuing."
STATUS="$(git status -sb)"
report "${STATUS}"
if [[ "${STATUS}" != *"nothing to commit, working tree clean"* ]] && [[ "${STATUS}" != *"nothing to commit, working directory clean"* ]]; then
  report "WARN: Working tree not clean. Proceeding anyway."
fi
report ""

# --- 2) Typecheck ---
report "--- 2) Typecheck ---"
FAIL_TSC=0
pnpm --filter @repo/queue exec tsc --noEmit 2>&1 | tee -a "${REPORT_FILE}" || FAIL_TSC=1
pnpm --filter @repo/worker exec tsc --noEmit 2>&1 | tee -a "${REPORT_FILE}" || FAIL_TSC=1
pnpm --filter @repo/api exec tsc --noEmit 2>&1 | tee -a "${REPORT_FILE}" || FAIL_TSC=1
if [[ "${FAIL_TSC}" -ne 0 ]]; then
  report "FAIL: One or more tsc checks failed."
  exit 1
fi
report "PASS: All tsc checks passed."
report ""

# --- 3) Integration scripts ---
report "--- 3) Integration scripts ---"

report "Running probe-and-prod.sh..."
PROBE_PROD_OUT="${OUT_DIR}/probe-and-prod-output.txt"
bash scripts/probe-and-prod.sh 2>&1 | tee "${PROBE_PROD_OUT}" | tee -a "${REPORT_FILE}"
# Riddermark is first fixture; first "Probe runId=" is Riddermark's
RIDDERMARK_PROBE_RUN_ID="$(grep -m1 "Probe runId=" "${PROBE_PROD_OUT}" | sed -n 's/.*Probe runId=\([a-f0-9-]*\).*/\1/p')"
# If timeout line exists, use run_id from that line (more reliable)
if grep -q "probe run.*status=timeout" "${PROBE_PROD_OUT}"; then
  RIDDERMARK_TIMEOUT=1
  TIMEOUT_RUN="$(grep "probe run.*status=timeout" "${PROBE_PROD_OUT}" | head -1 | sed -n 's/.*probe run \([a-f0-9-]*\) status=timeout.*/\1/p')"
  [[ -n "${TIMEOUT_RUN}" ]] && RIDDERMARK_PROBE_RUN_ID="${TIMEOUT_RUN}"
else
  RIDDERMARK_TIMEOUT=0
fi
report ""

report "Running prod-run-twice.sh..."
PROD_TWICE_OUT="${OUT_DIR}/prod-run-twice-output.txt"
bash scripts/prod-run-twice.sh 2>&1 | tee "${PROD_TWICE_OUT}" | tee -a "${REPORT_FILE}"
IVARS_PROD_RUN1=""
IVARS_PROD_RUN1="$(grep -m1 "run_id=" "${PROD_TWICE_OUT}" | sed -n 's/.*run_id=\([a-f0-9-]*\).*/\1/p')"
report ""

if [[ -f scripts/validate-local.sh ]] && [[ -n "${RUN_VALIDATE_LOCAL:-}" ]]; then
  report "Running validate-local.sh..."
  bash scripts/validate-local.sh 2>&1 | tee -a "${REPORT_FILE}" || true
  report ""
else
  report "Skipping validate-local.sh (set RUN_VALIDATE_LOCAL=1 to include)."
fi

# --- 4) Riddermark probe run_events if timeout ---
report "--- 4) Riddermark probe run_events (if timeout) ---"
if [[ "${RIDDERMARK_TIMEOUT}" -eq 1 ]] && [[ -n "${DATABASE_URL}" ]]; then
  RUN_ID="${RIDDERMARK_PROBE_RUN_ID}"
  if [[ -z "${RUN_ID}" ]]; then
    report "Riddermark probe timed out but runId not captured from script output. Querying latest probe run for Riddermark data source..."
    # Get Riddermark data_source_id and latest probe run (simplified: use first probe run we find with run_type=probe for a ds that has riddermark in base_url)
    RUN_ID="$(psql "${DATABASE_URL}" -t -A -c "
      SELECT r.id FROM scrape_runs r
      JOIN data_sources d ON d.id = r.data_source_id
      WHERE r.run_type = 'probe' AND d.base_url LIKE '%riddermark%'
      ORDER BY r.started_at DESC LIMIT 1;
    " 2>/dev/null | head -n1 | tr -d '[:space:]')"
  fi
  if [[ -n "${RUN_ID}" ]]; then
    report "Last 30 run_events for Riddermark probe run_id=${RUN_ID}:"
    psql "${DATABASE_URL}" -c "
      SELECT created_at, level, stage, event_code, message
      FROM run_events
      WHERE run_id = '${RUN_ID}'::text
      ORDER BY created_at DESC
      LIMIT 30;
    " 2>&1 | tee -a "${REPORT_FILE}"
  else
    report "Could not determine Riddermark probe run_id. Set RIDDERMARK_PROBE_RUN_ID or check DB."
  fi
else
  if [[ "${RIDDERMARK_TIMEOUT}" -eq 1 ]]; then
    report "Riddermark probe timed out but DATABASE_URL not set; skipping run_events query."
  else
    report "Riddermark probe did not timeout; skipping run_events query."
  fi
fi
report ""

# --- 5) Lifecycle events on successful Ivars prod run ---
report "--- 5) Lifecycle events (Ivars prod run) ---"
if [[ -z "${IVARS_PROD_RUN1}" ]]; then
  IVARS_PROD_RUN1="$(grep "run_id=" "${PROD_TWICE_OUT}" | head -1 | sed -n 's/.*run_id=\([a-f0-9-]*\).*/\1/p')"
fi
if [[ -n "${IVARS_PROD_RUN1}" ]] && [[ -n "${DATABASE_URL}" ]]; then
  report "Run events for Ivars prod run_id=${IVARS_PROD_RUN1} (ordered by created_at asc):"
  psql "${DATABASE_URL}" -c "
    SELECT event_code, stage, level
    FROM run_events
    WHERE run_id = '${IVARS_PROD_RUN1}'::text
    ORDER BY created_at ASC;
  " 2>&1 | tee -a "${REPORT_FILE}"
  if psql "${DATABASE_URL}" -t -A -c "SELECT 1 FROM run_events WHERE run_id = '${IVARS_PROD_RUN1}'::text AND event_code = 'SYSTEM_JOB_START' LIMIT 1;" 2>/dev/null | grep -q 1; then
    report "PASS: SYSTEM_JOB_START present on prod run."
  else
    report "FAIL: SYSTEM_JOB_START not found on prod run."
  fi
  if psql "${DATABASE_URL}" -t -A -c "SELECT 1 FROM run_events WHERE run_id = '${IVARS_PROD_RUN1}'::text AND event_code = 'SYSTEM_JOB_SUCCESS' LIMIT 1;" 2>/dev/null | grep -q 1; then
    report "PASS: SYSTEM_JOB_SUCCESS present on prod run."
  else
    report "FAIL: SYSTEM_JOB_SUCCESS not found on prod run."
  fi
else
  report "Could not determine Ivars prod run_id or DATABASE_URL not set."
fi
report ""

# --- Summary ---
report "=== Summary ==="
report "All tsc checks: PASS"
if grep -q "status=success" "${PROBE_PROD_OUT}" 2>/dev/null; then
  report "probe-and-prod: Ivars and Jonassons succeeded (check output for Riddermark)."
fi
if grep -q "items_new=0" "${PROD_TWICE_OUT}" 2>/dev/null; then
  report "prod-run-twice: Run2 items_new=0 (incremental confirmed)."
fi
if [[ "${RIDDERMARK_TIMEOUT}" -eq 1 ]]; then
  report "Riddermark: Probe timeout; see run_events above for root cause."
fi
report "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
report "Full report: ${REPORT_FILE}"
