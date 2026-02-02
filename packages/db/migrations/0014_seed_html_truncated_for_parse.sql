-- Migration: 0014_seed_html_truncated_for_parse
-- Adds HTML_TRUNCATED_FOR_PARSE to error_taxonomy for HTML size cap warnings.

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('HTML_TRUNCATED_FOR_PARSE', 'scrape', 'warn', 'HTML truncated for parsing to prevent memory/stability issues', 'docs/06_scraping_pipeline.md')
ON CONFLICT (event_code) DO NOTHING;
