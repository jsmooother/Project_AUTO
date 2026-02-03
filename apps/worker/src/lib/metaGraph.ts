/**
 * Meta Graph API helper utilities for worker.
 * Provides POST function with timeout and error mapping.
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
 * POST request to Meta Graph API.
 * @param path - Graph API path (e.g., "/act_123456789/campaigns")
 * @param token - Access token
 * @param body - Request body object (will be JSON stringified)
 * @param options - Optional fetch options (timeout, params for query string)
 * @returns Parsed JSON response or throws MetaGraphError
 */
export async function metaPost(
  path: string,
  token: string,
  body: Record<string, unknown>,
  options?: {
    timeout?: number;
    params?: Record<string, string>;
  }
): Promise<unknown> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}${path}`);

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }
  url.searchParams.set("access_token", token);

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timeout"));
    }, timeout);
  });

  try {
    const response = await Promise.race([
      fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Project-AUTO/1.0",
        },
        body: JSON.stringify(body),
      }),
      timeoutPromise,
    ]);

    const data = (await response.json()) as {
      error?: { message: string; type: string; code: number; error_subcode?: number };
      id?: string;
      success?: boolean;
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
