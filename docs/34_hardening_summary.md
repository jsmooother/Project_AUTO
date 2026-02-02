# Hardening summary (pre-Meta/Stripe)

## Build reliability

### Issue
Next.js production build intermittently failed with:
- `Error: <Html> should not be imported outside of pages/_document`
- `ENOENT: no such file or directory, .next/routes-manifest.json`

### Root cause
Corrupted `.next` cache (incomplete or stale build artifacts from prior runs or restarts).

### Fix
No code changes needed. The app is pure **App Router** (no `pages/` directory, no `next/document` imports). Build is **deterministic** when run from a clean state.

**Clean build command:**
```bash
cd apps/web && rm -rf .next && cd ../.. && pnpm --filter @repo/web build
```

Or use the dev script:
```bash
pnpm --filter @repo/web dev:clean
```

**Result:** Production build now completes successfully from a clean state (verified: all 21 routes built, static + dynamic).

### Issue: `Cannot find module './226.js'` (dev runtime)

**Error:**
```
Cannot find module './226.js'
Require stack: .next/server/webpack-runtime.js → .next/server/pages/_document.js
```

**Root cause:** Next.js dev mode uses Webpack. The auto-generated `pages/_document.js` loads `webpack-runtime.js`, which uses `require("./226.js")` expecting the chunk next to the runtime. The chunk is actually in `.next/server/chunks/226.js`, so path resolution fails.

**Fix:** Use **Turbopack** for dev instead of Webpack. Turbopack has different chunk resolution and does not hit this bug.

**Exact changes:**
- `apps/web/package.json` – `dev` script: `next dev -p 3000 --turbopack`
- Added `dev:webpack` fallback: `WATCHPACK_POLLING=true next dev -p 3000` (use if Turbopack has issues)
- Root `package.json` – `pnpm.overrides` for `@next/swc-*` at 15.5.11 (aligns with Next.js; build still warns if lockfile has 15.5.7)

**Build verification:**
```bash
rm -rf apps/web/.next && pnpm --filter @repo/web build   # ✓ passes
pnpm --filter @repo/web dev                              # ✓ uses Turbopack, no chunk error
```

---

## Hardening changes (API, worker, web)

### 1) Reliability of async jobs

**Worker failure writes** (`apps/worker/src/jobs/crawlStub.ts`, `apps/worker/src/jobs/previewGen.ts`)
- Every `job.deadLetter()` path now updates the run to `status: "failed"` and sets `errorMessage` **before** calling `deadLetter`, so the DB always reflects the failure reason.

**Polling on Runs page** (`apps/web/src/app/(app)/runs/page.tsx`)
- When any run is `queued` or `running`, the page **polls every 5 seconds** and stops when all runs are stable.
- If a run stays `queued` for **> 5 minutes**, a yellow banner shows: "Worker may be offline" with hint to start worker and check Redis.

**Idempotency** (`apps/api/src/routes/crawlRuns.ts`, `apps/api/src/routes/templates.ts`)
- **Buttons:** Already disabled while request is in flight.
- **API dedupe:** `POST /runs/crawl` and `POST /templates/previews/run` check if the same customer already has a `queued` or `running` run created in the last **30 seconds**. If yes, return **200** with `{ runId, deduped: true }` (no second run created).
- Dedupe query wrapped in try/catch so if it fails (DB/Drizzle issue), we skip dedupe and create a new run (non-fatal).

**Structured logs** (`apps/worker/src/jobs/crawlStub.ts`, `apps/worker/src/jobs/previewGen.ts`, `apps/api/src/routes/crawlRuns.ts`, `apps/api/src/routes/templates.ts`)
- **Worker:** JSON logs for:
  - `crawl_job_start` / `crawl_job_finish` (success/failed) with `runId`, `customerId`, optional `errorMessage`
  - `preview_job_start` / `preview_job_finish` (success/failed) with `runId`, `customerId`, optional `errorMessage`
- **API:** On enqueue, logs `{ runId, customerId, jobId, jobType, event: "enqueue" }` or `"enqueue_deduped"`.

### 2) URL validation and normalization

**Inventory source** (`apps/api/src/routes/inventory.ts`)
- **POST /inventory/source** now:
  - Trims whitespace
  - Adds `https://` if no scheme
  - Validates with `URL` and allows only `http:` and `https:`
  - Returns **VALIDATION_ERROR** with `message` and `hint` (e.g. "Invalid URL format", "Only http and https URLs are allowed").

### 3) Approval / versioning rules

**Template config invalidation** (`apps/api/src/routes/templates.ts`)
- **POST /templates/config:** When updating an existing config, if any of `templateKey`, `brandName`, `primaryColor`, `logoUrl`, `headlineStyle` change **and** the current status is `approved` or `preview_ready`:
  - Set config `status` back to **draft**
  - Delete **approvals** for that config
