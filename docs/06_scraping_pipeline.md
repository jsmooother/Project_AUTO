# Scraping Pipeline

## Self-service flow

Scraping is **self-service**: the user provides a URL; the system determines how to (a) discover all ad URLs and (b) extract ad details via an **Onboarding Probe** (SOURCE_PROBE) and a persisted **SiteProfile** per data source. No site-specific hardcoding.

1. **Probe** (POST `/v1/data-sources/:id/probe`): Tries discovery strategies (sitemap → html_links → endpoint_sniff → headless_listing) and samples detail pages. Writes **SiteProfile** into `data_sources.config_json`.
2. **SCRAPE_PROD** (POST `/v1/data-sources/:id/prod-run`): Uses stored profile for discovery, upsert, detail fetch (new items only), and removal marking.

## Discovery strategies

1. **sitemap** — fetch robots.txt, parse `Sitemap:` lines; fetch sitemap XML(s); extract `<loc>` URLs; filter by detail patterns
2. **html_links** — fetch seed URLs; parse `<a href>`; follow pagination (rel=next, ?page=, /page/2); optionally detect "load more" endpoints
3. **endpoint_sniff** — harvest URLs from HTML, scripts, JSON-LD; optionally fetch hinted endpoints (wp-json, api, etc.) with per-seed caps
4. **headless_listing** — use Playwright to render listing; click "load more" if present; extract anchors (requires `HEADLESS_ENABLED=1`)

## Drivers vs extractors

- **Drivers** (apps/worker/src/lib/drivers): how we fetch — HTTP (Node fetch) or headless (Playwright). Interface: `Driver.fetch(url, opts) -> FetchResult`.
- **Extractors** (apps/worker/src/lib/extractors): how we parse — generic + vehicle. No per-site CSS; schema.org, label-driven parsing, heuristics.

## SCRAPE_PROD pipeline stages (emit run_events)

1. **load_data_source** — load data source and SiteProfile
2. **discovery** — DISCOVERY_START, DISCOVERY_DONE (strategy, discoveredCount)
3. **diff** — DIFF_DONE (upsertedCount, discoveredCount); upsert seen markers
4. **details** — DETAILS_START, DETAILS_DONE; fetch detail only for new items (`detail_fetched_at IS NULL`)
5. **removals** — REMOVALS_DONE (removedCount); mark items that disappeared
6. **finalize** — SCRAPE_PROD_SUCCESS / SCRAPE_PROD_FAIL

When headless is used: HEADLESS_USED (meta: provider, mode, reason).

## SOURCE_PROBE pipeline stages

1. **probe** — PROBE_START, PROBE_STRATEGY_SELECTED, PROBE_DONE; try strategies, sample detail pages, persist SiteProfile
2. When headless_listing selected: HEADLESS_USED, probe notes record "Headless listing selected by probe"

## Failure handling

- Always update scrape_runs: status=failed, error_code, error_message
- Write at least one run_event on failure
- Save repro bundles (http_trace, html_sample) when possible; never store secrets

## Output requirements

- scrape_runs: items_seen, items_new, items_removed
- items: last_seen_at, last_seen_run_id, detail_fetched_at, content_hash
- Items absent from discovery → is_active=false, removed_at set
