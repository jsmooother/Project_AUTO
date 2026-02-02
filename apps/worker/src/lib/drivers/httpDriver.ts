/**
 * HTTP driver: uses fetchWithTrace (browserless).
 */

import { fetchWithTrace } from "../http.js";
import type { Driver, FetchResult, FetchOptions } from "./types.js";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_USER_AGENT = "RepoWorker/1.0";

export function createHttpDriver(): Driver {
  return {
    async fetch(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
      const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
      const userAgent = opts.userAgent ?? DEFAULT_USER_AGENT;
      const { body, trace } = await fetchWithTrace(url, { timeoutMs });
      const headers: Record<string, string> = {};
      return {
        finalUrl: url,
        status: trace.status,
        headers,
        body,
        trace: {
          url: trace.url,
          finalUrl: url,
          status: trace.status,
          statusText: trace.statusText,
          durationMs: trace.durationMs,
          error: trace.error,
          htmlTruncated: trace.htmlTruncated,
          originalBytes: trace.originalBytes,
          truncatedBytes: trace.truncatedBytes,
        },
      };
    },
  };
}
