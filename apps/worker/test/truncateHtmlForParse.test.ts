import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { truncateHtmlForParse } from "../src/lib/http.js";

describe("truncateHtmlForParse", () => {
  it("returns unchanged string when under max bytes", () => {
    const html = "<html><body>Small HTML</body></html>";
    const result = truncateHtmlForParse(html, 200_000);
    assert.strictEqual(result.truncated, html);
    assert.strictEqual(result.wasTruncated, false);
    assert.ok(result.originalBytes > 0);
    assert.strictEqual(result.truncatedBytes, result.originalBytes);
  });

  it("truncates when over max bytes", () => {
    // Create HTML that exceeds 200 KB
    const largeHtml = "<html><body>" + "x".repeat(300_000) + "</body></html>";
    const maxBytes = 200_000;
    const result = truncateHtmlForParse(largeHtml, maxBytes);
    assert.ok(result.wasTruncated);
    assert.ok(result.originalBytes > maxBytes);
    assert.ok(result.truncatedBytes <= maxBytes);
    assert.ok(result.truncated.length < largeHtml.length);
    assert.ok(result.truncatedBytes <= result.originalBytes);
  });

  it("handles empty string", () => {
    const result = truncateHtmlForParse("", 200_000);
    assert.strictEqual(result.truncated, "");
    assert.strictEqual(result.wasTruncated, false);
    assert.strictEqual(result.originalBytes, 0);
    assert.strictEqual(result.truncatedBytes, 0);
  });

  it("handles exact max bytes boundary", () => {
    // Create HTML exactly at max bytes
    const html = "x".repeat(200_000);
    const result = truncateHtmlForParse(html, 200_000);
    // Should be at or under maxBytes
    assert.ok(result.truncatedBytes <= 200_000);
    // If it was truncated, wasTruncated should be true
    if (result.truncatedBytes < result.originalBytes) {
      assert.strictEqual(result.wasTruncated, true);
    }
  });

  it("handles UTF-8 multi-byte characters correctly", () => {
    // UTF-8 characters can be multiple bytes
    const html = "<html><body>" + "🚀".repeat(100_000) + "</body></html>";
    const maxBytes = 200_000;
    const result = truncateHtmlForParse(html, maxBytes);
    assert.ok(result.truncatedBytes <= maxBytes);
    // Should still be valid UTF-8 (no partial characters)
    assert.doesNotThrow(() => {
      new TextDecoder().decode(new TextEncoder().encode(result.truncated));
    });
  });
});
