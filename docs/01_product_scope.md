# Product Scope (MVP)

## Entities
- Customer (tenant)
- User (belongs to customer; role-based)
- Data Source (site to crawl)
- Scrape Run (test/prod)
- Item (normalized inventory record)
- Catalog (filtered view of items)
- Meta Sync Job
- Campaign / AdSet / Ad (internal representation)
- Template (overlay rules/assets)
- Support Case
- Run Events (structured logs in DB)
- Repro Bundles (debug artifacts stored in object storage)

## Key user flows
1) Onboard customer -> add data source -> run TEST crawl -> confirm -> enable nightly PROD crawl
2) Review run history -> see new/updated/deleted items -> update catalog filters
3) Sync catalog to Meta -> generate campaigns from template -> monitor status
4) Customer reports issue -> support case auto-attaches last run context -> rerun test crawl

## Key system flows
- Nightly scheduler enqueues scrape jobs for active data sources
- Worker executes scrape job -> stores run results + items + run events + repro bundles (if failure)
- Catalog changes enqueue meta sync jobs
- Meta sync worker updates Meta catalog and/or campaigns
- Template rendering worker generates creatives / previews