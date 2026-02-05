-- Clear all users and inventory data from the database
-- Run: psql $DATABASE_URL -f scripts/clear-all-data.sql

-- Delete run_events first (they have SET NULL constraints, not CASCADE)
DELETE FROM run_events;

-- Delete all customers - this will cascade delete:
-- - users (CASCADE)
-- - sessions (CASCADE)
-- - inventory_sources (CASCADE)
-- - inventory_items (CASCADE)
-- - crawl_runs (CASCADE)
-- - onboarding_states (CASCADE)
-- - and all other customer-scoped tables
DELETE FROM customers;

-- Verify deletion (these should return 0 rows)
SELECT COUNT(*) as remaining_customers FROM customers;
SELECT COUNT(*) as remaining_users FROM users;
SELECT COUNT(*) as remaining_inventory_sources FROM inventory_sources;
SELECT COUNT(*) as remaining_inventory_items FROM inventory_items;
SELECT COUNT(*) as remaining_crawl_runs FROM crawl_runs;
