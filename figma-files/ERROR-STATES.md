# Error States & Edge Cases

**Last Updated**: February 6, 2026  
**Purpose**: Define how to handle errors and edge cases in the UI

---

## Error Handling Philosophy

### Principles

1. **Never blame the user**: "Could not connect" not "You entered invalid data"
2. **Always offer recovery**: Provide "Retry" or "Fix This" actions
3. **Explain impact**: "Ads will pause" not just "Error"
4. **Stay calm**: Use ⚠️ warnings instead of ❌ errors when possible
5. **Context matters**: Same error shows differently in onboarding vs settings

---

## Error Types & Handling

### Network Errors

#### Timeout (Request took too long)

**Scenario**: API call exceeds 30 seconds

**UI Treatment**:
```
┌─────────────────────────────────┐
│  ⏱️ Request Timed Out           │
│                                 │
│  This is taking longer than     │
│  expected. Please check your    │
│  internet connection.           │
│                                 │
│  [Try Again]                    │
└─────────────────────────────────┘
```

**Toast** (inline action):
```
⚠️ Request timed out [Retry]
```

**Code**:
```typescript
if (error.code === 'TIMEOUT') {
  showToast({
    type: 'warning',
    message: 'Request timed out',
    action: { label: 'Retry', onClick: refetch }
  })
}
```

---

#### Offline (No Internet)

**Scenario**: User's device is offline

**UI Treatment**:
```
┌─────────────────────────────────┐
│  📡 You're Offline              │
│                                 │
│  Check your internet connection │
│  and we'll try again.           │
│                                 │
│  [Retry When Online]            │
└─────────────────────────────────┘
```

**Behavior**:
- Auto-retry when connection restored
- Show banner at top of page (not blocking)
- Preserve user's unsaved work

---

#### Server Error (500)

**Scenario**: Backend server error

**UI Treatment**:
```
┌─────────────────────────────────┐
│  ⚠️ Something Went Wrong        │
│                                 │
│  Our servers are having trouble.│
│  We've been notified.           │
│                                 │
│  [Try Again]                    │
└─────────────────────────────────┘
```

**Copy by Context**:

**Dashboard**:
```
Could not load dashboard. [Retry]
```

**Settings Save**:
```
Could not save changes. [Try Again]
```

**Onboarding**:
```
Setup error. Please try again or contact support.
```

---

### Validation Errors (400)

#### Invalid URL Format

**Scenario**: User enters non-URL in website field

**Inline Error** (onboarding/settings):
```
Website URL
┌─────────────────────────────────┐
│ notavalidurl                    │ ❌
└─────────────────────────────────┘
Please enter a valid URL
(e.g., https://yoursite.com)
```

**Toast** (form submission):
```
❌ Please enter a valid URL
```

---

#### Missing Required Field

**Scenario**: User leaves required field empty

**Inline Error**:
```
Email Address *
┌─────────────────────────────────┐
│                                 │ ❌
└─────────────────────────────────┘
This field is required
```

**Behavior**:
- Show error on blur (after user leaves field)
- Don't show on initial render
- Clear error when user types

---

#### Number Out of Range

**Scenario**: Budget too low or too high

**Inline Error**:
```
Monthly Budget
┌─────────────────────────────────┐
│ $ 50                            │ ❌
└─────────────────────────────────┘
Minimum budget is $100
```

**For Too High**:
```
Maximum budget is $50,000 per month
```

---

### Authentication Errors (401)

#### Session Expired

**Scenario**: User's session cookie expired

**Modal** (blocking):
```
┌─────────────────────────────────┐
│  🔒 Session Expired             │
│                                 │
│  Please log in again to         │
│  continue.                      │
│                                 │
│  [Log In]                       │
└─────────────────────────────────┘
```

**Behavior**:
- Save user's current page URL
- Redirect to `/login?returnTo=/app/dashboard`
- After login, return to saved page

---

#### Invalid Credentials

**Scenario**: Wrong email/password on login

**Inline Error** (login page):
```
┌─────────────────────────────────┐
│ ❌ Invalid email or password    │
│                                 │
│ Please check your credentials   │
│ and try again.                  │
│                                 │
│ [Forgot Password?]              │
└─────────────────────────────────┘
```

**Security Note**: Don't reveal whether email exists ("Invalid credentials" not "Email not found")

---

### Permission Errors (403)

#### Insufficient Permissions

