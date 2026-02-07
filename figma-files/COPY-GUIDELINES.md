# Copy Guidelines - User-Facing Language

**Last Updated**: February 6, 2026  
**Purpose**: Consistent, non-technical language across the app

---

## Voice & Tone

### Brand Voice
- **Calm**: Never alarming, even for errors
- **Confident**: "Your ads are running" not "Ads might be running"
- **Clear**: Plain language, no jargon
- **Helpful**: Guide users, don't lecture

### Tone by Context

**Onboarding**: Encouraging, excited
- "Let's get you set up"
- "You're almost there!"
- "Welcome to Agentic Ads"

**Dashboard**: Informative, calm
- "Ads running"
- "247 vehicles advertised"
- "Last synced 2 hours ago"

**Settings**: Straightforward, precise
- "Connected"
- "Update website URL"
- "Test connection"

**Errors**: Helpful, not blaming
- "Could not connect to this URL" (not "You entered an invalid URL")
- "Please try again" (not "Error: retry required")
- "Check your website settings" (not "Configuration failure")

---

## Key Terminology

### Preferred Terms

| ✅ Use This | ❌ Not This | Why |
|------------|-------------|-----|
| **Inventory** | Feed, catalog, product data | More natural for car dealers |
| **Advertise** | Sync, publish, push | What the user cares about |
| **Website** | Source, endpoint, URL | Familiar term |
| **Budget** | Daily spend cap, cost limit | Common financial term |
| **Credits** | Balance, tokens | Clearer than "remaining budget" |
| **Running** | Active, live, enabled | More dynamic |
| **Paused** | Disabled, stopped, inactive | Implies reversible |
| **Setup** | Configuration, initialization | Simpler |
| **Connect** | Integrate, authenticate, authorize | Action-oriented |
| **Campaign** | Ad set, ad group | Industry standard (Meta term) |

### Avoid Jargon

❌ **Technical**: "OAuth flow initiated"  
✅ **Plain**: "Connecting to Meta..."

❌ **Technical**: "Catalog sync in progress"  
✅ **Plain**: "Updating your advertised inventory"

❌ **Technical**: "API rate limit exceeded"  
✅ **Plain**: "Too many requests. Please wait a moment."

❌ **Technical**: "Webhook validation failed"  
✅ **Plain**: "Could not connect to your website"

---

## Status Messages

### Success States

**Connection Successful**:
```
✅ Connected
✅ 247 vehicles found
✅ Website connected successfully
```

**Action Completed**:
```
✅ Changes saved
✅ Sync complete
✅ Ads are now running
```

**Generic Success**:
```
✅ Done
✅ All set
```

### Loading States

**Connection Testing**:
```
Testing connection...
Checking your website...
Connecting to Meta...
```

**Processing**:
```
Syncing inventory...
Updating ads...
Launching campaign...
Saving changes...
```

**Generic Loading**:
```
Loading...
Please wait...
```

### Error States

**Connection Errors**:
```
❌ Could not connect to this URL
⚠️ Website connection lost
⚠️ Meta connection expired
```

**Validation Errors**:
```
Please enter a valid URL
Budget must be at least $100
This field is required
```

**System Errors**:
```
Something went wrong. Please try again.
Could not load data. [Retry]
Service temporarily unavailable
```

**Friendly Errors** (no ❌ icon):
```
No vehicles found on this page
No data available yet
No templates created
```

---

## Button Labels

### Primary Actions

**Onboarding**:
- "Start Setup"
- "Test Connection"
- "Connect Meta Account"
- "Launch Automated Ads"

**Main App**:
- "Sync Now"
- "Add Credits"
- "Save Changes"
- "Run Sync Now"

**Navigation**:
- "Continue"
- "Next Step"
- "Back"
- "Go to Dashboard"

### Secondary Actions

- "Learn More"
- "View Details"
- "Edit Settings"
- "Test Connection"
- "Cancel"

### Destructive Actions

- "Disconnect"
- "Pause Automation"
- "Delete Account"
- "Remove"

**Note**: Always require confirmation for destructive actions

---

## Empty States

### No Data Yet

