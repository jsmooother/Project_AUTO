# MVP Backlog (Implementation Order)

## Week 1: Foundation
- Repo setup (monorepo optional)
- Postgres schema + migrations
- Queue adapter + Redis implementation
- Storage adapter + Supabase Storage implementation
- run_events + error_taxonomy + repro_bundles tables
- Logging wrapper with correlation IDs

## Week 2: Scrape test run
- Data source CRUD
- Enqueue SCRAPE_TEST
- Worker skeleton: fetch -> parse -> normalize -> store test results
- Run history view for test runs
- Failure repro bundle creation

## Week 3: Production runs + nightly scheduler
- SCRAPE_PROD runs
- Diff stats (new/updated/deleted)
- Nightly schedule (cron triggers enqueue)
- Concurrency controls

## Week 4: Catalogs
- Catalog rules + catalog view
- Activate catalog -> enqueue META_SYNC_CATALOG

## Week 5: Meta sync
- Meta account setup
- Catalog sync job + retries/throttling
- meta_jobs tracking + repro payload bundles

## Week 6: Templates + support
- Template CRUD + preview rendering job
- Support cases UI + internal support console
- Rerun test crawl action