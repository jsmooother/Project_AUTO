/**
 * Meta Graph API helper utilities for API server.
 * Provides GET function with timeout and error mapping.
 */

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

export type MetaGraphError = {
  message: string;
  hint: string;
  code?: number;
  error_subcode?: number;
};

function getBaseUrl(): string {
  const graphVersion = process.env["META_GRAPH_VERSION"] ?? "v21.0";
  return `https://graph.facebook.com/${graphVersion}`;
}

function mapMetaError(error: { message?: string; type?: string; code?: number; error_subcode?: number } | undefined, defaultMessage: string): MetaGraphError {
  const message = error?.message ?? defaultMessage;
  let hint = "Check your Meta access token and permissions.";

  // Map common Meta API errors to helpful hints
  if (error) {
    if (error.code === 190 || error.type === "OAuthException") {
      hint = "Access token is invalid or expired. Reconnect Meta in Settings.";
    } else if (error.code === 200) {
      hint = "Reconnect Meta with ads_management scope.";
    } else if (error.code === 4) {
      hint = "Rate limit exceeded. Please try again later.";
    } else if (error.code === 10) {
      hint = "Permission denied. Check your Meta app permissions.";
    } else if (error.code === 100) {
      const lowerMsg = (message || "").toLowerCase();
      hint = lowerMsg.includes("objective") ? "Try objective OUTCOME_LEADS as fallback." : "Invalid parameter. Check your request body and Meta API documentation.";
    }
  }

  return { message, hint, code: error?.code, error_subcode: error?.error_subcode };
}

/**
 * GET request to Meta Graph API.
 * @param path - Graph API path (e.g., "/act_123456789/insights")
 * @param token - Access token
 * @param params - Query string parameters
 * @param options - Optional fetch options (timeout)
 * @returns Parsed JSON response or throws MetaGraphError
 */
export async function metaGet(
  path: string,
  token: string,
  params?: Record<string, string>,
  options?: {
    timeout?: number;
  }
): Promise<unknown> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}${path}`);

  // Add access token
  url.searchParams.set("access_token", token);

  // Add custom params
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timeout"));
    }, timeout);
  });

  try {
    const response = await Promise.race([
      fetch(url.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "Project-AUTO/1.0",
        },
      }),
      timeoutPromise,
    ]);

    const data = (await response.json()) as {
      error?: { message: string; type: string; code: number; error_subcode?: number };
      data?: unknown[];
      [key: string]: unknown;
    };

    if (!response.ok || data.error) {
      throw mapMetaError(data.error, `Meta API error: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (err) {
    if (err instanceof Error && err.message === "Request timeout") {
      const metaError: MetaGraphError = {
        message: "Request to Meta API timed out",
        hint: "Meta API is slow or unreachable. Check your network connection.",
      };
      throw metaError;
    }

    // Re-throw MetaGraphError as-is
    if (err && typeof err === "object" && "message" in err && "hint" in err) {
      throw err;
    }

    // Wrap other errors
    const metaError: MetaGraphError = {
      message: err instanceof Error ? err.message : "Unknown error calling Meta API",
      hint: "Check your Meta access token and network connection.",
    };
    throw metaError;
  }
}

/**
 * Alias for metaGet (backward compatibility)
 */
export const fetchMeta = metaGet;
