# API Contracts - Backend Data Structures

**Last Updated**: February 7, 2026  
**Purpose**: Define exact data structures that backend provides to frontend

⚠️ **CRITICAL**: These contracts are FINAL. Do not design screens expecting different data.

---

## Authentication & Headers

### Customer Routes
```http
GET /api/customer/*
Cookie: session=abc123xyz
```
- **No manual headers required**
- Session cookie set on login
- Backend extracts customer ID from session

### Admin Routes (Customer-Specific Data)
```http
GET /api/admin/customers/123/details
Cookie: admin_session=xyz789abc
X-Customer-ID: 123
```
- **Admin session cookie required**
- **X-Customer-ID header** specifies which customer's data to fetch
- Allows admin to view any customer's data

---

## Customer API Contracts

### Dashboard - `GET /api/customer/dashboard`

**Purpose**: Main overview screen data  
**Route**: `/app/dashboard`  
**Updated**: Feb 6, 2026 (Simplified)

**Request**: None (uses session)

**Response**:
```typescript
{
  "status": "running" | "paused" | "setup_needed",
  "itemCount": number,
  "lastSync": string, // Relative time: "2 hours ago"
  "performance": {
    "impressions": number,
    "clicks": number,
    "ctr": string, // Percentage: "1.89%"
    "reach": number
  },
  "credits": {
    "remaining": number,
    "daysEstimate": number // How many days left at current pace
  } | null, // Null if not using credit system
  "suggestion": {
    "type": "template" | "budget" | "inventory" | "connection" | null,
    "message": string,
    "link": string // Internal route to action
  } | null
}
```

**Example**:
```json
{
  "status": "running",
  "itemCount": 247,
  "lastSync": "2 hours ago",
  "performance": {
    "impressions": 123456,
    "clicks": 2340,
    "ctr": "1.89%",
    "reach": 45678
  },
  "credits": {
    "remaining": 8240,
    "daysEstimate": 14
  },
  "suggestion": {
    "type": "template",
    "message": "New template available - preview recommended ads",
    "link": "/app/templates"
  }
}
```

**CONSTRAINTS**:
- ❌ NO `spend`, `cpc`, `cpm`, `cost_per_*` fields
- ✅ Use `credits` instead of budget/spend
- ✅ CTR is calculated on backend (clicks / impressions)

---

### Ads Page - `GET /api/customer/ads`

**Purpose**: Campaign status and automation settings  
**Route**: `/app/ads`  
**Updated**: Feb 6, 2026 (Merged automation)

**Request**: None (uses session)

**Response**:
```typescript
{
  "isLive": boolean,
  "autoSync": {
    "enabled": boolean,
    "schedule": string, // Human readable: "Every night at 2:00 AM"
    "nextRun": string // Relative: "in 6 hours"
  },
  "lastSync": string, // Relative: "2 hours ago"
  "itemCount": number,
  "metaCampaign": {
    "catalogId": string,
    "catalogItems": number,
    "campaignId": string,
    "campaignName": string,
    "campaignStatus": "active" | "paused" | "error",
    "adFormats": string[], // ["Feed", "Reels", "Stories"]
    "targeting": {
      "countries": string[],
      "ageMin": number,
      "ageMax": number
    }
  }
}
```

**Example**:
```json
{
  "isLive": true,
  "autoSync": {
    "enabled": true,
    "schedule": "Every night at 2:00 AM",
    "nextRun": "in 6 hours"
  },
  "lastSync": "2 hours ago",
  "itemCount": 247,
  "metaCampaign": {
    "catalogId": "cat_7362847562",
    "catalogItems": 247,
    "campaignId": "camp_9283746529",
    "campaignName": "Acme Auto - Dynamic Inventory",
    "campaignStatus": "active",
    "adFormats": ["Feed", "Reels"],
    "targeting": {
      "countries": ["US", "CA"],
      "ageMin": 25,
      "ageMax": 65
    }
  }
}
```

**UI Mapping**:
- **Status Tab**: Shows `isLive`, `lastSync`, `itemCount`, `metaCampaign` objects
- **Automation Tab**: Shows `autoSync` settings + manual trigger button

---

### Settings - `GET /api/customer/settings`

**Purpose**: Account and connection management  
**Route**: `/app/settings`  
**Updated**: Feb 6, 2026 (Simplified, removed notifications)

**Request**: None (uses session)

