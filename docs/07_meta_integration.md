# Meta Integration

## Capabilities
- Sync catalog items to Meta catalog
- Create campaigns/adsets/ads (manual or templated)
- Throttle and retry on rate limits

## Required safety
- Never store Meta access tokens in DB; store in secrets manager / platform secrets.
- Redact all payload logs.

## Sync model
- Compute diff: items added/updated/removed since last sync
- Enqueue META_SYNC_CATALOG job with diff summary
- Worker applies changes and records meta_jobs + run_events

## Error handling
- Map Meta errors into event_code taxonomy:
  - META_401_AUTH, META_429_RATE_LIMIT, META_400_VALIDATION, etc.
- Save repro bundle: meta_payload.json (redacted) + response subset