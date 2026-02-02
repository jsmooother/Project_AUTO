-- Migration: 0016_onboarding_states
-- Adds onboarding_states table to track onboarding progress per customer (organization).
-- Tracks step completion flags and provides a derived status field.

-- Create onboarding_states table
CREATE TABLE IF NOT EXISTS onboarding_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  company_info_completed BOOLEAN NOT NULL DEFAULT false,
  budget_info_completed BOOLEAN NOT NULL DEFAULT false,
  company_name TEXT,
  company_website TEXT,
  monthly_budget_amount NUMERIC(12, 2),
  budget_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id)
);

CREATE INDEX IF NOT EXISTS onboarding_states_customer_id_idx ON onboarding_states(customer_id);

-- Add function to compute derived status
CREATE OR REPLACE FUNCTION onboarding_status(
  company_info_completed BOOLEAN,
  budget_info_completed BOOLEAN
) RETURNS TEXT AS $$
BEGIN
  IF company_info_completed AND budget_info_completed THEN
    RETURN 'completed';
  ELSIF company_info_completed OR budget_info_completed THEN
    RETURN 'in_progress';
  ELSE
    RETURN 'not_started';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
