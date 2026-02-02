import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JOB_TYPES } from "../src/adapter.js";
import { runWorkerProcessor, validateCorrelation } from "../src/redis.js";

describe("validateCorrelation", () => {
  it("returns MISSING_CORRELATION when correlation is missing", () => {
    const result = validateCorrelation({});
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.strictEqual(result.reason, "MISSING_CORRELATION");
      assert.strictEqual(result.correlation, undefined);
    }
  });

  it("returns MISSING_CORRELATION when correlation is null", () => {
    const result = validateCorrelation({ correlation: null });
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.reason, "MISSING_CORRELATION");
  });

  it("returns MISSING_CORRELATION when correlation is not an object", () => {
    const r = validateCorrelation({ correlation: "x" });
    assert.strictEqual(r.ok, false);
    if (!r.ok) assert.strictEqual(r.reason, "MISSING_CORRELATION");
    assert.strictEqual(validateCorrelation({ correlation: 1 }).ok, false);
  });

  it("returns MISSING_CUSTOMER_ID when customerId is missing", () => {
    const result = validateCorrelation({
      correlation: { dataSourceId: "ds-1", runId: "run-1" },
    });
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.strictEqual(result.reason, "MISSING_CUSTOMER_ID");
      assert.strictEqual(result.correlation?.dataSourceId, "ds-1");
      assert.strictEqual(result.correlation?.runId, "run-1");
    }
  });

  it("returns MISSING_CUSTOMER_ID when customerId is empty string", () => {
    const result = validateCorrelation({
      correlation: { customerId: "", dataSourceId: "ds-1" },
    });
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.reason, "MISSING_CUSTOMER_ID");
  });

  it("returns MISSING_CUSTOMER_ID when customerId is whitespace only", () => {
    const result = validateCorrelation({
      correlation: { customerId: "   " },
    });
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.reason, "MISSING_CUSTOMER_ID");
  });

  it("returns valid correlation when customerId is present", () => {
    const result = validateCorrelation({
      correlation: { customerId: "cust-1", dataSourceId: "ds-1", runId: "run-1" },
    });
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.strictEqual(result.correlation.customerId, "cust-1");
      assert.strictEqual(result.correlation.dataSourceId, "ds-1");
      assert.strictEqual(result.correlation.runId, "run-1");
    }
  });

  it("trims customerId when valid", () => {
    const result = validateCorrelation({
      correlation: { customerId: "  cust-1  " },
    });
    assert.strictEqual(result.ok, true);
    if (result.ok) assert.strictEqual(result.correlation.customerId, "cust-1");
  });
});

describe("runWorkerProcessor with missing correlation", () => {
  it("calls moveToFailed and does not throw or call processJob", async () => {
    let moveToFailedCalled: { err: Error; token: string } | null = null;
    let processJobCalled = false;
    const mockBullJob = {
      id: "job-1",
      data: { payload: {}, correlation: null as unknown },
      token: "token-1",
      moveToFailed: async (err: Error, token: string) => {
        moveToFailedCalled = { err, token };
      },
      retry: async () => {},
    };
    await runWorkerProcessor(
      mockBullJob,
      JOB_TYPES.SCRAPE_PROD,
      async () => {
        processJobCalled = true;
      },
      {}
    );
    assert.strictEqual(processJobCalled, false);
    assert.ok(moveToFailedCalled != null);
    assert.strictEqual(moveToFailedCalled!.err.message, "MISSING_CORRELATION");
    assert.strictEqual(moveToFailedCalled!.token, "token-1");
  });

  it("calls onMissingCorrelation when provided", async () => {
    let onMissingCalled: { jobType: string; jobId: string; reason: string } | null = null;
    const mockBullJob = {
      id: "job-2",
      data: { payload: {}, correlation: undefined },
      token: "",
      moveToFailed: async () => {},
      retry: async () => {},
    };
    await runWorkerProcessor(
      mockBullJob,
      JOB_TYPES.SOURCE_PROBE,
      async () => {},
      {
        onMissingCorrelation: async (params) => {
          onMissingCalled = { jobType: params.jobType, jobId: params.jobId, reason: params.reason };
        },
      }
    );
    assert.ok(onMissingCalled != null);
    assert.strictEqual(onMissingCalled!.jobType, "SOURCE_PROBE");
    assert.strictEqual(onMissingCalled!.jobId, "job-2");
    assert.strictEqual(onMissingCalled!.reason, "MISSING_CORRELATION");
  });
});