**Scenario**: Customer tries to access admin route

**Full Page Error**:
```
┌─────────────────────────────────┐
│                                 │
│         🚫                      │
│                                 │
│  Access Denied                  │
│                                 │
│  You don't have permission to   │
│  view this page.                │
│                                 │
│  [Go to Dashboard]              │
│                                 │
└─────────────────────────────────┘
```

---

### Not Found Errors (404)

#### Page Not Found

**Scenario**: User navigates to non-existent route

**Full Page Error**:
```
┌─────────────────────────────────┐
│                                 │
│         404                     │
│                                 │
│  Page Not Found                 │
│                                 │
│  The page you're looking for    │
│  doesn't exist.                 │
│                                 │
│  [Go to Dashboard]              │
│  [Back to Previous Page]        │
│                                 │
└─────────────────────────────────┘
```

---

#### Resource Not Found

**Scenario**: Campaign ID doesn't exist

**In-Page Error**:
```
┌─────────────────────────────────┐
│  ⚠️ Campaign Not Found          │
│                                 │
│  This campaign may have been    │
│  deleted or moved.              │
│                                 │
│  [View All Campaigns]           │
└─────────────────────────────────┘
```

---

## Business Logic Errors

### Website Connection Failed

**Scenario**: Cannot scrape inventory from URL

**Error States**:

1. **No Response** (timeout):
```
❌ Could not connect to this URL

The website didn't respond. Check that:
• The URL is correct
• The page is publicly accessible
• Your firewall isn't blocking us

[Try Again]
```

2. **No Items Found** (scraped but empty):
```
⚠️ No vehicles found

We connected to your website but 
couldn't find any inventory items.

Make sure:
• Items are listed on this page
• The page structure is standard HTML

[Try Different URL] [Contact Support]
```

3. **Access Denied** (403):
```
❌ Access Denied

This website is blocking our access.

You may need to whitelist our IP
address in your firewall.

[View Setup Guide] [Contact Support]
```

---

### Meta Connection Errors

#### OAuth Failed

**Scenario**: Meta redirected back with error

**Onboarding** (blocking):
```
┌─────────────────────────────────┐
│  ⚠️ Meta Connection Failed      │
│                                 │
│  We couldn't connect to your    │
│  Meta account.                  │
│                                 │
│  Common reasons:                │
│  • Permissions were denied      │
│  • Account not authorized       │
│  • Session expired              │
│                                 │
│  [Try Again] [Contact Support]  │
└─────────────────────────────────┘
```

**Settings** (non-blocking):
```
Toast: ⚠️ Could not connect to Meta [Retry]
```

---

#### Token Expired

**Scenario**: Meta API returns 401 (token expired)

**Dashboard Warning**:
```
┌─────────────────────────────────┐
│  ⚠️ Meta Connection Lost        │
│                                 │
│  Your Meta access has expired.  │
│  Ads will pause until you       │
│  reconnect.                     │
│                                 │
│  [Reconnect Meta Account]       │
└─────────────────────────────────┘
```

**Behavior**:
- Show warning banner at top of all pages
- Don't block user from using app
- Pause automation until reconnected

---

### Sync Errors

#### Partial Sync Failure

**Scenario**: 200 items synced, 47 failed

**Toast**:
```
⚠️ Sync completed with errors
200 items updated, 47 failed

[View Details]
```

**Detail View**:
```
┌─────────────────────────────────┐
│  Sync Report                    │
│                                 │
│  ✅ 200 items synced            │
│  ❌ 47 items failed             │
│                                 │
│  Failed Items:                  │
│  • 2024 Honda Civic (ID: 123)   │
│    Error: Missing price         │
│  • 2023 Toyota Camry (ID: 456)  │
│    Error: Invalid image URL     │
│  ...                            │
│                                 │
│  [Export Failed Items]          │
│  [Retry Failed Items]           │
└─────────────────────────────────┘
```

---

#### Complete Sync Failure

**Scenario**: All items failed to sync

**Dashboard Warning** (prominent):
```
┌─────────────────────────────────┐
│  ❌ Sync Failed                 │
│                                 │
│  Could not sync your inventory. │
│  Ads may show outdated items.   │
│                                 │
│  [Retry Sync] [View Diagnostics]│
└─────────────────────────────────┘
```

---

### Credit/Billing Errors

#### Insufficient Credits

**Scenario**: Credits ran out, ads paused

