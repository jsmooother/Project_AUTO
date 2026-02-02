-- Migration: 0017_inventory_sources_crawl_runs_items
-- Adds inventory_sources, crawl_runs, inventory_items for stub crawl pipeline (Milestone 2).

-- 1) inventory_sources (one active source per customer in MVP)
CREATE TABLE IF NOT EXISTS inventory_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_crawled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id)
);

CREATE INDEX IF NOT EXISTS inventory_sources_customer_id_idx ON inventory_sources(customer_id);

-- 2) crawl_runs
CREATE TABLE IF NOT EXISTS crawl_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  inventory_source_id UUID NOT NULL REFERENCES inventory_sources(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual', 'scheduled')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crawl_runs_customer_id_idx ON crawl_runs(customer_id);
CREATE INDEX IF NOT EXISTS crawl_runs_inventory_source_id_idx ON crawl_runs(inventory_source_id);
CREATE INDEX IF NOT EXISTS crawl_runs_created_at_idx ON crawl_runs(created_at DESC);

-- 3) inventory_items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  inventory_source_id UUID NOT NULL REFERENCES inventory_sources(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  title TEXT,
  url TEXT,
  price INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'new', 'removed')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, inventory_source_id, external_id)
);

CREATE INDEX IF NOT EXISTS inventory_items_customer_id_idx ON inventory_items(customer_id);
CREATE INDEX IF NOT EXISTS inventory_items_inventory_source_id_idx ON inventory_items(inventory_source_id);
