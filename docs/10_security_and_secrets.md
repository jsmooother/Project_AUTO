# Security and Secrets

## Secrets policy
- No secrets in DB.
- Secrets live in:
  - Supabase secrets (if applicable)
  - Railway environment variables
  - Vercel environment variables

## Redaction
- Never log tokens, API keys, cookies.
- Repro bundles must be size-limited and redacted.

## Auth
- Supabase Auth initially.
- Roles: admin, operator, customer_user.
- Admin-only ops actions (rerun, throttle, strategy switch).

## Data privacy
- Avoid storing customer PII in logs.
- Any HTML sample must be limited and redacted if risk of PII.