# Codex Suggested Improvements - Implementation Plan

## Overview

This document outlines the plan to address 5 open issues identified in the Codex audit. All fixes are **additive-only** and **low-risk**, focusing on hardening, consistency, and production readiness.

---

## Issue 1: CORS is Wide-Open with Credentials (Medium)

### Current State
- `apps/api/src/server.ts` line 23: `origin: true` allows **any origin** with credentials
- Risk: CSRF / origin spoofing in production

### Plan
1. **Add `CORS_ORIGIN` env var** (comma-separated list of allowed origins)
2. **Update CORS config** to use allowlist when set, fallback to `true` in dev
3. **Add production warning** if `CORS_ORIGIN` not set in production
4. **Update `.env.example`** with `CORS_ORIGIN` documentation

### Implementation Steps
- Modify `apps/api/src/server.ts`:
  - Parse `CORS_ORIGIN` env var (split by comma, trim, filter empty)
  - Use allowlist if provided, else `true` (dev-friendly)
  - Log warning in production if not set
- Add to `.env.example`: `CORS_ORIGIN=http://localhost:3000,https://yourdomain.com`

### Risk: Low
- Backward compatible (dev still works with `origin: true` fallback)
- Production requires explicit config (good security practice)

---

## Issue 2: Ads Run Dedupe Ignores Running Status (Medium)

### Current State
- `apps/api/src/routes/ads.ts` lines 327 and 375: Only checks `status === "queued"`
- Risk: Multiple overlapping ad runs if one is already running

### Plan
1. **Update dedupe logic** in `/ads/sync` and `/ads/publish` to include `"running"` status
2. **Use `inArray`** like `crawlRuns.ts` does (line 39)

### Implementation Steps
- Import `inArray` from drizzle-orm (already imported in `crawlRuns.ts`)
- Change `eq(adRuns.status, "queued")` to `inArray(adRuns.status, ["queued", "running"])`
- Apply to both `/ads/sync` (line 327) and `/ads/publish` (line 375)

### Risk: Very Low
- Matches existing pattern in `crawlRuns.ts`
- Prevents duplicate runs (desired behavior)

---

## Issue 3: Error Response Shapes Inconsistent (Medium)

### Current State
- **String format**: `{ error: "CODE", message: "..." }` (e.g., `crawlRuns.ts` line 22, `templates.ts` line 52, `inventory.ts` line 45)
- **Object format**: `{ error: { code: "CODE", message: "..." } }` (e.g., `admin.ts`, `ads.ts` line 396)
- Impact: UI must normalize both formats

### Plan
1. **Standardize to object format**: `{ error: { code, message, hint? } }`
2. **Update routes** that use string format:
   - `crawlRuns.ts`: `/runs/crawl` (line 22), `/runs` (line 152)
   - `templates.ts`: `/templates/config` (lines 52, 65)
   - `inventory.ts`: `/inventory/source` (lines 45, 54)
   - `ads.ts`: `/ads/publish` (line 396), `/ads/sync` (line 348)
3. **Keep existing object format** routes unchanged (admin, meta, etc.)

### Implementation Steps
- Create a helper function `sendError(reply, code, message, hint?)` in a shared utils file (optional, or inline)
- Update each route to use object format
- Test that UI still handles errors correctly (it already normalizes both)

### Risk: Low
- UI already handles both formats (see `ErrorBanner` component)
- Standardization improves maintainability
- Can be done incrementally (route by route)

---

## Issue 4: Budget Currency Ignored in Publish Path (Low)

### Current State
- `apps/worker/src/jobs/adsPublish.ts`: Uses `monthlyBudgetAmount` without checking `budgetCurrency`
- Risk: Silent spend-cap mismatch for non-USD customers

### Plan
1. **Load `budgetCurrency`** from `onboardingStates` when seeding budget plan
2. **Validate currency** before using numeric amounts
3. **Fail with CONFIG_ERROR** if currency is not USD (until conversion is supported)

### Implementation Steps
- In `adsPublish.ts` around line 130-142 (where we load onboarding):
  - Add `budgetCurrency` to select
  - After loading onboarding, check `if (onboarding?.budgetCurrency && onboarding.budgetCurrency !== "USD")`
  - Fail with clear message: `"Unsupported budget currency: ${currency}. Use USD for now."`
- Update error message to include currency hint

### Risk: Very Low
- Fails fast with clear error (better than silent mismatch)
- Only affects non-USD customers (likely none in MVP)
- Can be extended later with currency conversion

---

## Issue 5: Lint Command is Non-Deterministic (Low)

### Current State
- `apps/web/package.json` line 11: `"lint": "next lint"`
- `next lint` prompts for ESLint config when missing (blocks CI)

### Plan
1. **Add ESLint config** (`.eslintrc.json` or `.eslintrc.js`)
2. **Switch lint script** to `eslint . --max-warnings=0`
3. **Add ESLint as dev dependency** if not present

### Implementation Steps
- Check if ESLint is in `devDependencies` (currently not present)
- Add ESLint config file (minimal: extends Next.js recommended)
- Update `package.json` lint script
- Test locally: `pnpm --filter @repo/web lint`

### Risk: Very Low
- Only affects linting (not runtime)
- Makes CI deterministic
- Can use Next.js ESLint config as base

---

## Implementation Priority

1. **High Priority** (Security/Data Integrity):
   - Issue 1: CORS allowlist (production security)
   - Issue 2: Ads dedupe (prevents duplicate Meta writes)

2. **Medium Priority** (Code Quality):
   - Issue 3: Error shape standardization (maintainability)

3. **Low Priority** (Nice to Have):
   - Issue 4: Budget currency validation (edge case)
   - Issue 5: Lint determinism (CI improvement)

---

## Testing Checklist

After implementing each fix:

- [ ] **CORS**: Test with `CORS_ORIGIN` set and unset; verify production warning
- [ ] **Ads dedupe**: Trigger `/ads/publish` twice quickly; verify second returns deduped
- [ ] **Error shapes**: Test error responses from updated routes; verify UI displays correctly
- [ ] **Currency**: Test with non-USD onboarding; verify clear error message
- [ ] **Lint**: Run `pnpm -r lint`; verify no prompts, deterministic output

---

## Notes

- All changes are **additive-only** (no breaking changes)
- Can be implemented incrementally (one issue at a time)
- Each fix is independent (no dependencies between issues)
- Consider creating a shared error helper for Issue 3 (optional refactor)
