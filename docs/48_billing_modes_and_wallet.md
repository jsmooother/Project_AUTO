# Billing Modes and Wallet

## Locked rule: no Meta spend in customer scope

- **Customer endpoints** must never return spend-like fields: `spend`, `CPC`, `CPM`, `cost_per_*`.
- **Customer UI** may only show: credits remaining, credits used, delivery metrics (impressions, clicks, CTR, reach).
- Admin budget → burn → ledger is the source of truth. Spend is admin-only (Meta insights). Margin = revenue (credits consumed) − Meta spend.

See `.cursor/rules/no-spend-customer-scope.mdc` for the project rule.

## Definitions

- **Customer credits (Project Auto Credits)**: The customer-facing balance and consumption, expressed in SEK. Customers see only credits and delivery metrics (impressions, clicks, CTR, reach). Never Meta spend, CPM, or CPC in customer UI/API.
- **Meta spend**: Actual spend in Meta Ads. Admin-only. Used for margin and pacing controls.
- **Ledger**: `customer_ledger_entries` is the source of truth. Entries are `topup`, `consumption`, or `adjustment`. Balance is the sum of `amount_sek`.
- **Balance cache**: `customer_balance_cache` is optional; ledger is authoritative. Cache is updated on writes for fast reads.

## Billing Modes

### Mode A: Time-based burn (default)

- **When**: `ads_budget_plans.billing_mode = 'time_based'` (default for self-checkout).
- **Burn**: Daily charge = `customer_monthly_price / 30`. One consumption entry per day (idempotent by `customer_id`, `period_date`, `meta_campaign_id` = null).
- **Idempotency**: One consumption row per customer per `period_date` with `meta_campaign_id` null.

### Mode B: Impression-based burn

- **When**: `ads_budget_plans.billing_mode = 'impression_based'`. Requires `customer_cpm_sek` and a Meta campaign.
- **Burn**: For each `period_date`, fetch campaign insights (impressions for that day). Charge = `(impressions / 1000) * customer_cpm_sek`. One consumption entry per customer per `period_date` per `meta_campaign_id`.
- **Idempotency**: One consumption row per customer, `period_date`, and `meta_campaign_id` (campaignId).

## Admin levers and allowed ranges

Stored on `ads_budget_plans`:

- **Margin**: `margin_percent` must be in `[lever_min_margin_percent, lever_max_margin_percent]` (defaults 60–80).
- **Meta ratio**: `meta_monthly_cap / customer_monthly_price` must be in `[lever_min_meta_ratio, lever_max_meta_ratio]` (defaults 0.20–0.40).
- **Customer CPM (impression_based)**: `customer_cpm_sek` is clamped to [100, 400] SEK for MVP (configurable via env later).

Admin can update these via `POST /admin/customers/:customerId/ads/budget`. Server enforces the above constraints.

## How burn is computed

1. **No plan or plan paused**: No burn.
2. **Balance ≤ 0**: Skip burn, log `no_balance`.
3. **Time-based**: `dailyCharge = customer_monthly_price / 30`. Cap at current balance. Insert consumption `amount_sek = -charge`, `period_date`, `meta_campaign_id` null. Idempotent: skip if consumption already exists for that customer/date (null campaign).
4. **Impression-based**: Get campaign insights for `period_date` (impressions). `creditCharge = (impressions / 1000) * customer_cpm_sek`. Cap at balance. Insert consumption with `period_date`, `meta_campaign_id` = campaignId. Idempotent: skip if consumption exists for that customer/date/campaign.

After each ledger insert, balance cache is updated (sum from ledger or increment).

## Technical safeguards (idempotency, dates, paused / no-delivery)

### 1. Burn job idempotency

- **One burn per (customerId, date)** — running `POST /billing/burn` twice for the same date does **not** double-burn.
- **Implementation**: (1) Worker checks for an existing consumption entry for that customer + period_date + meta_campaign_id before inserting; (2) DB enforces `UNIQUE (customer_id, period_date, COALESCE(meta_campaign_id, '')) WHERE type = 'consumption'` (migration `0028_customer_ledger_entries`). Either the early exit or the constraint would prevent duplicates.

### 2. Impression source of truth (date boundaries and timezone)