**Response**:
```typescript
{
  "user": {
    "name": string,
    "email": string,
    "company": string
  },
  "website": {
    "connected": boolean,
    "url": string | null,
    "lastSync": string | null, // Relative: "2 hours ago"
    "itemsDetected": number | null,
    "connectedDate": string | null // ISO date: "2026-01-28"
  },
  "meta": {
    "connected": boolean,
    "accountId": string | null,
    "businessName": string | null,
    "connectedDate": string | null // ISO date: "2026-01-28"
  }
}
```

**Example**:
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@acme.com",
    "company": "Acme Inc."
  },
  "website": {
    "connected": true,
    "url": "yoursite.com/inventory",
    "lastSync": "2 hours ago",
    "itemsDetected": 247,
    "connectedDate": "2026-01-28"
  },
  "meta": {
    "connected": true,
    "accountId": "act_9283746529",
    "businessName": "Acme Inc. Ads",
    "connectedDate": "2026-01-28"
  }
}
```

**UI Sections**:
1. Account Information (user object)
2. Website Connection (website object)
3. Meta Connection (meta object)
4. Danger Zone (actions, no data)

---

### Inventory - `GET /api/customer/inventory`

**Purpose**: List of items scraped from website  
**Route**: `/app/inventory`

**Request**:
```typescript
{
  "page": number, // Pagination
  "limit": number, // Items per page
  "search"?: string, // Optional search query
  "filters"?: {
    "inStock"?: boolean,
    "priceMin"?: number,
    "priceMax"?: number
  }
}
```

**Response**:
```typescript
{
  "items": Array<{
    "id": string,
    "title": string,
    "price": number,
    "currency": string,
    "imageUrl": string,
    "inStock": boolean,
    "detailsUrl": string,
    "lastUpdated": string // Relative: "2 hours ago"
  }>,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

---

### Performance - `GET /api/customer/performance`

**Purpose**: Detailed metrics and charts  
**Route**: `/app/performance`

**Request**:
```typescript
{
  "period": "7d" | "30d" | "90d" | "custom",
  "startDate"?: string, // ISO date for custom period
  "endDate"?: string
}
```

**Response**:
```typescript
{
  "summary": {
    "impressions": number,
    "clicks": number,
    "ctr": string,
    "reach": number,
    "frequency": number
  },
  "daily": Array<{
    "date": string, // ISO date
    "impressions": number,
    "clicks": number,
    "reach": number
  }>,
  "topPerformers": Array<{
    "itemId": string,
    "itemTitle": string,
    "impressions": number,
    "clicks": number
  }>
}
```

**CONSTRAINTS**:
- ❌ NO spend/cost data in customer view
- ✅ Focus on engagement metrics (impressions, clicks, reach)

---

### Billing - `GET /api/customer/billing`

**Purpose**: Credits and payment history  
**Route**: `/app/billing`

**Response**:
```typescript
{
  "credits": {
    "current": number,
    "daysEstimate": number,
    "lastPurchase": string | null // ISO date
  },
  "purchases": Array<{
    "id": string,
    "date": string, // ISO date
    "amount": number,
    "currency": string,
    "credits": number,
    "status": "completed" | "pending" | "failed"
  }>,
  "upcomingCharge": {
    "date": string, // ISO date
    "estimatedAmount": number,
    "currency": string
  } | null
}
```

---

## Onboarding API Contracts

### Step 1 - Start (Welcome) - No API call

**Route**: `/onboarding/start`  
**Purpose**: Welcome screen, value proposition, no data collection

---

### Step 2 - Connect Website - `POST /api/onboarding/website`

**Route**: `/onboarding/connect`

**Request**:
```typescript
{
  "url": string // User-provided website URL
}
```

**Response**:
```typescript
{
  "success": boolean,
  "itemsFound": number,
  "errors": string[] | null
}
```

**Example Success**:
```json
{
  "success": true,
  "itemsFound": 247,
  "errors": null
}
```

**Example Error**:
```json
{
  "success": false,
  "itemsFound": 0,
  "errors": [
    "Could not connect to URL",
    "No inventory items detected"
  ]
}
```

---

### Step 3 - Launch (Connect Ads + Set Budget) - `POST /api/onboarding/launch`

**Route**: `/onboarding/launch`

**Meta OAuth Flow** (first):
- `GET /api/auth/meta/connect` - Redirects user to Meta OAuth page
- User grants permissions
- Meta redirects back to: `/api/auth/meta/callback?code=xxx`
- Backend exchanges code for token, stores it
- User returns to `/onboarding/launch` to complete setup

**Launch Request** (after OAuth):
```typescript
{
  "monthlyBudget": number,
  "currency": string, // "USD", "EUR", "SEK"
  "targeting": {
    "countries": string[],
    "ageMin": number,
    "ageMax": number
  }
}
```

**Response**:
```typescript
{
  "success": boolean,
  "campaignId": string,
  "catalogId": string,
  "redirectTo": "/app/dashboard"
}
```

**Example**:
```json
{
  "success": true,
  "campaignId": "camp_9283746529",
  "catalogId": "cat_7362847562",
  "redirectTo": "/app/dashboard"
}
```

---

## Admin API Contracts

### Customer Detail - `GET /admin/customers/:id`

**Purpose**: View single customer's full data (including spend)  
**Route**: `/admin/customers/:id`

**Response**:
```typescript
{
  "customer": {
    "id": string,
    "name": string,
    "email": string,
    "company": string,
    "status": "active" | "paused" | "churned",
    "createdAt": string, // ISO date
    "lastLogin": string // ISO date
  },
  "connections": {
    "website": { /* same as customer API */ },
    "meta": { /* same as customer API */ }
  },
  "performance": {
    "impressions": number,
    "clicks": number,
    "ctr": string,
    "reach": number
  },
  "spend": {
    "totalSpend": number,
    "currency": string,
    "avgCPC": number,
    "avgCPM": number,
    "last30Days": number
  },
  "billing": {
    "credits": number,
    "totalPurchased": number,
    "lifetimeValue": number
  }
}
```

**KEY DIFFERENCE**: 
- ✅ **`spend` object is visible** (only in admin routes)
- Customer API does NOT include this

---

## Update Endpoints (Actions)

### Update Settings - `PATCH /api/customer/settings`

**Request**:
```typescript
{
  "user"?: {
    "name"?: string,
    "email"?: string,
    "company"?: string
  },
  "website"?: {
    "url": string
  }
}
```

**Response**:
```typescript
{
  "success": boolean,
  "errors": string[] | null
}
```

---

### Toggle Auto-Sync - `POST /api/customer/ads/auto-sync`

**Request**:
```typescript
{
  "enabled": boolean
}
```

**Response**:
```typescript
{
  "success": boolean,
  "nextRun": string | null // "in 6 hours" or null if disabled
}
```

---

### Manual Sync - `POST /api/customer/ads/sync`

**Request**: None

**Response**:
```typescript
{
  "success": boolean,
  "itemsProcessed": number,
  "itemsAdded": number,
  "itemsRemoved": number
}
```

---

## Error Responses (All Endpoints)

**Standard Error Format**:
```typescript
{
  "error": {
    "code": string, // "AUTH_REQUIRED", "INVALID_INPUT", etc.
    "message": string, // User-friendly message
    "details": any | null // Optional debug info
  }
}
```

**HTTP Status Codes**:
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (logged in but no permission)
- `404` - Not found
- `500` - Server error

---

## Loading & Empty States

### Loading State
While `fetch()` is in progress:
- Show skeleton loaders
- Disable interactive elements
- Keep previous data visible (if any)

### Empty State
When data arrays are empty:
```typescript
{
  "items": [],
  "pagination": { total: 0 }
}
```
- Show "No items found" message
- Provide action (e.g., "Connect your website")

### Error State
When API returns error:
- Show error message from `error.message`
- Provide retry button
- Log `error.code` for debugging

---

## Data Refresh Strategy

**Dashboard**: 
- Fetch on mount
- Auto-refresh every 60 seconds
- Manual refresh button

**Ads Page**:
- Fetch on mount
- Auto-refresh every 30 seconds (status updates)
- Manual "Sync Now" triggers immediate fetch

**Settings**:
- Fetch on mount
- No auto-refresh (static data)
- Re-fetch after save

**Inventory**:
- Fetch on mount + pagination/filter change
- No auto-refresh
- Manual refresh button

---

## Testing Checklist

Before designing:
- [ ] Identify which API endpoint the screen uses
- [ ] List all fields that will be displayed
- [ ] Confirm all fields exist in contract (no invented data)
- [ ] Design loading state
- [ ] Design empty state (no data)
- [ ] Design error state (API failure)
- [ ] Check constraint compliance (no spend data in customer UI)

---

**Next Steps**:
1. Cross-reference every Figma frame with this document
2. Mark any fields that don't exist in contracts
3. Remove or replace invented data
4. Add loading/empty/error states to designs

**Related Documents**:
- `ROUTE-INVENTORY.md` - Which routes use which APIs
- `ERROR-STATES.md` - Detailed error handling
- `DATA-FLOWS.md` - API call sequences