# Observability and Support (Agent-ready)

## Goals
- Diagnose failures quickly
- Capture structured logs and artifacts
- Support cases auto-attach run context
- Future AI agent can read run history + logs + bundles and suggest fixes

## Tables
### run_events
Fields:
- customer_id, job_type, job_id, run_id, data_source_id
- level, stage, event_code, message, meta(jsonb), created_at

### error_taxonomy
- event_code -> category + severity_default + user_message_template + runbook reference

### repro_bundles
- references files stored in object storage (html sample, http trace, screenshots, payload)

### support_cases
- customer-submitted issues linked to data_source_id and latest run/job
- internal status + severity + assignment

## Correlation ID rule
Any log or event without customer_id + job_id is invalid.

## Support console requirements
For a case:
- show last 3 runs
- show top error codes
- show queue backlog + worker health snapshot
- provide a "rerun test crawl" action (admin-only)

## Agent-readiness (later)
Define read-only ops endpoints:
- /ops/customer/:id/health
- /ops/runs/:runId/summary
- /ops/runs/:runId/events
- /ops/repro/:bundleId/signed-url
Actions remain manual approval initially.