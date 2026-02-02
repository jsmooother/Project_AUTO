# Figma Route Map — User + Admin Frames

**Source:** Figma Design file (user + admin frames). MCP `get_metadata` returned advisory text only; structure inferred from existing implementation, sidebar nav, and design conventions.

**Route convention:** Root-level routes (no /app/*). Keep current structure unless Figma mandates change.

---

## User Frames (Customer App)

| Frame Name | Next.js Route | Key UI Components | Required Data (API) | States |
|------------|---------------|-------------------|---------------------|--------|
| Sign Up | /signup | Form (email, org name) | POST /signup | — |
| Login | /login | Form (email, password) | POST /auth/login | Error |
| Dashboard | /dashboard | Status pills (Website, Templates, Automation), CTAs | GET /onboarding/status, GET /inventory/items, GET /templates/config | Loading, empty |
| Connect Website | /connect-website | Form (website URL) | POST /inventory/source | Loading, error |
| Onboarding Company | /onboarding/company | Form | POST /onboarding/company | — |
| Onboarding Budget | /onboarding/budget | Form | POST /onboarding/budget | — |
| Inventory | /inventory | Table (items), source link | GET /inventory/items | Loading, empty |
| Runs | /runs | Toggle (crawl/preview), table | GET /runs?type=crawl\|preview | Loading, empty |
| Templates | /templates | Template cards, config form, preview gallery, approve CTA | GET /templates, GET /templates/config, GET /templates/previews, POST /templates/config, POST /templates/previews/run, POST /templates/approve | Loading, empty |
| Automation | /automation (or /runs) | Mode toggle, Run crawl CTA, run history | GET /runs?type=crawl | Loading, empty |
| Billing | /billing | Stub UI | — | Coming soon |
| Settings | /settings | Stub UI | — | Coming soon |

### User App Shell (from Figma)
- Top nav: logo, status pills (Website connected, Templates approved, etc.), user menu
- Sidebar: Dashboard, Automation, Templates, Inventory, Runs, Billing, Settings
- Or: top nav only if Figma shows flat navigation

---

## Admin Frames

| Frame Name | Next.js Route | Key UI Components | Required Data (API) | States |
|------------|---------------|-------------------|---------------------|--------|
| Overview | /admin | Redirect to /admin/customers | — | — |
| Customers | /admin/customers | Table, search, filters | GET /admin/customers | Loading, empty |
| Customer Detail | /admin/customers/[customerId] | Tabs: Overview, Runs, Inventory, Billing | GET /admin/customers/:id | Loading |
| Inventory Sources | /admin/inventory-sources | Table | GET /admin/inventory-sources | Loading, empty |
| Runs & Automations | /admin/runs | Table, filters (type, status, customer) | GET /admin/runs | Loading, empty |
| Run Detail | /admin/runs/[runId] | Run metadata | GET /admin/runs/:id | Loading |
| Billing & Payments | /admin/billing | Placeholder | — | — |
| System Configuration | /admin/system-config | Integration Health, Feature Flags, Rate Limits, Kill Switches | — | — |

---

## Route Structure Summary

```
/                     → Landing or redirect
/signup               → Sign up form
/login                → Login form
/dashboard            → User dashboard (main)
/connect-website      → Connect website
/onboarding/company   → Company info
/onboarding/budget    → Budget info
/inventory            → Inventory items
/runs                 → Crawl + preview runs
/templates            → Templates + config + previews + approve
/automation           → (Optional) alias or dedicated automation page
/billing              → Stub
/settings             → Stub

/admin                → Redirect to /admin/customers
/admin/customers      → Customers list
/admin/customers/[id] → Customer detail
/admin/inventory-sources
/admin/runs
/admin/runs/[id]
/admin/billing
/admin/system-config
```

---

## API Client Requirements (Phase 4)
- Base URL from NEXT_PUBLIC_API_URL
- Call /auth/me on init, cache customerId
- Set x-customer-id on all customer-scoped requests
- Handle 401 → redirect /login
- Handle 403/500 gracefully
