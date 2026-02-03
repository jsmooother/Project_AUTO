# Ads (Meta) Module — UI ↔ API Contract
Project AUTO

This document defines the **single source of truth** between UI (Figma + Web) and Backend (API + Worker)
for the Ads (Meta) module.

It is:
- additive-only
- aligned with the current Project AUTO backend
- safe to use in Cursor and Figma Make

---

## Global conventions

### Authentication & scoping
All Ads endpoints require:
- valid session cookie
- `x-customer-id` header (from `GET /auth/me`)

No Ads endpoint should work without customer context.

---

### Error shapes (standard across API)

```json
VALIDATION_ERROR {
  "error": "VALIDATION_ERROR",
  "message": "...",
  "issues": [...]
}

MISSING_PREREQUISITE {
  "error": "MISSING_PREREQUISITE",
  "message": "...",
  "hint": "..."
}

CONFIG_ERROR {
  "error": "CONFIG_ERROR",
  "message": "...",
  "hint": "..."
}

UI must always render message and optionally hint.

⸻

Runs lifecycle

All Ads-related jobs follow:

queued → running → success | failed

UI polls while any run is queued or running.

⸻

Shared Ads snapshot (main API)

Endpoint

GET /ads/status

This endpoint powers almost all Ads UI pages.

Example response

{
  "prerequisites": {
    "website": { "ok": true, "hint": null, "link": "/connect-website" },
    "inventory": { "ok": true, "count": 12, "hint": null, "link": "/inventory" },
    "templates": { "ok": true, "hint": null, "link": "/templates" },
    "meta": { "ok": true, "hint": null, "link": "/settings" }
  },
  "settings": {
    "geo_mode": "radius",
    "geo_center_text": "Stockholm",
    "geo_radius_km": 25,
    "formats_json": { "feed": true, "reels": false },
    "cta_type": "learn_more",
    "status": "ready",
    "last_synced_at": null,
    "last_published_at": null
  },
  "objects": {
    "catalog_id": null,
    "campaign_id": null,
    "adset_id": null,
    "ad_id": null,
    "status": "not_created",
    "last_synced_at": null
  },
  "lastRuns": [],
  "derivedBudget": {
    "defaultMonthly": 15000,
    "currency": "SEK",
    "effective": 15000
  }
}


⸻

/app/ads — Ads Overview

UI → API mapping

UI Element	API Used	Notes
Readiness checklist	GET /ads/status	Uses prerequisites
Launch Ads CTA	navigation	Visible when ready + inactive
Sync catalog	POST /ads/sync	Enqueues ADS_SYNC
Publish campaign	POST /ads/publish	Enqueues ADS_PUBLISH
Budget / geo summary	GET /ads/status	Read-only
Last sync/publish	GET /ads/status	Timestamps


⸻

/app/ads/setup — Ads Configuration

UI fields → Database

UI Field	DB Column
Geo mode	ad_settings.geo_mode
Center location	ad_settings.geo_center_text
Radius (km)	ad_settings.geo_radius_km
Regions	ad_settings.geo_regions_json
Feed / Reels toggles	ad_settings.formats_json
CTA type	ad_settings.cta_type
Budget override	ad_settings.budget_override_amount
Currency	ad_settings.budget_override_currency

Endpoint

POST /ads/settings

Validation rules
	•	Radius mode → center + radius required
	•	Regions mode → at least one region
	•	At least one format enabled

⸻

/app/ads/campaign — Campaign Status

Data sources

UI Section	API
Meta object IDs	GET /ads/status.objects
Campaign status	objects.status
External Meta link	campaign_id (UI-only)
Recent Ads runs	GET /ads/status.lastRuns

Pause / Resume buttons are placeholders for now.

⸻

/app/ads/diagnostics — Diagnostics

Job Logs tab

GET /ads/runs?limit=100

Shows:
	•	run id
	•	job type
	•	status
	•	duration
	•	error message

Meta Debug tab

Uses:

GET /ads/status.objects

Tokens are never exposed.

⸻

/app/ads/boosts — Coming Soon
	•	Static UI only
	•	No API calls

⸻

Runs page integration

Preferred:

GET /runs?type=ads

Fallback:

GET /ads/runs

Must not break crawl or preview runs.

⸻

Admin endpoints

POST /admin/customers/:customerId/ads/sync
POST /admin/customers/:customerId/ads/publish

	•	Same validations as user endpoints
	•	Requires x-admin-key

⸻

Guarantees
	•	UI never assumes unimplemented backend logic
	•	Ads module is fully additive
	•	Figma Make designs map 1:1 to API
	•	Meta implementation can evolve safely

⸻

Out of scope (future)
	•	Token refresh
	•	Real catalog push
	•	Asset rendering
	•	Budget pacing
	•	Boosted inventory

---

## After this
You can now:
- reference **one single file** everywhere
- give it to Cursor
- give it to Figma Make
- use it as the Ads contract going forward

If you want, next I can:
- create a **Cursor execution prompt that explicitly says “follow docs/40_ads_ui_api_contract.md”**
- or produce a **Figma Make prompt derived directly from this file**