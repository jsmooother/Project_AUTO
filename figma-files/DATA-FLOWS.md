# Data Flows - API Call Sequences

**Last Updated**: February 7, 2026  
**Purpose**: Document how data flows through the application

---

## Onboarding Flow Sequence (3-Step)

### New User Journey

```
1. User visits /signup
   └─> POST /api/auth/signup { email, password, company }
       └─> Response: { success: true, redirectTo: "/onboarding/start" }

2. Redirect to /onboarding/start
   └─> No API call (static welcome/value prop content)
   └─> User clicks "Get Started"
       └─> Navigate to /onboarding/connect

3. /onboarding/connect - Connect Website
   └─> User enters URL
   └─> POST /api/onboarding/website { url: "..." }
       ├─> Loading state (disable form)
       └─> Response: { success: true, itemsFound: 247 }
           ├─> Show success message
           └─> Navigate to /onboarding/launch after 2s

4. /onboarding/launch - Connect Ads + Set Budget
   └─> Part 1: Meta OAuth
       └─> User clicks "Connect Meta Account"
       └─> GET /api/auth/meta/connect
           ├─> Redirect to Meta OAuth page (external)
           └─> User authorizes
               └─> Meta redirects to /api/auth/meta/callback?code=xxx
                   ├─> Backend exchanges code for token
                   └─> Redirect back to /onboarding/launch
   
   └─> Part 2: Set Budget & Launch
       └─> User enters budget, targeting settings
       └─> POST /api/onboarding/launch { 
             monthlyBudget: 2500, 
             currency: "USD",
             targeting: { countries: ["US"], ageMin: 25, ageMax: 65 }
           }
           ├─> Loading state
           └─> Response: { 
                 success: true, 
                 campaignId: "...", 
                 redirectTo: "/app/dashboard" 
               }
               ├─> Show success toast
               └─> Redirect to /app/dashboard

5. /app/dashboard (first visit)
   └─> GET /api/customer/dashboard
       └─> Response: { status: "running", ... }
           └─> Show "Ads Running" status
```

**Total API Calls**: 4
1. Signup
2. Website connection test
3. Meta OAuth (redirect)
4. Launch campaign

**Total Time**: ~3-5 minutes (including Meta auth)

---

## Dashboard Data Flow

### Initial Load

```
User navigates to /app/dashboard
   │
   ├─> GET /api/customer/dashboard
   │   └─> Response:
   │       {
   │         status: "running",
   │         itemCount: 247,
   │         lastSync: "2 hours ago",
   │         performance: { impressions, clicks, ctr, reach },
   │         credits: { remaining: 8240, daysEstimate: 14 },
   │         suggestion: { type: "template", message: "...", link: "/app/templates" }
   │       }
   │
   └─> Render UI:
       ├─> Status hero: "🟢 Ads Running"
       ├─> Performance cards: 123K, 2340, 1.89%, 45.6K
       ├─> Credits card: 8,240 remaining
       └─> Suggestion: "💡 New template available"
```

### Auto-Refresh (every 60 seconds)

```
setInterval(() => {
  GET /api/customer/dashboard
    ├─> Update performance numbers
    ├─> Update lastSync time
    ├─> Update credits (if changed)
    └─> Update suggestion (if new)
}, 60000)
```

**State Updates**:
- If `status` changes: Update badge color/text
- If `suggestion` changes: Show new suggestion (slide in)
- If `credits.daysEstimate < 3`: Show warning badge

---

## Ads Page Data Flow

### Tab 1: Status

```
User navigates to /app/ads
   │
   ├─> GET /api/customer/ads
   │   └─> Response:
   │       {
   │         isLive: true,
   │         autoSync: { enabled: true, nextRun: "in 6 hours" },
   │         lastSync: "2 hours ago",
   │         itemCount: 247,
   │         metaCampaign: {
   │           catalogId: "cat_xxx",
   │           catalogItems: 247,
   │           campaignName: "Acme Auto",
   │           campaignStatus: "active",
   │           adFormats: ["Feed", "Reels"]
   │         }
   │       }
   │
   └─> Render Status Tab:
       ├─> 3 status cards: Live, Last Sync, Items
       ├─> Product Catalog card (catalogId, items)
       ├─> Campaign card (name, status)
       └─> Dynamic Ads card (formats, targeting)
```

