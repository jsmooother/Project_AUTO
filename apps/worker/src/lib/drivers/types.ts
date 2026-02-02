/**
 * Driver layer: how we fetch (HTTP vs headless).
 * Separate from extractors (how we parse).
 */

export interface FetchTrace {
  url: string;
  finalUrl?: string;
  status: number | null;
  statusText?: string;
  durationMs: number;
  error?: string;
  htmlTruncated?: boolean;
  originalBytes?: number;
  truncatedBytes?: number;
}

export interface FetchResult {
  finalUrl: string;
  status: number | null;
  headers: Record<string, string>;
  body: string;
  trace: FetchTrace;
}

export interface FetchOptions {
  timeoutMs?: number;
  userAgent?: string;
}

export interface Driver {
  fetch(url: string, opts?: FetchOptions): Promise<FetchResult>;
}
