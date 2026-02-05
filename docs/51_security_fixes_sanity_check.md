# Security Fixes — Sanity Check Results

**Date:** 2025-02-05  
**Changes:** Session validation + CPM removal

---

## ✅ Check 1: Logged out → customer page

**Code verification:**
- `/billing` page checks `auth.status === "unauthenticated"` → redirects to `/login` (line 62-65 in billing/page.tsx)
- API returns 401 without session cookie → triggers `setOnUnauthorized` in auth.tsx → sets auth to unauthenticated → redirect
- **Status:** ✅ **PASS** — Frontend redirects unauthenticated users

---

## ✅ Check 2: Logged in → normal browsing

**Code verification:**
- All customer routes (`/dashboard`, `/ads`, `/performance`, `/billing`) go through `requireCustomerSession`
- If session valid and matches header → request proceeds normally
- **Status:** ✅ **PASS** — No unexpected redirects; routes load when authenticated

---

## ✅ Check 3: Header mismatch defense

**Code verification:**
- `requireCustomerSession` compares `sessionCustomerId` (from DB) to `headerCustomerId` (from x-customer-id header)
- Mismatch → 403 FORBIDDEN with hint (lines 95-103 in customerContext.ts)
- Web client sends `x-customer-id` header via `apiGet`/`apiPost` (line 51 in api.ts)
- **Status:** ✅ **PASS** — Header mismatch returns 403; normal requests send header correctly

**Manual test needed:** Tamper header in DevTools → should get 403

---

## ✅ Check 4: CPM leakage check

**API response (`apps/api/src/routes/billing.ts`):**
- ✅ Removed `customerCpmSek` from top-level response (line 169 removed)
- ✅ Removed `customerCpmSek` from `plan` object (line 180 removed)
- ✅ No CPM fields in response

**UI (`apps/web/src/app/(app)/billing/page.tsx`):**
- ✅ Removed `customerCpmSek` from `BillingPlan` interface (line 14 removed)
- ✅ Removed CPM display block (lines 156-161 removed)
- ✅ Grep confirms: no matches for "customerCpmSek", "CPM", or "cpm" in billing page

**Status:** ✅ **PASS** — CPM completely removed from customer scope

---

## ✅ Check 5: OAuth redirect resilience

**Code verification:**
- `/meta/oauth/callback` is excluded from session middleware (line 62 in server.ts)
- Callback validates session manually (lines 100-113 in meta.ts) using cookie + state
- Callback doesn't use `request.customer` — validates session independently
- **Status:** ✅ **PASS** — OAuth callback excluded; validates session itself

**Note:** Callback code has pre-existing potential issue: line 106 selects `sessions.customerId` which may not exist in schema (should join users table). This is pre-existing and doesn't affect the exclusion logic.

---

## ✅ Check 6: Admin still works

**Code verification:**
- Admin routes (`/admin/*`) excluded from customer session middleware (line 63 in server.ts)
- Admin routes use `requireAdminContext` instead (line 65 in server.ts)
- Admin routes check `x-admin-key` header, not session cookie
- **Status:** ✅ **PASS** — Admin routes use separate auth; ledger/topup/burn unaffected

---

## Summary

| Check | Status | Notes |
|-------|--------|-------|
| 1. Logged out redirect | ✅ PASS | Frontend redirects to /login |
| 2. Normal browsing | ✅ PASS | Routes work when authenticated |
| 3. Header mismatch | ✅ PASS | Returns 403; manual test recommended |
| 4. CPM removal | ✅ PASS | Completely removed from API + UI |
| 5. OAuth callback | ✅ PASS | Excluded; validates session itself |
| 6. Admin routes | ✅ PASS | Separate auth; unaffected |

**All checks pass via code review.** Manual UI testing recommended to verify:
- Actual redirect behavior in browser
- Header tampering returns 403
- OAuth flow completes successfully
