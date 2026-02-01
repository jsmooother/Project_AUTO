# Incremental sync and self-service scraping

## Overview

Scraping is **self-service**: the user provides a URL; the system determines how to (a) discover all ad URLs and (b) extract ad details via an **Onboarding Probe** and a persisted **SiteProfile** per data source. No site-specific hardcoding.

## Flow

1. **Probe** (POST `/v1/data-sources/:id/probe`): Tries discovery strategies (sitemap → html_links → endpoint_sniff → headless_listing) and samples a few detail pages to choose extract rules. Writes a **SiteProfile** into `data_sources.config_json`.
2. **SCRAPE_PROD** (POST `/v1/data-sources/:id/prod-run`): Uses the stored profile:
   - **Discover** current set of ad IDs/URLs (cheap).
   - **Upsert** “seen” markers (`last_seen_at`, `last_seen_run_id`, `is_active=true`).
   - **Fetch detail** only for **new** items (`detail_fetched_at IS NULL`), limited by `limits.maxNewPerRun`.
   - **Mark removed** items that disappeared from discovery (`is_active=false`, `removed_at`).
   - Update **scrape_runs** counters: `items_seen`, `items_new`, `items_removed`.

Incremental runs only fetch detail pages for new items; existing items are not re-fetched every run. A later TTL/refresh for changed ads can be added.

## SiteProfile (config_json)

Stored under `data_sources.config_json`:

- **profileVersion**, **probe** (testedAt, confidence, notes)
- **discovery**: strategy, seedUrls, sitemapUrls, detailUrlPatterns, idFromUrl
- **fetch**: driver (http | headless), http/headless options
- **extract**: vertical (vehicle | generic), strategy, optional rules
- **limits**: concurrency, maxNewPerRun, politenessDelayMs, maxPages

## Drivers vs extractors

- **Drivers** (apps/worker/src/lib/drivers): how we fetch (HTTP, headless stub). Interface: `Driver.fetch(url, opts) -> FetchResult`.
- **Extractors** (apps/worker/src/lib/extractors): how we parse (generic + vehicle). No per-site CSS; schema.org, label-driven parsing, heuristics. Optional profile.extract.rules from probe.

## Fixtures

- **Riddermark**: listing + detail in HTML.
- **Ivars** (ivarsbil.se/bilar-i-lager): listing may not contain inventory in HTML; probe can pick sitemap or html_links or headless.
- **Jonassons** (jonassonsbil.se/fordon-i-lager): same idea.

## Validation scripts

- **scripts/probe-and-prod.sh**: Creates data sources for Riddermark, Ivars, Jonassons; runs probe then SCRAPE_PROD; prints strategy and run counters.
- **scripts/prod-run-twice.sh**: For one site (default Ivars), runs SCRAPE_PROD twice; expects run2 `items_new` ≈ 0.
- **scripts/validate-local.sh**: One-command local validation harness (probe → profile → prod → incremental → removals). See `docs/22_local_validation.md`.

Set **SIMULATE_REMOVALS=1** on the worker to drop 10% of discovered URLs before upsert so removal logic is exercised (`is_active=false`, `removed_at`).

## Run events

Probe: PROBE_START, PROBE_STRATEGY_SELECTED, PROBE_DONE.  
SCRAPE_PROD: DISCOVERY_START, DISCOVERY_DONE, DIFF_DONE, DETAILS_START, DETAILS_DONE, REMOVALS_DONE, SCRAPE_PROD_SUCCESS / SCRAPE_PROD_FAIL, ITEM_DETAIL_OK / ITEM_DETAIL_FAIL.
