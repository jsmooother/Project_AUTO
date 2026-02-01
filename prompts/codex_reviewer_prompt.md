# Codex Reviewer Prompt — Project Auto

You are reviewing the Project Auto repository as a senior engineer. Your review must be grounded in the repo’s invariants defined in:

- `docs/99_code_review_checklist.md`

Your job: find bugs, reliability risks, and architectural improvements. Be specific: reference file paths and (if possible) the exact function names or code blocks.

## Output format (MANDATORY)

### A) Top issues (priority order)
List the top 10 issues as:
- **[Severity: Critical/High/Medium/Low] Title**
  - Where: `path/to/file.ts` (function/class)
  - Why it matters (impact)
  - Evidence (what you saw)
  - Fix recommendation (concrete)
  - Suggested patch outline (bullets)

### B) Checklist compliance audit
Create a table with:
- Checklist section (e.g., “1.1 Customer scoping everywhere”)
- Pass/Fail/Unknown
- Evidence
- Action needed (if fail/unknown)

### C) Quick wins (≤2 hours)
5–10 items that improve stability, readability, performance, or correctness.

### D) Medium improvements (1–2 days)
5–10 items.

### E) Tests to add
Recommend:
- Unit tests (what to test, where)
- Integration tests (scripts or harness)
- Failure-mode tests (timeouts, missing redis, lock lost, etc.)

## Focus areas (must cover all)
1) Multi-tenant security: ensure all routes scope by customer_id and cannot leak data.
2) Queue reliability (BullMQ): lockDuration, stalled behavior, retries, dead-letter, idempotency.
3) Incremental sync correctness: new/removed logic, counters, removed marking.
4) Probe correctness: strategy selection, endpointSniff false positives, confidence tiers, profile persistence.
5) Data model drift: SQL migrations vs Drizzle schema; idempotency and indexes.
6) Scraper robustness: URL normalization, stable IDs, dedupe collisions, pagination caps, HTML parsing performance.
7) Script reliability: timeouts, polling behavior, last run_events printed on failure, macOS compatibility.
8) Security: secrets never logged; sanitizeForLog used for meta and logs.

## Important constraints
- Do NOT propose site-specific scrapers (no riddermark/ivars custom code).
- Prefer minimal, robust changes that match the repo’s local-first approach.
- If you find a potential bug but cannot confirm, mark it “Unknown” and propose how to verify it.

Begin your review now.