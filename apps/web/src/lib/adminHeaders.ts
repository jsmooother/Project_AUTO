export function getAdminHeaders(): Record<string, string> {
  const key = typeof window !== "undefined" ? localStorage.getItem("adminApiKey") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (key) headers["x-admin-key"] = key;
  return headers;
}
