/**
 * Shared API client for Project AUTO.
 * Base URL from NEXT_PUBLIC_API_URL, always uses credentials: "include".
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

export type ApiOptions = {
  customerId?: string;
  headers?: Record<string, string>;
};

/** Structured error from API 4xx responses (message + optional hint/issues). */
export type ApiErrorDetail = {
  error: string;
  hint?: string;
  issues?: unknown[];
};

function parseErrorResponse(data: unknown, status: number, statusText: string): ApiErrorDetail {
  const obj = data as Record<string, unknown>;
  // New shape: { error: "VALIDATION_ERROR" | "MISSING_PREREQUISITE", message?, hint?, issues? }
  const message =
    typeof obj.message === "string"
      ? obj.message
      : (obj.error as Record<string, unknown>)?.message
        ? String((obj.error as Record<string, unknown>).message)
        : statusText || "Request failed";
  const hint = typeof obj.hint === "string" ? obj.hint : undefined;
  const issues = Array.isArray(obj.issues) ? obj.issues : undefined;
  return { error: message, hint, issues };
}

export async function apiGet<T = unknown>(
  path: string,
  options?: ApiOptions
): Promise<
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; errorDetail?: ApiErrorDetail }
> {
  try {
    const headers: Record<string, string> = {
      ...options?.headers,
    };
    if (options?.customerId) {
      headers["x-customer-id"] = options.customerId;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      credentials: "include",
      headers: Object.keys(headers).length ? headers : undefined,
    });
    let data: unknown;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    if (!res.ok) {
      if (res.status === 401) onUnauthorized?.();
      const detail = parseErrorResponse(data, res.status, res.statusText);
      return {
        ok: false,
        status: res.status,
        error: detail.error,
        errorDetail: detail,
      };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      ok: false,
      status: 0,
      error: msg,
      errorDetail: { error: msg, hint: "Check that the API is running and reachable." },
    };
  }
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: ApiOptions
): Promise<
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; errorDetail?: ApiErrorDetail }
> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };
    if (options?.customerId) {
      headers["x-customer-id"] = options.customerId;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: body != null ? JSON.stringify(body) : "{}",
    });
    let data: unknown;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    if (!res.ok) {
      if (res.status === 401) onUnauthorized?.();
      const detail = parseErrorResponse(data, res.status, res.statusText);
      return {
        ok: false,
        status: res.status,
        error: detail.error,
        errorDetail: detail,
      };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      ok: false,
      status: 0,
      error: msg,
      errorDetail: { error: msg, hint: "Check that the API is running and reachable." },
    };
  }
}

export { baseUrl as apiBaseUrl };
