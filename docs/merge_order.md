# Merge order (Codex findings)

## Integration branch

**`review/codex-findings`** is the integration branch. It is kept in sync with `main` until we merge all tasks and Task 6.

## Recommended merge order

1. **Merge Task 1 + Task 2 + Tasks 3–5 into `review/codex-findings`**
   - Merge (or PR) from:
     - `task-1-support-case-tenant-guard`
     - `task-2-guard-removals-on-low-discovery`
     - `tasks-3-5-reliability-observability-hardening`
   - Target branch: **`review/codex-findings`**

2. **Start Task 6 from `review/codex-findings`**
   - Branch for Task 6 (e.g. run_events run_id UUID migration) from `review/codex-findings`, not from `main`.

3. **After Task 6 passes validation**
   - Merge **`review/codex-findings` → `main`**.
   - This avoids ending up with a half-migrated schema on `main`.

## Current state

- **`review/codex-findings`** = same as `main` (clean integration target).
- Task 1, Task 2, and Tasks 3–5 branches exist; merge them into `review/codex-findings` in any order (or together).
- Task 6 will be developed from `review/codex-findings` after those merges.
