# TASK 1 — Figma Discovery (Admin Dashboard)

**Source:** Figma MCP + screenshot of System Configuration (node 1:1737).  
**Note:** MCP `get_metadata` returned advisory text only; structure inferred from sidebar nav and System Config screenshot.

## Admin Dashboard Frames

| Frame/Screen Name | Intended Route | Key UI Elements | States Present |
|-------------------|----------------|-----------------|----------------|
| Overview | /admin or /admin/overview | Summary cards, quick stats | Loading, empty |
| Customers | /admin/customers | Table (name, status, created), Search, Filters | Loading, empty |
| Customer Detail | /admin/customers/[customerId] | Overview panel, Tabs: Overview / Runs / Inventory / Billing | Loading |
| Inventory Sources | /admin/inventory-sources | Table of sources per customer | Loading, empty |
| Runs & Automations | /admin/runs | Table (type, status, customer, timestamps), Filters (type, status, customer) | Loading, empty |
| Run Detail | /admin/runs/[runId] | Run metadata, events/log | Loading |
| Billing & Payments | /admin/billing | (Placeholder - not in scope) | — |
| System Configuration | /admin/system-config | Integration Health cards, Feature Flags, Rate Limits, Kill Switches, Environment Info | — |

## Sidebar Navigation (from Figma)

- Overview
- Customers
- Inventory Sources
- Runs & Automations
- Billing & Payments
- System Config

## System Configuration Page (from screenshot)

- **Integration Health:** Meta API, Stripe API, Job Queue cards (status, uptime, metrics)
- **Feature Flags:** Toggles (Meta API, Nightly Auto-Sync, Manual Runs, etc.)
- **Rate Limits:** Inputs + Update button
- **Kill Switches:** Red-themed emergency toggles
- **Environment Info:** Read-only key-value display
