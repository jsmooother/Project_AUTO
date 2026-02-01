/**
 * Headless driver: stub. When HEADLESS_ENABLED is not set, throws so probe can fall back to http.
 */

import type { Driver, FetchResult, FetchOptions } from "./types.js";

const HEADLESS_DISABLED_CODE = "HEADLESS_DISABLED";

function isHeadlessEnabled(): boolean {
  return process.env.HEADLESS_ENABLED === "1" || process.env.HEADLESS_ENABLED === "true";
}

export function createHeadlessDriver(): Driver {
  return {
    async fetch(url: string, _opts: FetchOptions = {}): Promise<FetchResult> {
      if (!isHeadlessEnabled()) {
        const err = new Error("Headless driver disabled") as Error & { code?: string };
        err.code = HEADLESS_DISABLED_CODE;
        throw err;
      }
      const provider = process.env["HEADLESS_PROVIDER"] ?? "playwright-local";
      if (provider !== "playwright-local") {
        throw new Error(`Unsupported headless provider: ${provider}`);
      }
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext(_opts.userAgent ? { userAgent: _opts.userAgent } : {});
      const page = await context.newPage();
      const timeoutMs = _opts.timeoutMs ?? 30_000;
      const start = Date.now();
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
        const body = await page.content();
        const durationMs = Date.now() - start;
        await browser.close();
        return {
          finalUrl: page.url(),
          status: 200,
          headers: {},
          body,
          trace: {
            url,
            finalUrl: page.url(),
            status: 200,
            durationMs,
          },
        };
      } catch (err) {
        const durationMs = Date.now() - start;
        await browser.close();
        const message = err instanceof Error ? err.message : String(err);
        return {
          finalUrl: url,
          status: null,
          headers: {},
          body: "",
          trace: {
            url,
            finalUrl: url,
            status: null,
            durationMs,
            error: message,
          },
        };
      }
    },
  };
}

export { HEADLESS_DISABLED_CODE };
