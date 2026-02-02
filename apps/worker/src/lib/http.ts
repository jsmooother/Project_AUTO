const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_HTML_BYTES_FOR_PARSE = 200_000; // 200 KB

export type HttpTrace = {
  url: string;
  status: number | null;
  statusText?: string;
  durationMs: number;
  error?: string;
  htmlTruncated?: boolean;
  originalBytes?: number;
  truncatedBytes?: number;
};

/**
 * Truncates HTML string to max bytes (UTF-8 encoding). Returns truncated string and truncation info.
 */
export function truncateHtmlForParse(html: string, maxBytes: number): {
  truncated: string;
  wasTruncated: boolean;
  originalBytes: number;
  truncatedBytes: number;
} {
  const originalBytes = new TextEncoder().encode(html).length;
  if (originalBytes <= maxBytes) {
    return { truncated: html, wasTruncated: false, originalBytes, truncatedBytes: originalBytes };
  }
  // Truncate by character, then check byte length
  let truncated = html;
  let truncatedBytes = originalBytes;
  while (truncatedBytes > maxBytes && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
    truncatedBytes = new TextEncoder().encode(truncated).length;
  }
  return { truncated, wasTruncated: true, originalBytes, truncatedBytes };
}

export async function fetchWithTrace(
  url: string,
  options: { timeoutMs?: number; maxHtmlBytes?: number } = {}
): Promise<{ body: string; trace: HttpTrace }> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxHtmlBytes =
    options.maxHtmlBytes ??
    (Number(process.env["MAX_HTML_BYTES_FOR_PARSE"] ?? DEFAULT_MAX_HTML_BYTES_FOR_PARSE) || DEFAULT_MAX_HTML_BYTES_FOR_PARSE);
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "RepoWorker/1.0" },
    });
    const fullBody = await res.text();
    clearTimeout(timeout);
    const durationMs = Date.now() - start;
    const { truncated: body, wasTruncated, originalBytes, truncatedBytes } = truncateHtmlForParse(fullBody, maxHtmlBytes);
    return {
      body,
      trace: {
        url,
        status: res.status,
        statusText: res.statusText,
        durationMs,
        ...(wasTruncated ? { htmlTruncated: true, originalBytes, truncatedBytes } : {}),
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
