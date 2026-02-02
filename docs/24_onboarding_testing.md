# Onboarding Testing Guide

This guide shows how to test the onboarding flow locally using curl or a browser.

## Prerequisites

1. Start database services:
   ```bash
   docker-compose up -d
   ```

2. Run migrations:
   ```bash
   pnpm --filter @repo/db db:migrate
   ```

3. Start the API server (port 3001):
   ```bash
   pnpm --filter @repo/api dev
   ```

4. Start the web frontend (port 3000):
   ```bash
   pnpm --filter @repo/web dev
   ```

## Testing with Browser

1. **Sign Up:**
   - Navigate to `http://localhost:3000`
   - Click "Sign Up"
   - Fill in email and organization name
   - Submit the form
   - You'll be redirected to the dashboard

2. **Complete Onboarding:**
   - On the dashboard, you'll see CTAs for incomplete steps
   - Click "Add Company Information" → fill in company name (website optional) → Save
   - Click "Add Budget Information" → fill in monthly budget → Save
   - Dashboard will show "Status: Completed" when both steps are done

## Testing with curl

### 1. Sign Up (creates user + org + onboarding state)

```bash
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Organization"
  }'
```

Response:
```json
{
  "customerId": "uuid-here",
  "userId": "uuid-here",
  "email": "test@example.com"
}
```

**Save the `customerId` from the response for subsequent requests.**

### 2. Check Onboarding Status

```bash
curl http://localhost:3001/onboarding/status \
  -H "x-customer-id: YOUR_CUSTOMER_ID_HERE"
```

Response:
```json
{
  "status": "not_started",
  "companyInfoCompleted": false,
  "budgetInfoCompleted": false,
  "companyName": null,
  "companyWebsite": null,
  "monthlyBudgetAmount": null,
  "budgetCurrency": null
}
```

### 3. Complete Company Information Step

```bash
curl -X POST http://localhost:3001/onboarding/company \
  -H "Content-Type: application/json" \
  -H "x-customer-id: YOUR_CUSTOMER_ID_HERE" \
  -d '{
    "companyName": "Acme Corp",
    "companyWebsite": "https://acme.com"
  }'
```

Response:
```json
{
  "companyInfoCompleted": true,
  "companyName": "Acme Corp",
  "companyWebsite": "https://acme.com",
  "status": "in_progress"
}
```

### 4. Complete Budget Information Step

```bash
curl -X POST http://localhost:3001/onboarding/budget \
  -H "Content-Type: application/json" \
  -H "x-customer-id: YOUR_CUSTOMER_ID_HERE" \
  -d '{
    "monthlyBudgetAmount": 5000,
    "budgetCurrency": "USD"
  }'
```

Response:
```json
{
  "budgetInfoCompleted": true,
  "monthlyBudgetAmount": "5000",
  "budgetCurrency": "USD",
  "status": "completed"
}
```

### 5. Verify Final Status

```bash
curl http://localhost:3001/onboarding/status \
  -H "x-customer-id: YOUR_CUSTOMER_ID_HERE"
```

Response:
```json
{
  "status": "completed",
  "companyInfoCompleted": true,
  "budgetInfoCompleted": true,
  "companyName": "Acme Corp",
  "companyWebsite": "https://acme.com",
  "monthlyBudgetAmount": "5000",
  "budgetCurrency": "USD"
}
```

## Status Values

- `not_started`: Neither step completed
- `in_progress`: One step completed
- `completed`: Both steps completed

## Notes

- The `/signup` endpoint does NOT require the `x-customer-id` header
- All other endpoints require `x-customer-id` header
- Each customer (organization) has exactly one onboarding state (enforced by UNIQUE constraint)
- Onboarding state is automatically created when a user signs up
