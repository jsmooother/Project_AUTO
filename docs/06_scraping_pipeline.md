# Scraping Pipeline

## Strategies (progressive)
1) HTTP fetch + parse (cheapest)
2) Headless browser (Playwright) when required
3) AgentQL or other advanced tools only for hard sites

## Pipeline stages (must emit run_events)
1. validate_source_config
2. fetch_list_pages (pagination/scroll)
3. extract_list_items
4. fetch_detail_pages (optional)
5. normalize_fields
6. upsert_items
7. compute_diff_stats
8. finalize_run

## Failure handling
- Always update scrape_runs status = failed + error_code
- Save repro bundles on error:
  - http_trace.json (urls + status + timing)
  - html_sample.html (limited size)
  - screenshot.png (if browser-based)
  - parser_config.json

## Output requirements
- items_new / items_updated / items_deleted computed per run
- last_seen_at updated for items present
- items absent for N runs can be marked inactive (policy configurable)