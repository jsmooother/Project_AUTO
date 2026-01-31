# Data Model (Postgres)

## Tenancy
All rows that belong to a customer must include customer_id.

## Tables (high-level)
- customers(id, name, status, created_at)
- users(id, customer_id, email, role, created_at)

- data_sources(id, customer_id, name, base_url, strategy, schedule_enabled, schedule_cron, max_items, created_at, updated_at)

- scrape_runs(id, customer_id, data_source_id, run_type[test|prod], status, started_at, finished_at, items_found, items_new, items_updated, items_deleted, error_code, error_message)

- items(id, customer_id, data_source_id, source_item_id, title, price, currency, url, image_url, attributes_json, hash, is_active, first_seen_at, last_seen_at, updated_at)
  - unique(customer_id, data_source_id, source_item_id)

- catalogs(id, customer_id, name, is_active, rules_json, created_at, updated_at)
- catalog_items(catalog_id, item_id) OR computed view approach (choose one for MVP; can evolve)

- meta_accounts(id, customer_id, meta_ad_account_id, meta_catalog_id, status, created_at)
- meta_jobs(id, customer_id, catalog_id, job_type, status, started_at, finished_at, error_code, error_message)

- templates(id, customer_id, name, config_json, created_at, updated_at)
- template_assets(id, customer_id, template_id, storage_key, asset_type, created_at)

- campaigns(id, customer_id, meta_campaign_id, name, status, config_json, created_at)
- adsets(id, customer_id, meta_adset_id, campaign_id, name, status, config_json)
- ads(id, customer_id, meta_ad_id, adset_id, name, status, creative_json)

## Support and Observability
- support_cases(...) see docs/09_observability_and_support.md
- run_events(...) see docs/09_observability_and_support.md
- repro_bundles(...) see docs/09_observability_and_support.md

## Notes
- Store raw scraped fields under attributes_json; keep normalized core fields.
- Use item hash to detect updates.
- Never store secrets in DB tables.