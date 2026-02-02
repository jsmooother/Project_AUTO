-- Migration: 0018_templates_approval_workflow
-- Adds ad_templates, ad_template_configs, ad_previews, preview_runs, approvals (Milestone 3).

-- A) ad_templates (static registry of templates)
CREATE TABLE IF NOT EXISTS ad_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B) ad_template_configs (per customer configuration, one active per customer)
CREATE TABLE IF NOT EXISTS ad_template_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL REFERENCES ad_templates(key) ON DELETE RESTRICT,
  brand_name TEXT,
  primary_color TEXT,
  logo_url TEXT,
  headline_style TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'preview_ready', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ad_template_configs_customer_id_idx ON ad_template_configs(customer_id);
CREATE INDEX IF NOT EXISTS ad_template_configs_template_key_idx ON ad_template_configs(template_key);

-- C) ad_previews (generated outputs per config)
CREATE TABLE IF NOT EXISTS ad_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_config_id UUID NOT NULL REFERENCES ad_template_configs(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  preview_type TEXT NOT NULL DEFAULT 'html' CHECK (preview_type IN ('image', 'html')),
  asset_url TEXT,
  html_content TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ad_previews_customer_id_idx ON ad_previews(customer_id);
CREATE INDEX IF NOT EXISTS ad_previews_template_config_id_idx ON ad_previews(template_config_id);

-- D) preview_runs (like crawl_runs but for preview generation)
CREATE TABLE IF NOT EXISTS preview_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_config_id UUID NOT NULL REFERENCES ad_template_configs(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual', 'system')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS preview_runs_customer_id_idx ON preview_runs(customer_id);
CREATE INDEX IF NOT EXISTS preview_runs_template_config_id_idx ON preview_runs(template_config_id);
CREATE INDEX IF NOT EXISTS preview_runs_created_at_idx ON preview_runs(created_at DESC);

-- E) approvals
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_config_id UUID NOT NULL REFERENCES ad_template_configs(id) ON DELETE CASCADE,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by_user_id UUID,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS approvals_customer_id_idx ON approvals(customer_id);
CREATE INDEX IF NOT EXISTS approvals_template_config_id_idx ON approvals(template_config_id);

-- FK: ad_templates.key must exist before ad_template_configs can reference it. Seed templates first.
INSERT INTO ad_templates (key, name, description, aspect_ratio) VALUES
  ('grid_4', '4-Item Grid', 'Four inventory items in a 2x2 grid layout', '1:1'),
  ('single_hero', 'Single Hero', 'One featured item with large image and CTA', '4:5'),
  ('carousel_3', '3-Item Carousel', 'Three items in a horizontal carousel format', '9:16')
ON CONFLICT (key) DO NOTHING;