- **Burn** and **customer performance** both use Meta insights with the same date format: **YYYY-MM-DD**.
- **Timezone**: All date boundaries are **UTC**. Worker and API use `periodDate` / `since` / `until` as calendar dates in UTC (e.g. `time_range[since]=2025-02-04`, `time_range[until]=2025-02-04` for a single day). Customer performance uses `getDateRange()` which produces UTC dates via `toISOString().slice(0, 10)`. So “impressions today” in the UI and “burn for that day” use the same day boundaries and stay consistent.

### 3. Paused and no-delivery days

- **Impression-based**: If **impressions = 0** for that day → **burn = 0** (no ledger entry). No charge for no-delivery days. Documented in worker and below for sales/admin.
- **Time-based**: We burn daily from `monthly_price / 30` **unless** the plan is **paused** (`plan.status === 'paused'`). We do **not** require a campaign to exist or to be active: the customer pays for the plan regardless of delivery. If the plan is paused, no burn is applied.

**Summary for sales/admin**

| Scenario | Time-based | Impression-based |
|----------|------------|------------------|
| Plan paused | No burn | No burn |
| Plan active, no campaign / no delivery | Burn daily (monthly/30) | No burn (0 impressions) |
| Plan active, delivery | Burn daily (monthly/30) | Burn = (impressions/1000) × customerCpmSek |

## Minimum endpoints (implemented)

**Customer**

- `GET /billing/status` → `balanceSek`, `billingMode`, `monthlyPriceSek`, `customerCpmSek?`, `status`, `deliverySummary`, `creditsConsumedSekLast7d`, `creditsConsumedSekLast30d`, `creditsConsumedSekMtd`, `hint?` (no spend).

**Admin**

- `GET /admin/customers/:customerId` includes `ads.budgetPlan`.
- `GET /admin/customers/:customerId/billing/ledger?limit=20`.
- `POST /admin/customers/:customerId/billing/topup` body `{ amountSek, note? }`.
- `POST /admin/customers/:customerId/billing/burn` body `{ periodDate? }` or query `?date=YYYY-MM-DD` (defaults today).
- `GET /admin/customers/:customerId/performance/spend?since=&until=` → admin-only `{ spendSek, spend, currency, insights }`.

## How to test

### Quick test (once implemented)

1. **Admin top-up**: Top up 10,000 SEK → ledger shows +10,000 → customer billing shows balance 10,000.
2. **Publish campaign** (sim or real paused): Performance summary returns impressions (sim will do).
3. **Run burn**: Time-based → decrement ~monthly/30; impression-based → decrement from that day’s impressions.
4. **Customer view**: Billing page shows updated balance and credits used (last 7/30 days + MTD). Performance page shows delivery metrics only.
5. **Admin spend view**: Real Meta → shows spend; sim → show 0 or “not available”, clearly admin-only.

### API

- **Customer billing status**: `GET /billing/status` with session + `x-customer-id`. Asserts: `balanceSek`, `billingMode`, `creditsConsumedSekLast7d` / `Last30d` / `Mtd`, `deliverySummary`; no spend/CPM/CPC in response.
- **Admin topup**: `POST /admin/customers/:customerId/billing/topup` with `{ amountSek, note? }`. Then `GET /admin/customers/:customerId/billing/ledger` to see entries and computed balance.
- **Admin burn trigger**: `POST /admin/customers/:customerId/billing/burn` with body `{ periodDate?: "YYYY-MM-DD" }` or `?date=YYYY-MM-DD` enqueues `BILLING_BURN`. Run worker; then check ledger for consumption row (note format: `Burn YYYY-MM-DD (mode=..., impressions=..., cpm=...)`).
- **Budget levers**: `POST /admin/customers/:customerId/ads/budget` with `billing_mode`, `customer_cpm_sek`, `meta_monthly_cap`, `margin_percent`. Verify margin and meta ratio are clamped.

### Worker

- Enqueue `BILLING_BURN` with `{ customerId, preset: 'daily', periodDate: 'YYYY-MM-DD' }`. With time_based plan and balance > 0, one consumption row appears. Run again for same date: no duplicate (idempotent). With impression_based plan, ensure Meta connection and campaign exist; burn uses that day’s impressions.

### Performance

- **Customer**: `GET /performance/summary` must not include spend, CPC, or CPM in the response.
- **Admin spend**: `GET /admin/customers/:customerId/performance/spend?since=&until=` returns Meta spend and insights (admin only).
