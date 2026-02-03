import { describe, it } from "node:test";
import assert from "node:assert";
import { signOAuthState, verifyOAuthState } from "../src/lib/metaOAuth.js";

describe("metaOAuth", () => {
  describe("signOAuthState", () => {
    it("should create a signed state token", () => {
      const customerId = "123e4567-e89b-12d3-a456-426614174000";
      const state = signOAuthState(customerId);
      assert.ok(state);
      assert.ok(state.includes(":"));
      const parts = state.split(":");
      assert.strictEqual(parts.length, 2);
    });

    it("should create different tokens for different customerIds", () => {
      const customerId1 = "123e4567-e89b-12d3-a456-426614174000";
      const customerId2 = "223e4567-e89b-12d3-a456-426614174000";
      const state1 = signOAuthState(customerId1);
      const state2 = signOAuthState(customerId2);
      assert.notStrictEqual(state1, state2);
    });
  });

  describe("verifyOAuthState", () => {
    it("should verify a valid state token", () => {
      const customerId = "123e4567-e89b-12d3-a456-426614174000";
      const state = signOAuthState(customerId);
      const result = verifyOAuthState(state);
      assert.ok(result);
      assert.strictEqual(result.customerId, customerId);
    });

    it("should reject an invalid state token", () => {
      const result = verifyOAuthState("invalid:token");
      assert.strictEqual(result, null);
    });

    it("should reject a tampered state token", () => {
      const customerId = "123e4567-e89b-12d3-a456-426614174000";
      const state = signOAuthState(customerId);
      const [encoded, hmac] = state.split(":");
      const tampered = `${encoded}:tampered${hmac}`;
      const result = verifyOAuthState(tampered);
      assert.strictEqual(result, null);
    });

    it("should reject an expired state token", async () => {
      // This test would require mocking time, which is complex
      // In practice, expired tokens are rejected by verifyOAuthState
      // We'll test this by creating a token with a past expiry
      const customerId = "123e4567-e89b-12d3-a456-426614174000";
      const secret = process.env["COOKIE_SECRET"] ?? "dev-secret";
      const expireAt = Date.now() - 1000; // 1 second ago
      const payload = `${customerId}:${expireAt}`;
      const { createHmac } = await import("crypto");
      const hmac = createHmac("sha256", secret).update(payload).digest("hex");
      const encoded = Buffer.from(payload).toString("base64url");
      const expiredState = `${encoded}:${hmac}`;
      const result = verifyOAuthState(expiredState);
      assert.strictEqual(result, null);
    });

    it("should reject a state token with invalid format", () => {
      assert.strictEqual(verifyOAuthState(""), null);
      assert.strictEqual(verifyOAuthState("no-colon"), null);
      assert.strictEqual(verifyOAuthState(":only-hmac"), null);
      assert.strictEqual(verifyOAuthState("only-encoded:"), null);
    });
  });
});
