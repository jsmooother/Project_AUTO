-- Migration: 0021_ads_tables
-- Add ad_settings, ad_runs, meta_ad_objects for Ads (Meta) module.

-- 1) ad_settings (ONE per customer)
CREATE TABLE IF NOT EXISTS ad_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  geo_mode TEXT NOT NULL DEFAULT 'radius', -- 'radius' | 'regions'
  geo_center_text TEXT, -- e.g. "New York, NY" for radius mode
  geo_radius_km INTEGER, -- radius in km
  geo_regions_json JSONB, -- array of region codes/names for regions mode
  formats_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of format strings: ["feed", "stories", "reels", etc.]
  cta_type TEXT NOT NULL DEFAULT 'learn_more', -- CTA button type
  budget_override NUMERIC(20, 4), -- override monthly budget (null = use onboarding default)
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'ready' | 'active' | 'error'
  last_synced_at TIMESTAMPTZ,
  last_published_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ad_settings_customer_id_idx ON ad_settings(customer_id);
CREATE INDEX IF NOT EXISTS ad_settings_status_idx ON ad_settings(status);

-- 2) ad_runs (mirrors crawl_runs lifecycle)
CREATE TABLE IF NOT EXISTS ad_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual', 'scheduled')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ad_runs_customer_id_idx ON ad_runs(customer_id);
CREATE INDEX IF NOT EXISTS ad_runs_created_at_idx ON ad_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS ad_runs_status_idx ON ad_runs(status);

-- 3) meta_ad_objects (ONE per customer)
CREATE TABLE IF NOT EXISTS meta_ad_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  catalog_id TEXT, -- Meta catalog ID
  campaign_id TEXT, -- Meta campaign ID
  adset_id TEXT, -- Meta ad set ID
  ad_id TEXT, -- Meta ad ID
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'active' | 'paused' | 'error'
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS meta_ad_objects_customer_id_idx ON meta_ad_objects(customer_id);
CREATE INDEX IF NOT EXISTS meta_ad_objects_status_idx ON meta_ad_objects(status);