**Dashboard Alert** (top banner):
```
┌──────────────────────────────────────────┐
│  ⚠️ Ads Paused - No Credits Remaining   │
│  Add credits to resume advertising       │
│  [Add Credits]                           │
└──────────────────────────────────────────┘
```

**Behavior**:
- Show on all pages until resolved
- Send email notification
- Pause automation

---

#### Payment Failed

**Scenario**: Credit card declined

**Billing Page Error**:
```
┌─────────────────────────────────┐
│  ❌ Payment Failed              │
│                                 │
│  Your card was declined.        │
│                                 │
│  Please:                        │
│  • Check card details           │
│  • Try a different card         │
│  • Contact your bank            │
│                                 │
│  [Update Payment Method]        │
└─────────────────────────────────┘
```

---

## Empty States

### No Data Yet (Before Setup)

**Dashboard**:
```
┌─────────────────────────────────┐
│           🔧                    │
│                                 │
│  Setup Needed                   │
│                                 │
│  Complete these steps to start: │
│  ☐ Connect your website         │
│  ☐ Connect Meta account         │
│  ☐ Launch campaign              │
│                                 │
│  [Continue Setup]               │
└─────────────────────────────────┘
```

**Inventory**:
```
┌─────────────────────────────────┐
│           📦                    │
│                                 │
│  No Inventory Yet               │
│                                 │
│  Connect your website to import │
│  your vehicle inventory.        │
│                                 │
│  [Connect Website]              │
└─────────────────────────────────┘
```

---

### No Results (Search/Filter)

**Inventory Search** (no matches):
```
┌─────────────────────────────────┐
│  🔍 No Results                  │
│                                 │
│  No vehicles match "Honda Civic │
│  2020"                          │
│                                 │
│  Try:                           │
│  • Checking your spelling       │
│  • Using fewer keywords         │
│  • Browsing all inventory       │
│                                 │
│  [Clear Search]                 │
└─────────────────────────────────┘
```

**Performance** (no data for period):
```
┌─────────────────────────────────┐
│  📊 No Data                     │
│                                 │
│  No performance data for this   │
│  time period.                   │
│                                 │
│  [Change Date Range]            │
└─────────────────────────────────┘
```

---

## Loading States

### Page Load

**Dashboard** (skeleton):
```
┌─────────────────────────────────┐
│  Dashboard                      │
│                                 │
│  ▯▯▯▯▯▯▯▯▯▯                    │
│  ▯▯▯▯▯▯▯                        │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ▯▯▯ │ │ ▯▯▯ │ │ ▯▯▯ │       │
│  │ ▯▯  │ │ ▯▯  │ │ ▯▯  │       │
│  └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────┘
```

**Behavior**:
- Show skeleton immediately
- Preserve layout (no shifting)
- Fade in real content

---

### Action in Progress

**Sync Running**:
```
┌─────────────────────────────────┐
│  Syncing Inventory...           │
│                                 │
│  [===========·········] 60%     │
│                                 │
│  Processed 150 of 247 items     │
└─────────────────────────────────┘
```

**Saving**:
```
[Saving...] (button disabled, spinner icon)
```

**Testing Connection**:
```
[Testing...] (button disabled, spinner icon)
```

---

### Long-Running Operations

**Scenario**: Operation takes > 30 seconds

**UI**:
```
┌─────────────────────────────────┐
│  ⏳ This May Take a While       │
│                                 │
│  Scanning your website for      │
│  inventory items...             │
│                                 │
│  You can close this page. We'll │
│  email you when it's done.      │
│                                 │
│  [Close] [Keep Waiting]         │
└─────────────────────────────────┘
```

---

## Rate Limiting

**Scenario**: User triggered too many sync requests

**Error**:
```
⚠️ Too Many Requests

You can only sync once every 5 minutes.

Next sync available in 3 minutes.

[OK]
```

---

## Offline Behavior

### Actions While Offline

**Scenario**: User tries to save while offline

**Behavior**:
1. **Queue action** (if safe)
2. **Show pending state**:
```
⏳ Changes will save when you're back online
```

3. **Auto-retry** when connection restored
4. **Confirm success**:
```
✅ Changes saved
```

### Read-Only Mode

**Scenario**: Offline but viewing data

**Banner**:
```
┌──────────────────────────────────────────┐
│  📡 Offline Mode                         │
│  Showing last known data. Changes are    │
│  disabled until you're back online.      │
└──────────────────────────────────────────┘
```