### Tab 2: Automation - Toggle Auto-Sync

```
User toggles Auto-Sync switch
   │
   ├─> POST /api/customer/ads/auto-sync { enabled: false }
   │   ├─> Optimistic update: Disable switch immediately
   │   └─> Response: { success: true, nextRun: null }
   │       ├─> Update UI: "Auto-sync disabled"
   │       └─> Hide "Next run" text
   │
   └─> User toggles back on
       ├─> POST /api/customer/ads/auto-sync { enabled: true }
       └─> Response: { success: true, nextRun: "in 6 hours" }
           └─> Update UI: "Next run: Tonight at 2:00 AM"
```

### Manual Sync

```
User clicks "Run Sync Now"
   │
   ├─> POST /api/customer/ads/sync
   │   ├─> Disable button
   │   ├─> Show loading: "Syncing..."
   │   └─> Response: {
   │       success: true,
   │       itemsProcessed: 247,
   │       itemsAdded: 3,
   │       itemsRemoved: 1
   │     }
   │       ├─> Show success toast:
   │       │   "✅ 247 items processed (3 added, 1 removed)"
   │       │
   │       └─> Refresh page data:
   │           GET /api/customer/ads
   │             └─> Update lastSync time
```

**Polling During Sync**:
```
While sync is running:
  Poll every 3 seconds:
    GET /api/customer/ads/sync/status
      └─> { inProgress: true, progress: 45% }
          └─> Update progress bar
```

---

## Settings Page Data Flow

### Initial Load

```
User navigates to /app/settings
   │
   ├─> GET /api/customer/settings
   │   └─> Response:
   │       {
   │         user: { name: "John", email: "john@acme.com", company: "Acme" },
   │         website: { connected: true, url: "...", lastSync: "2h ago", itemsDetected: 247 },
   │         meta: { connected: true, accountId: "act_xxx", businessName: "Acme Ads" }
   │       }
   │
   └─> Populate form fields:
       ├─> Account: name, email, company inputs
       ├─> Website: show connection status
       └─> Meta: show connection status
```

### Save Account Changes

```
User edits name/email/company
   │
   ├─> User clicks "Save Changes"
   │   └─> PATCH /api/customer/settings
   │       {
   │         user: {
   │           name: "John Doe",
   │           email: "john.doe@acme.com",
   │           company: "Acme Inc."
   │         }
   │       }
   │       ├─> Disable form (loading state)
   │       └─> Response: { success: true }
   │           ├─> Show success toast: "✅ Changes saved"
   │           ├─> Re-enable form
   │           └─> No page refresh needed
```

### Test Website Connection

```
User clicks "Test Connection"
   │
   ├─> POST /api/customer/settings/test-website
   │   ├─> Disable button
   │   ├─> Show loading: "Testing..."
   │   └─> Response: { success: true, itemsFound: 247 }
   │       ├─> Show success state: "✅ Connected"
   │       └─> Reset button after 3 seconds
```

### Update Website URL

```
User enters new URL and clicks "Update"
   │
   ├─> PATCH /api/customer/settings
   │   {
   │     website: { url: "https://newsite.com/inventory" }
   │   }
   │   ├─> Disable form
   │   └─> Response: { success: true }
   │       ├─> Show success toast: "✅ URL updated. Scanning inventory..."
   │       │
   │       └─> Background job starts:
   │           ├─> Poll for status:
   │           │   GET /api/customer/settings/scan-status
   │           │   └─> { inProgress: true, itemsFound: 124 }
   │           │
   │           └─> When complete:
   │               GET /api/customer/settings
   │               └─> Update itemsDetected count
```

### Disconnect Meta

```
User clicks "Disconnect" (in Meta section)
   │
   ├─> Show confirmation dialog:
   │   "Are you sure? This will pause all ads."
   │   [Cancel] [Disconnect]
   │
   └─> User confirms
       ├─> POST /api/customer/settings/disconnect-meta
       │   ├─> Show loading
       │   └─> Response: { success: true }
       │       ├─> Update UI: meta.connected = false
       │       ├─> Show "Connect Meta Account" button
       │       └─> Show warning: "Ads are paused"
```

