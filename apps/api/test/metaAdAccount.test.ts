import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveEffectiveAdAccountId, maskAdAccountId } from "../src/lib/metaAdAccount.js";

const originalEnv = { ...process.env };

test("resolveEffectiveAdAccountId returns customer selected ad account when test mode is disabled", () => {
  process.env = { ...originalEnv };
  delete process.env.META_TEST_MODE;
  delete process.env.META_TEST_CUSTOMER_ID;
  delete process.env.META_TEST_AD_ACCOUNT_ID;

  const result = resolveEffectiveAdAccountId({
    customerId: "customer-123",
    selectedAdAccountId: "act_456",
  });

  assert.equal(result.effectiveId, "act_456");
  assert.equal(result.mode, "customer_selected");
});

test("resolveEffectiveAdAccountId returns customer selected ad account when test mode enabled but customer doesn't match", () => {
  process.env = {
    ...originalEnv,
    META_TEST_MODE: "true",
    META_TEST_CUSTOMER_ID: "test-customer-123",
    META_TEST_AD_ACCOUNT_ID: "act_999",
  };

  const result = resolveEffectiveAdAccountId({
    customerId: "different-customer-456",
    selectedAdAccountId: "act_456",
  });

  assert.equal(result.effectiveId, "act_456");
  assert.equal(result.mode, "customer_selected");
});

test("resolveEffectiveAdAccountId returns override ad account when test mode enabled and customer matches", () => {
  process.env = {
    ...originalEnv,
    META_TEST_MODE: "true",
    META_TEST_CUSTOMER_ID: "test-customer-123",
    META_TEST_AD_ACCOUNT_ID: "act_999",
  };

  const result = resolveEffectiveAdAccountId({
    customerId: "test-customer-123",
    selectedAdAccountId: "act_456",
  });

  assert.equal(result.effectiveId, "act_999");
  assert.equal(result.mode, "internal_test");
});

test("resolveEffectiveAdAccountId normalizes ad account ID without act_ prefix", () => {
  process.env = {
    ...originalEnv,
    META_TEST_MODE: "true",
    META_TEST_CUSTOMER_ID: "test-customer-123",
    META_TEST_AD_ACCOUNT_ID: "123456789",
  };

  const result = resolveEffectiveAdAccountId({
    customerId: "test-customer-123",
    selectedAdAccountId: "act_456",
  });

  assert.equal(result.effectiveId, "act_123456789");
  assert.equal(result.mode, "internal_test");
});

test("resolveEffectiveAdAccountId returns null when no ad account selected and not in test mode", () => {
  process.env = { ...originalEnv };
  delete process.env.META_TEST_MODE;

  const result = resolveEffectiveAdAccountId({
    customerId: "customer-123",
    selectedAdAccountId: null,
  });

  assert.equal(result.effectiveId, null);
  assert.equal(result.mode, "customer_selected");
});

test("resolveEffectiveAdAccountId returns override even when customer has no selected ad account in test mode", () => {
  process.env = {
    ...originalEnv,
    META_TEST_MODE: "true",
    META_TEST_CUSTOMER_ID: "test-customer-123",
    META_TEST_AD_ACCOUNT_ID: "act_999",
  };

  const result = resolveEffectiveAdAccountId({
    customerId: "test-customer-123",
    selectedAdAccountId: null,
  });

  assert.equal(result.effectiveId, "act_999");
  assert.equal(result.mode, "internal_test");
});

test("maskAdAccountId masks ad account ID showing only last 4 digits", () => {
  assert.equal(maskAdAccountId("act_123456789"), "act_****6789");
});

test("maskAdAccountId handles ad account ID without act_ prefix", () => {
  assert.equal(maskAdAccountId("123456789"), "act_****6789");
});

test("maskAdAccountId returns act_**** for short IDs", () => {
  assert.equal(maskAdAccountId("act_123"), "act_****");
});

test("maskAdAccountId returns null for null input", () => {
  assert.equal(maskAdAccountId(null), null);
});
