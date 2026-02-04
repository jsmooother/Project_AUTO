-- Migration: 0027_ads_budget_plan_billing_mode
-- Extend ads_budget_plans with billing mode and lever guardrails.

ALTER TABLE ads_budget_plans ADD COLUMN IF NOT EXISTS billing_mode TEXT NOT NULL DEFAULT 'time_based' CHECK (billing_mode IN ('time_based', 'impression_based'));
ALTER TABLE ads_budget_plans ADD COLUMN IF NOT EXISTS customer_cpm_sek NUMERIC(20, 4) NULL;
ALTER TABLE ads_budget_plans ADD COLUMN IF NOT EXISTS lever_min_margin_percent INTEGER NOT NULL DEFAULT 60;
ALTER TABLE ads_budget_plans ADD COLUMN IF NOT EXISTS lever_max_margin_percent INTEGER NOT NULL DEFAULT 80;
ALTER TABLE ads_budget_plans ADD COLUMN IF NOT EXISTS lever_min_meta_ratio NUMERIC(5, 4) NOT NULL DEFAULT 0.20;
ALTER TABLE ads_budget_plans ADD COLUMN IF NOT EXISTS lever_max_meta_ratio NUMERIC(5, 4) NOT NULL DEFAULT 0.40;