---

## Edge Cases

### Concurrent Edits (Multiple Tabs)

**Scenario**: User has 2 tabs open, edits in both

**Conflict Detection**:
```
┌─────────────────────────────────┐
│  ⚠️ Conflict Detected           │
│                                 │
│  This data was updated in       │
│  another tab.                   │
│                                 │
│  [Reload Page] [Keep My Changes]│
└─────────────────────────────────┘
```

---

### Data Staleness

**Scenario**: User left page open for hours

**Banner**:
```
┌──────────────────────────────────────────┐
│  ℹ️ This data may be outdated [Refresh]  │
└──────────────────────────────────────────┘
```

**Auto-Refresh**:
- Show banner after 10 minutes of inactivity
- Don't auto-refresh if user is typing

---

### Partial Feature Availability

**Scenario**: Meta connected, but catalog not created yet

**Ads Page**:
```
┌─────────────────────────────────┐
│  ⚙️ Setup In Progress           │
│                                 │
│  Meta is creating your product  │
│  catalog. This takes 5-10 min.  │
│                                 │
│  [Refresh Status]               │
└─────────────────────────────────┘
```

---

### Browser Compatibility

**Scenario**: User on unsupported browser (IE11)

**Full Page Warning**:
```
┌─────────────────────────────────┐
│  ⚠️ Unsupported Browser         │
│                                 │
│  Agentic Ads works best on:     │
│  • Chrome                       │
│  • Firefox                      │
│  • Safari                       │
│  • Edge                         │
│                                 │
│  [Download Chrome]              │
│  [Continue Anyway]              │
└─────────────────────────────────┘
```

---

## Error Recovery Patterns

### Automatic Retry

**When to Use**:
- Network timeouts
- 5xx server errors
- Transient failures

**Implementation**:
```typescript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url)
    } catch (error) {
      if (i === retries - 1) throw error
      await delay(1000 * (i + 1)) // Exponential backoff
    }
  }
}
```

---

### Manual Retry

**When to Use**:
- User input errors
- Permission issues
- Business logic failures

**UI Pattern**:
```
┌─────────────────────────────────┐
│  ❌ Error Message Here          │
│                                 │
│  Explanation of what went wrong │
│  and how to fix it.             │
│                                 │
│  [Try Again] [Get Help]         │
└─────────────────────────────────┘
```

---

### Fallback to Cached Data

**When to Use**:
- Network offline
- Server slow/down
- Recent data available

**UI Pattern**:
```
┌──────────────────────────────────────────┐
│  ℹ️ Showing cached data from 2 hours ago │
│  [Refresh]                               │
└──────────────────────────────────────────┘
```

---

## Error Logging

### What to Log

**Client-Side** (send to backend):
```typescript
{
  errorType: 'API_ERROR',
  endpoint: '/api/customer/dashboard',
  statusCode: 500,
  message: 'Internal server error',
  userId: '123',
  timestamp: '2026-02-06T14:32:00Z',
  userAgent: 'Chrome/120.0',
  url: '/app/dashboard'
}
```

**Backend** (store in logs):
```typescript
{
  errorType: 'DATABASE_ERROR',
  query: 'SELECT * FROM customers WHERE...',
  error: 'Connection pool exhausted',
  customerId: '123',
  timestamp: '2026-02-06T14:32:00Z',
  stack: '...'
}
```

### Error Tracking Checklist

- [ ] User sees friendly error message
- [ ] Error logged to backend
- [ ] Support team notified (if critical)
- [ ] User can recover (retry, alternative path)
- [ ] No sensitive data in error message

---

## Testing Error States

### Checklist for Each Screen

- [ ] Network timeout
- [ ] Server error (500)
- [ ] Unauthorized (401)
- [ ] Not found (404)
- [ ] Validation errors
- [ ] Empty state (no data)
- [ ] Loading state
- [ ] Partial failure state
- [ ] Offline mode

---

**Next Steps**:
1. Create Figma frames for all error states
2. Test each error scenario
3. Ensure error copy follows `COPY-GUIDELINES.md`
4. Document error codes in backend

**Related Documents**:
- `COPY-GUIDELINES.md` - Error message copy
- `FIGMA-SPECS.md` - UI components for errors
- `DATA-FLOWS.md` - When errors occur in flows