**Dashboard** (before first sync):
```
🔧 Setup Needed

Complete these steps to start advertising:
☐ Connect your website
☐ Connect Meta account
☐ Launch campaign

[Get Started]
```

**Inventory** (no items):
```
📦 No Inventory Found

We couldn't find any vehicles on your website.

Make sure your inventory page is publicly accessible.

[Check Settings]
```

**Templates** (none created):
```
🎨 No Templates Yet

Templates let you customize how your ads look.

[Create Your First Template]
```

### No Results

**Search** (no matches):
```
No vehicles match "Honda Civic 2020"

Try:
• Checking your spelling
• Using fewer keywords
• Browsing all inventory
```

**Filters** (no matches):
```
No vehicles match these filters

[Clear Filters]
```

---

## Helper Text

### Inline Help (Below Inputs)

**Website URL**:
```
This is the page where your vehicle inventory is listed
```

**Budget**:
```
You can adjust this anytime in Settings
```

**Company Name**:
```
Shown in your Meta business profile
```

### Tooltips (Hover/Click)

**CTR**:
```
Click-through rate: percentage of people who clicked your ad
```

**Reach**:
```
Number of unique people who saw your ads
```

**Credits**:
```
Credits are used to advertise your vehicles. Add more when running low.
```

---

## Confirmation Dialogs

### Destructive Actions

**Disconnect Website**:
```
Disconnect Website?

This will:
• Stop all automation
• Keep existing ads running
• Preserve your settings

You can reconnect anytime.

[Cancel] [Disconnect]
```

**Delete Account**:
```
Delete Your Account?

This will permanently:
• Delete all your data
• Stop all ads
• Cancel your billing

This cannot be undone.

[Cancel] [Delete Account]
```

**Pause Automation**:
```
Pause Automation?

• Scheduled syncs will stop
• Current ads stay active
• You can resume anytime

[Cancel] [Pause]
```

### Non-Destructive Confirmations

**Change Website URL**:
```
Update Website URL?

We'll scan the new URL for inventory. This may take a few minutes.

[Cancel] [Update]
```

---

## Notifications & Toasts

### Success Toasts

```
✅ Changes saved
✅ Sync complete (247 items processed)
✅ Website connected
✅ Credits added
```

### Error Toasts

```
❌ Could not save changes
⚠️ Sync failed. [Retry]
⚠️ Connection lost. Reconnect in Settings
```

### Info Toasts

```
ℹ️ Sync starting...
ℹ️ This may take a few minutes
ℹ️ You'll receive an email when complete
```

---

## Page Headers

### Main Pages

**Dashboard**:
```
Dashboard
Check your ad status and performance
```

**Inventory**:
```
Inventory
247 vehicles from your website
```

**Templates**:
```
Ad Templates
Customize how your ads look
```

**Ads**:
```
Ads
Your Meta campaign status and automation
```

**Performance**:
```
Performance
Detailed metrics and trends
```

**Billing**:
```
Billing
Credits and payment history
```

**Settings**:
```
Settings
Manage your account and connections
```

### Sub-Pages

**Campaign Detail**:
```
Campaign: Acme Auto - Dynamic Inventory
Running since Jan 28, 2026
```

**Diagnostics**:
```
Diagnostics
System health and troubleshooting
```

---

## Call-to-Action Copy

### Upsell / Growth

**Low Credits**:
```
⚠️ Credits running low

You have 8 days left at current pace.

[Add Credits]
```

**Template Suggestion**:
```
💡 New template available

Preview how your ads could look better.

[Preview Template]
```

**Inventory Growth**:
```
🎉 12 new vehicles detected

Sync now to start advertising them.

[Sync Now]
```

### Feature Discovery

**First Template**:
```
🎨 Customize Your Ads

Create a template to match your brand.

[Create Template]
```

**Performance Details**:
```
📊 See Detailed Metrics

View trends and top performers.

[View Performance]
```

---

## Error Messages by Type

### Network Errors

**Connection Timeout**:
```
Request timed out. Check your internet connection and try again.
```

**Offline**:
```
You're offline. Please check your internet connection.
```

**Server Error (500)**:
```
Our servers are having trouble. Please try again in a moment.
```

