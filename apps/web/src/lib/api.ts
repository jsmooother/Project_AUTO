/**
 * Shared API client for Project AUTO.
 * Base URL from NEXT_PUBLIC_API_URL, always uses credentials: "include".
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ApiOptions = {
  customerId?: string;
  headers?: Record<string, string>;
};

async function parseJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON: ${text.slice(0, 100)}`);
  }
}

export async function apiGet<T = unknown>(
  path: string,
  options?: ApiOptions
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
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
  const data = await parseJson(res);
  if (!res.ok) {
    const err = (data as { error?: { message?: string } })?.error?.message ?? res.statusText;
    return { ok: false, status: res.status, error: err };
  }
  return { ok: true, data: data as T };
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: ApiOptions
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
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
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await parseJson(res);
  if (!res.ok) {
    const err = (data as { error?: { message?: string } })?.error?.message ?? res.statusText;
    return { ok: false, status: res.status, error: err };
  }
  return { ok: true, data: data as T };
}

export { baseUrl as apiBaseUrl };
