/**
 * Map fetch/parse errors to event_code for run_events and taxonomy.
 */

export function mapErrorToEventCode(error: unknown, stage: string): string {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  if (lower.includes("timeout") || lower.includes("aborted")) return "SCRAPE_TIMEOUT";
  if (lower.includes("dns") || lower.includes("enotfound") || lower.includes("getaddrinfo")) return "SCRAPE_FETCH_FAIL";
  if (lower.includes("econnrefused") || lower.includes("econnreset")) return "SCRAPE_FETCH_FAIL";
  if (lower.includes("parse") || lower.includes("json") || lower.includes("html")) return "SCRAPE_PARSE_FAIL";
  if (stage === "fetch_base_url") return "SCRAPE_FETCH_FAIL";
  if (stage === "parse_minimal") return "SCRAPE_PARSE_FAIL";
  return "SCRAPE_CRASH";
}
