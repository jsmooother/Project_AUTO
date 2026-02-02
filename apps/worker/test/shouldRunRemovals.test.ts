import assert from "node:assert";
import { describe, it } from "node:test";

import { shouldRunRemovals } from "../src/jobs/scrapeProd";

describe("shouldRunRemovals", () => {
  it("returns false when discoveredCount is 0", () => {
    assert.strictEqual(shouldRunRemovals(0, 5), false);
  });

  it("returns false when discoveredCount is below threshold", () => {
    assert.strictEqual(shouldRunRemovals(4, 5), false);
  });

  it("returns true when discoveredCount meets threshold", () => {
    assert.strictEqual(shouldRunRemovals(5, 5), true);
  });
});