---

## Performance Page Data Flow

### Initial Load with Date Range

```
User navigates to /app/performance
   │
   ├─> Default period: "30d"
   │
   ├─> GET /api/customer/performance?period=30d
   │   └─> Response:
   │       {
   │         summary: { impressions, clicks, ctr, reach, frequency },
   │         daily: [
   │           { date: "2026-01-07", impressions: 4200, clicks: 87, reach: 1850 },
   │           { date: "2026-01-08", impressions: 4350, clicks: 92, reach: 1920 },
   │           ...
   │         ],
   │         topPerformers: [
   │           { itemId: "123", itemTitle: "2024 Honda Civic", impressions: 1200, clicks: 45 }
   │         ]
   │       }
   │
   └─> Render:
       ├─> Summary cards (same as dashboard, but bigger)
       ├─> Line chart (impressions over time)
       ├─> Bar chart (clicks over time)
       └─> Top performers table
```

### Change Date Range

```
User selects "7d" from dropdown
   │
   ├─> GET /api/customer/performance?period=7d
   │   ├─> Show loading overlay on chart
   │   └─> Response: { summary, daily, topPerformers }
   │       └─> Re-render charts with new data
```

### Export Data

```
User clicks "Export CSV"
   │
   ├─> GET /api/customer/performance/export?period=30d
   │   └─> Response: CSV file download
   │       └─> Browser downloads: "performance-2026-02-06.csv"
```

---

## Inventory Page Data Flow

### Initial Load (Paginated)

```
User navigates to /app/inventory
   │
   ├─> GET /api/customer/inventory?page=1&limit=50
   │   └─> Response:
   │       {
   │         items: [
   │           { id: "1", title: "2024 Honda Civic", price: 28000, imageUrl: "...", inStock: true },
   │           ...
   │         ],
   │         pagination: { page: 1, limit: 50, total: 247, totalPages: 5 }
   │       }
   │
   └─> Render:
       ├─> Table with 50 rows
       └─> Pagination: [1] 2 3 4 5
```

### Search

```
User types "Honda" in search box
   │
   ├─> Debounce 300ms
   │
   └─> GET /api/customer/inventory?page=1&limit=50&search=Honda
       ├─> Show loading skeleton
       └─> Response: { items: [...], pagination: { total: 42 } }
           └─> Update table (now showing 42 Honda results)
```

### Filter

```
User applies filter: "In Stock Only"
   │
   ├─> GET /api/customer/inventory?page=1&limit=50&filters[inStock]=true
   │   └─> Response: { items: [...], pagination: { total: 198 } }
   │       └─> Update table
```

### Pagination

```
User clicks page 2
   │
   ├─> GET /api/customer/inventory?page=2&limit=50
   │   ├─> Scroll to top
   │   ├─> Show loading
   │   └─> Response: { items: [...] }
   │       └─> Render new page
```

---

## Billing Page Data Flow

### Initial Load

```
User navigates to /app/billing
   │
   ├─> GET /api/customer/billing
   │   └─> Response:
   │       {
   │         credits: { current: 8240, daysEstimate: 14, lastPurchase: "2026-01-20" },
   │         purchases: [
   │           { id: "inv_123", date: "2026-01-20", amount: 500, credits: 10000, status: "completed" }
   │         ],
   │         upcomingCharge: { date: "2026-02-20", estimatedAmount: 500, currency: "USD" }
   │       }
   │
   └─> Render:
       ├─> Credits card: 8,240 remaining (~14 days)
       ├─> Purchase history table
       └─> Upcoming charge notice
```

### Add Credits

```
User clicks "Add Credits"
   │
   ├─> Show modal with packages:
   │   - $100 = 2,000 credits
   │   - $500 = 10,000 credits
   │   - $1000 = 20,000 credits (+10% bonus)
   │
   └─> User selects $500 package
       ├─> POST /api/customer/billing/purchase { packageId: "pkg_500" }
       │   └─> Response: { checkoutUrl: "https://stripe.com/..." }
       │       └─> Redirect to Stripe checkout
       │
       └─> After payment:
           ├─> Stripe redirects to /app/billing?success=true
           └─> GET /api/customer/billing
               └─> Credits updated: 18,240
```

