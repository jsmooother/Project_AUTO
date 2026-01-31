# Project Brief — Internet Broker MVP (IB Crawler)

## Target in year 1
- 50 customers
- 50 sites crawled nightly

## MVP capabilities
- Multi-tenant auth and customer management
- Data source management (sites to crawl)
- Test runs + production runs
- Run reporting and history (success/failure, diffs, counts)
- Catalog creation (filtering, activation)
- Meta catalog sync
- Campaign/ad generation using templates
- Template creation with overlay text/logo/etc.
- Support intake: customer tickets + auto-attached run context

## Non-goals (initially)
- Real-time crawling (nightly is enough)
- Full self-healing agents that take actions without human approval

## Migration requirement
Code must be ready for later migration to Google Cloud or AWS by:
- Keeping DB schema pure Postgres
- Abstracting queue and storage behind adapters
- Running all workers as Docker containers