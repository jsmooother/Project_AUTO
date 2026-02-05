#!/usr/bin/env bash
# Create a test customer for Meta test mode
# Usage: ./scripts/create-test-customer.sh [API_URL]
# Outputs: customerId (UUID) that you can use for META_TEST_CUSTOMER_ID

set -e

API_URL="${1:-${API_URL:-http://localhost:3001}}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-customer-${TIMESTAMP}@test.local"
TEST_NAME="Test Customer ${TIMESTAMP}"
TEST_PASSWORD="test-password-123"

echo "Creating test customer..."
echo "Email: ${TEST_EMAIL}"
echo "Name: ${TEST_NAME}"
echo ""

SIGNUP_RESP=$(curl -s -X POST "${API_URL}/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"name\": \"${TEST_NAME}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

CUSTOMER_ID=$(echo "$SIGNUP_RESP" | grep -o '"customerId":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$CUSTOMER_ID" ]; then
  echo "ERROR: Failed to create customer"
  echo "Response: $SIGNUP_RESP"
  exit 1
fi

echo "✅ Test customer created successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Add these to your .env file:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "META_TEST_MODE=true"
echo "META_TEST_CUSTOMER_ID=${CUSTOMER_ID}"
echo "META_TEST_AD_ACCOUNT_ID=act_<your_ad_account_id>"
echo "ALLOW_REAL_META_WRITE=true"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test customer details:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Customer ID: ${CUSTOMER_ID}"
echo "Email: ${TEST_EMAIL}"
echo "Password: ${TEST_PASSWORD}"
echo ""
echo "You can log in at: http://localhost:3000/login"
echo ""