---

## Admin Data Flow

### Customer Detail View

```
Admin navigates to /admin/customers/123
   │
   ├─> GET /admin/customers/123
   │   Headers: { X-Customer-ID: 123 }
   │   └─> Response:
   │       {
   │         customer: { id, name, email, company, status, createdAt },
   │         connections: { website, meta },
   │         performance: { impressions, clicks, ctr, reach },
   │         spend: {
   │           totalSpend: 2847.32,
   │           avgCPC: 1.22,
   │           avgCPM: 12.50,
   │           last30Days: 847.32
   │         },
   │         billing: { credits: 8240, totalPurchased: 20000, lifetimeValue: 1500 }
   │       }
   │
   └─> Render admin view:
       ├─> Customer info
       ├─> Performance metrics
       ├─> **Spend data (ONLY in admin view)**
       └─> Billing data
```

**Key Difference**:
- ✅ Admin sees `spend` object with CPC, CPM, totalSpend
- ❌ Customer NEVER sees this data

---

## Error Handling Flow

### Network Error

```
GET /api/customer/dashboard
   │
   ├─> Network failure (timeout, offline, 500 error)
   │
   └─> Catch error:
       ├─> Show error toast: "Could not load data"
       ├─> Show error state in UI:
       │   ┌────────────────────────┐
       │   │ ⚠️ Could not load data │
       │   │ [Retry]                │
       │   └────────────────────────┘
       │
       └─> User clicks "Retry"
           └─> Re-fetch data
```

### Validation Error (400)

```
POST /api/onboarding/website { url: "invalid" }
   │
   └─> Response: 400 Bad Request
       {
         error: {
           code: "INVALID_URL",
           message: "Please enter a valid URL",
           details: { field: "url" }
         }
       }
       └─> Show inline error below input:
           "❌ Please enter a valid URL"
```

### Auth Error (401)

```
GET /api/customer/dashboard
   │
   └─> Response: 401 Unauthorized
       {
         error: {
           code: "AUTH_REQUIRED",
           message: "Please log in"
         }
       }
       └─> Clear session
           └─> Redirect to /login
```

---

## Performance Optimization

### Data Caching Strategy

**Dashboard**:
- Cache for 60 seconds
- Invalidate on manual refresh
- Invalidate after user action (sync, toggle)

**Settings**:
- Cache indefinitely
- Invalidate on save

**Inventory**:
- Cache per page
- Invalidate after 5 minutes

**Implementation**:
```typescript
// React Query example
const { data, isLoading } = useQuery(
  ['dashboard'],
  fetchDashboard,
  { staleTime: 60000 } // 60 seconds
)
```

### Optimistic Updates

**Toggle Auto-Sync**:
```typescript
// Update UI immediately
setAutoSync(false)

// Then call API
await toggleAutoSync(false)
  .catch(() => {
    // Revert on error
    setAutoSync(true)
  })
```

---

## Sequence Diagrams

### Complete Onboarding Flow

```
User        Frontend      Backend       Meta
 │              │             │           │
 │─signup──────>│             │           │
 │              │─POST────────>│           │
 │              │<─redirect───│           │
 │<─start──────│             │           │
 │              │             │           │
 │─next────────>│             │           │
 │<─connect────│             │           │
 │              │             │           │
 │─enterURL────>│             │           │
 │              │─POST────────>│           │
 │              │<─247 items──│           │
 │<─success────│             │           │
 │              │             │           │
 │─next────────>│             │           │
 │<─launch─────│             │           │
 │              │             │           │
 │─connect─────>│─redirect───>│──OAuth───>│
 │              │             │<──code────│
 │              │             │─token────>│
 │              │<─redirect───│           │
 │<─launch─────│             │           │
 │              │             │           │
 │─setBudget───>│             │           │
 │              │─POST────────>│           │
 │              │<─campaign───│           │
 │<─dashboard──│             │           │
```

---

**Next Steps**:
1. Map these flows to your current implementation
2. Identify any mismatches
3. Update Figma to reflect actual flows
4. Document any new flows added

**Related Documents**:
- `API-CONTRACTS.md` - Response structures
- `ERROR-STATES.md` - Error handling details
- `FIGMA-SPECS.md` - UI states