- Approve is still only allowed after a successful preview run for the current config (unchanged).

### 4) Customer context and 401

**Global 401 handler** (`apps/web/src/lib/api.ts`, `apps/web/src/lib/auth.tsx`)
- `apiGet` and `apiPost` call a global `onUnauthorized` callback when response status is **401**.
- **AuthProvider** sets this to: set auth state to `unauthenticated` and `router.replace("/login")`.
- So any 401 (e.g. expired session) clears auth and redirects to login immediately.

**Logout** (`apps/web/src/app/(app)/layout.tsx`, `apps/web/src/lib/auth.tsx`)
- Layout `handleLogout` calls **clearAuth()** (new in AuthProvider) so auth state is set to `unauthenticated` immediately, then redirects to `/login`. No reliance on cached `/auth/me` after logout.

### 5) Logging and admin run errors

**API global error handler** (`apps/api/src/server.ts`)
- **`setErrorHandler`** catches any uncaught error in a route, logs it, and returns **500** with `{ error: { code, message }, stack? }`.
- In **development**, `stack` is included so you can see the line that threw.
- Checks `reply.sent` to avoid double-send.

**Admin run detail** (`apps/web/src/app/admin/runs/[runId]/page.tsx`)
- When a run has `errorMessage`, it is shown in a **prominent red box at the top** with label "Run error (failure reason)" (monospace, pre-wrap).

### 6) Test harness

**Happy-path script** (`scripts/happy-path-api.sh`)
- Runs: signup → connect website → run crawl → save template config → run preview → wait 15s → approve.
- Usage: `./scripts/happy-path-api.sh` or `API_URL=... ./scripts/happy-path-api.sh`.
- Requires API and worker running, Redis + DB (e.g. `docker compose up -d`).

**Env for tests** (`.env.test.example`)
- Copy to `.env.test` and point `DATABASE_URL` at your Docker DB (or test DB) when running API integration tests.

**Doc** (`docs/33_end_to_end_mvp_flow.md`)
- Updated with "Test harness (happy path)" section and notes on using `.env.test` for integration tests.

---

## Files changed

### API
- `apps/api/src/server.ts` – global error handler (setErrorHandler)
- `apps/api/src/routes/crawlRuns.ts` – dedupe + enqueue log + try/catch for dedupe
- `apps/api/src/routes/templates.ts` – dedupe + enqueue log + invalidate approval on config change + try/catch for dedupe
- `apps/api/src/routes/inventory.ts` – URL normalization (trim, add https, validate, reject non-http(s))
- `apps/api/src/routes/admin.ts` – (from previous: demo seed + reset endpoints)

### Worker
- `apps/worker/src/jobs/crawlStub.ts` – deadLetter writes failed to DB + structured logs
- `apps/worker/src/jobs/previewGen.ts` – deadLetter writes failed to DB + structured logs

### Web
- `apps/web/package.json` – `dev` uses `-p 3000`, added `dev:clean`
- `apps/web/src/lib/api.ts` – `setOnUnauthorized`, call it on 401; send `"{}"` for empty body
- `apps/web/src/lib/auth.tsx` – `clearAuth()` + `setOnUnauthorized` in AuthProvider
- `apps/web/src/app/(app)/layout.tsx` – `clearAuth` on logout
- `apps/web/src/app/(app)/runs/page.tsx` – polling + timeout hint
- `apps/web/src/app/admin/runs/[runId]/page.tsx` – prominent error block
- `apps/web/src/components/ErrorBanner.tsx` – (from previous: hint prop)
- `apps/web/src/app/(app)/dashboard/page.tsx` – (from previous: errorDetail.hint)
- `apps/web/src/app/(app)/connect-website/page.tsx` – (from previous: errorDetail.hint)
- `apps/web/src/app/(app)/templates/page.tsx` – (from previous: errorDetail.hint)
- `apps/web/src/app/admin/customers/page.tsx` – (from previous: Create demo customer)
- `apps/web/src/app/admin/customers/[customerId]/page.tsx` – (from previous: Reset customer data)

### Docs & scripts
- `docs/16_api_spec.md` – admin endpoints updated
- `docs/33_end_to_end_mvp_flow.md` – test harness + demo/reset sections
- `README.md` – troubleshooting for 404 chunks, clean dev command
- `scripts/happy-path-api.sh` – happy-path test
- `.env.test.example` – for integration tests
- `docs/34_hardening_summary.md` – this file

---

## Build verification

**Command:** `cd apps/web && rm -rf .next && cd ../.. && pnpm --filter @repo/web build`

**Result:** ✅ **Build passes** (21 routes, 0 errors).

**Root cause of prior failures:** Corrupted `.next` cache. The app has no `next/document` imports or `pages/` directory. Build is **deterministic** from a clean state.
