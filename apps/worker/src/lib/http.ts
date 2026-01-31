const DEFAULT_TIMEOUT_MS = 30_000;

export type HttpTrace = {
  url: string;
  status: number | null;
  statusText?: string;
  durationMs: number;
  error?: string;
};

export async function fetchWithTrace(
  url: string,
  options: { timeoutMs?: number } = {}
): Promise<{ body: string; trace: HttpTrace }> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "RepoWorker/1.0" },
    });
    const body = await res.text();
    clearTimeout(timeout);
    const durationMs = Date.now() - start;
    return {
      body,
      trace: {
        url,
        status: res.status,
        statusText: res.statusText,
        durationMs,
      },
    };
  } catch (err) {
    clearTimeout(timeout);
    const durationMs = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);
    return {
      body: "",
      trace: {
        url,
        status: null,
        durationMs,
        error,
      },
    };
  }
}