### Validation Errors

**Required Field**:
```
This field is required
```

**Invalid URL**:
```
Please enter a valid URL (e.g., https://yoursite.com)
```

**Invalid Email**:
```
Please enter a valid email address
```

**Number Too Low**:
```
Budget must be at least $100
```

**Number Too High**:
```
Maximum budget is $50,000 per month
```

### Business Logic Errors

**Already Connected**:
```
This website is already connected
```

**Meta Auth Failed**:
```
Could not connect to Meta. Please try again.
```

**Insufficient Credits**:
```
Not enough credits. Add credits to continue.
```

**Item Not Found**:
```
This vehicle is no longer in your inventory
```

---

## Relative Time Formatting

**Recent** (< 1 minute):
```
Just now
Moments ago
```

**Minutes** (1-59 minutes):
```
2 minutes ago
45 minutes ago
```

**Hours** (1-23 hours):
```
1 hour ago
6 hours ago
```

**Days** (1-6 days):
```
Yesterday
2 days ago
```

**Weeks** (7-30 days):
```
Last week
3 weeks ago
```

**Months** (30+ days):
```
Last month
3 months ago
```

**Future**:
```
in 2 hours
in 6 hours
Tonight at 2:00 AM
Tomorrow at 9:00 AM
```

---

## Number Formatting

### Large Numbers

**Impressions, Reach**:
```
1,234 → 1.2K
12,345 → 12.3K
123,456 → 123K
1,234,567 → 1.2M
```

**Money** (always show currency):
```
$1,234.56
€2,500.00
kr 15,000 (Swedish)
```

**Percentages** (2 decimal places):
```
1.89%
12.34%
100.00%
```

### Counts

**Items**:
```
1 vehicle
247 vehicles
0 vehicles (show as "No vehicles")
```

**Credits**:
```
8,240 credits
~14 days remaining
```

---

## Multi-Language Support

### Current Languages
- English (default)
- Swedish
- German

### Translation Principles

1. **Keep it simple**: Complex English is hard to translate
2. **Avoid idioms**: "Hit the ground running" doesn't translate well
3. **Use icons**: Universal understanding
4. **Test lengths**: German is 30% longer than English

### Example Translations

**"Ads Running"**:
- 🇺🇸 EN: Ads Running
- 🇸🇪 SE: Annonser Kör
- 🇩🇪 DE: Anzeigen Laufen

**"Last synced 2 hours ago"**:
- 🇺🇸 EN: Last synced 2 hours ago
- 🇸🇪 SE: Senast synkroniserad för 2 timmar sedan
- 🇩🇪 DE: Zuletzt synchronisiert vor 2 Stunden

---

## Microcopy Reference

### Settings Sections

**Account Information**:
```
Account information
Your personal details
```

**Website Connection**:
```
Connected website
Your inventory source
```

**Meta Connection**:
```
Meta Ads
Facebook & Instagram advertising
```

**Danger Zone**:
```
Danger zone
Irreversible actions
```

### Ads Page Tabs

**Status Tab**:
```
Status
View campaign objects and live status
```

**Automation Tab**:
```
Automation
Manage auto-sync and manual triggers
```

### Dashboard Metrics

**Impressions**:
```
Impressions
Times your ads were shown
```

**Clicks**:
```
Clicks
Times people clicked your ads
```

**CTR**:
```
CTR
Click-through rate
```

**Reach**:
```
Reach
Unique people reached
```

---

## Copy Testing Checklist

Before finalizing copy:

- [ ] Uses preferred terminology (no jargon)
- [ ] Tone matches context (calm for errors, encouraging for onboarding)
- [ ] Actionable (tells user what to do)
- [ ] Concise (no unnecessary words)
- [ ] Translatable (simple structure, no idioms)
- [ ] Accessible (clear without icons/color)
- [ ] Consistent with existing copy

---

**Next Steps**:
1. Audit all Figma text against this guide
2. Replace jargon with plain language
3. Ensure button labels are action-oriented
4. Add helper text where needed

**Related Documents**:
- `FIGMA-SPECS.md` - UI specifications
- `ERROR-STATES.md` - Error message details
