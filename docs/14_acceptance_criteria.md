# Acceptance Criteria

## Crawling
- 50 sites can be crawled nightly with completion before morning (target window configurable)
- Each run produces:
  - scrape_runs row
  - diff counts
  - run_events timeline
- Failures produce at least 1 repro bundle and an error_code

## Observability
- Every job log/event includes customer_id + job_id
- No secrets appear in logs or repro bundles

## Support
- Customer can create support case from UI
- Case auto-attaches latest run context
- Admin can rerun test crawl from support console

## Portability
- Storage and queue are behind adapters
- No vendor-specific DB dependencies beyond standard Postgres