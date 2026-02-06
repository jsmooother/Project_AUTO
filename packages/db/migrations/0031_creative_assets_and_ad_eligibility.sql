-- Migration: 0031_creative_assets_and_ad_eligibility
-- Add ad eligibility flag to inventory_items and create creative_assets + customer_branding tables.

-- Add isAdEligible flag to inventory_items (default true for backward compatibility)
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS is_ad_eligible BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS inventory_items_customer_ad_eligible_idx 
  ON inventory_items(customer_id, is_ad_eligible) 
  WHERE is_ad_eligible = true;

-- Creative assets table: stores generated creative images (feed, story, reel variants)
CREATE TABLE IF NOT EXISTS creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image')),
  variant TEXT NOT NULL CHECK (variant IN ('feed', 'story', 'reel', 'square')),
  source_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  width INTEGER,
  height INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS creative_assets_customer_id_idx ON creative_assets(customer_id);
CREATE INDEX IF NOT EXISTS creative_assets_inventory_item_id_idx ON creative_assets(inventory_item_id);
CREATE INDEX IF NOT EXISTS creative_assets_status_idx ON creative_assets(status);
CREATE UNIQUE INDEX IF NOT EXISTS creative_assets_item_variant_idx 
  ON creative_assets(inventory_item_id, variant) 
  WHERE status = 'generated';

COMMENT ON TABLE creative_assets IS 'Generated creative images for Meta ads (feed 1.91:1, story/reel 9:16, square 1:1)';
COMMENT ON COLUMN creative_assets.type IS 'Asset type (currently only "image")';
COMMENT ON COLUMN creative_assets.variant IS 'Format variant: feed (1.91:1), story/reel (9:16), square (1:1)';
COMMENT ON COLUMN creative_assets.source_image_url IS 'Original scraped image URL';
COMMENT ON COLUMN creative_assets.generated_image_url IS 'Supabase Storage URL of generated creative';
COMMENT ON COLUMN creative_assets.status IS 'pending|generated|failed';

-- Customer branding table: stores logo and brand colors per customer
CREATE TABLE IF NOT EXISTS customer_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_branding_customer_id_idx ON customer_branding(customer_id);

COMMENT ON TABLE customer_branding IS 'Customer branding assets (logo, colors) for creative generation';
COMMENT ON COLUMN customer_branding.logo_url IS 'Supabase Storage URL of customer logo';
