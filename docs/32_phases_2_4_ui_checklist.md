# Phases 2–4: UI Parity Checklist & Manual Test Guide

## Phase 2 — User App Shell

| Element | Figma Reference | Implemented | Notes |
|---------|-----------------|-------------|-------|
| Route group `(app)` | — | ✅ | `apps/web/src/app/(app)/layout.tsx` |
| Auth guard via `/auth/me` | — | ✅ | Redirects to `/login` if unauthenticated |
| `customerId` from context | — | ✅ | `useAuth()` from `@/lib/auth` |
| Top bar | Shell design | ✅ | Project Auto branding, email, Log out |
| Status pills | Website, Meta, Templates, Automation | ✅ | Fetched from APIs; Meta = placeholder |
| Sidebar nav | Dashboard, Inventory, Automation, Templates, Billing, Settings | ✅ | Active state highlighting |
| Admin link (conditional) | — | ✅ | Shown only if `NEXT_PUBLIC_SHOW_ADMIN_LINK=true` |

## Phase 3 — Page-by-Page Alignment

### A) Dashboard
| Element | API | Status |
|---------|-----|--------|
| Onboarding status | `GET /onboarding/status` | ✅ |
| Website connected/source | `GET /inventory/items` (source) | ✅ |
| Template readiness | `GET /templates/config` | ✅ |
| Run crawl CTA | `POST /runs/crawl` | ✅ |
| Generate previews CTA | Link to Templates | ✅ |
| Approve template CTA | Link to Templates | ✅ |
| Loading / empty / error states | — | ✅ |

### B) Inventory
| Element | API | Status |
|---------|-----|--------|
| Items table | `GET /inventory/items` | ✅ |
| Source URL | From items response | ✅ |
| Empty state | — | ✅ |
| Connect website link | `/connect-website` | ✅ |

### C) Automation / Runs
| Element | API | Status |
|---------|-----|--------|
| Crawl + preview runs | `GET /runs?type=crawl|preview` | ✅ |
| Type filter | Query param | ✅ |
| Run now (crawl) | `POST /runs/crawl` | ✅ |
| Empty state | — | ✅ |

### D) Templates
| Element | API | Status |
|---------|-----|--------|
| Template list | `GET /templates` | ✅ |
| Config | `GET/POST /templates/config` | ✅ |
| Generate previews | `POST /templates/previews/run` | ✅ |
| Previews list | `GET /templates/previews` | ✅ |
| Preview HTML | `GET /templates/previews/:id/html` | ✅ |
| Approve | `POST /templates/approve` | ✅ |

### E) Billing + Settings
| Element | Status |
|---------|--------|
| Placeholder UI | ✅ |
| Clearly labeled as placeholder | ✅ |

## Phase 4 — Shared API Client & States

| Element | Status |
|---------|--------|
| `apps/web/src/lib/api.ts` | ✅ `apiGet`, `apiPost`, credentials, base URL |
| `apps/web/src/lib/auth.tsx` | ✅ `AuthProvider`, `useAuth`, `/auth/me` cache |
| Loading spinner | ✅ `@/components/LoadingSpinner` |
| Empty state | ✅ `@/components/EmptyState` |
| Error banner with retry | ✅ `@/components/ErrorBanner` |

---

## Manual Test Checklist

### Prerequisites
- API running: `pnpm --filter @repo/api dev` (port 3001)
- Web running: `pnpm --filter @repo/web dev` (port 3000)
- `.env`: `NEXT_PUBLIC_API_URL=http://localhost:3001`

### 1. Signup → Login → Dashboard
- [ ] Visit `http://localhost:3000`
- [ ] Click Sign Up
- [ ] Enter email, name, password → Submit
- [ ] Redirected to `/dashboard`
- [ ] See onboarding status, website/template sections
- [ ] Sidebar shows Dashboard, Inventory, Automation, Templates, Billing, Settings
- [ ] Top bar shows email and Log out
- [ ] Status pills show Website —, Meta —, Templates —, Automation —

### 2. Connect website
- [ ] From dashboard, click “Connect a website”
- [ ] Or go to Connect website in nav (if linked) or `/connect-website`
- [ ] Enter `https://example.com/inventory` → Connect
- [ ] Redirected to dashboard
- [ ] Status pill “Website ✓” appears
- [ ] “Run crawl” button visible

### 3. Run crawl
- [ ] Click “Run crawl” on dashboard
- [ ] Redirected to `/runs`
- [ ] See new crawl run (status queued/running/success)
- [ ] Or: go to Automation → “Run now” when website connected

### 4. Templates config → Generate → Approve
- [ ] Go to Templates
- [ ] Select a template (e.g. 4-Item Grid)
- [ ] Fill brand name, color (optional)
- [ ] Save config
- [ ] Click “Generate previews”
- [ ] Redirected to Runs (preview type)
- [ ] Wait for run to complete (or refresh)
- [ ] Go back to Templates
- [ ] See preview cards
- [ ] Click “Approve template”
- [ ] Status pill “Templates ✓” appears

### 5. Dashboard ready state
- [ ] Return to dashboard
- [ ] Onboarding complete, Website ✓, Templates ✓, Automation ✓
- [ ] CTAs reflect current state

### 6. Inventory
- [ ] Go to Inventory
- [ ] With website + crawl: see items table
- [ ] Without source: empty state with “Connect website” link

### 7. Billing & Settings
- [ ] Go to Billing → see placeholder
- [ ] Go to Settings → see placeholder

### 8. Log out
- [ ] Click Log out
- [ ] Redirected to `/login`
- [ ] Visiting `/dashboard` redirects to `/login`
