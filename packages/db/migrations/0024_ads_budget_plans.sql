-- Migration: 0024_ads_budget_plans
-- Internal pricing & spend control: customer price, Meta cap, margin (admin-only).

CREATE TABLE IF NOT EXISTS ads_budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_monthly_price NUMERIC(20, 4) NOT NULL,
  meta_monthly_cap NUMERIC(20, 4) NOT NULL,
  margin_percent NUMERIC(5, 2) NOT NULL,
  pacing TEXT NOT NULL DEFAULT 'daily' CHECK (pacing IN ('daily', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ads_budget_plans_customer_id_idx ON ads_budget_plans(customer_id);
CREATE INDEX IF NOT EXISTS ads_budget_plans_status_idx ON ads_budget_plans(status);
