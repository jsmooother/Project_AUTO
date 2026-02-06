import { createSupabaseStorageAdapter } from "@repo/storage";

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

export const storage =
  supabaseUrl && supabaseServiceRoleKey
    ? createSupabaseStorageAdapter({ supabaseUrl, supabaseServiceRoleKey })
    : null;

export const REPRO_BUCKET = "repro";
export const CREATIVES_BUCKET = "creatives";
export const LOGOS_BUCKET = "logos";

/**
 * Upload a buffer to Supabase Storage and return public URL.
 * Throws if storage is not configured.
 */
export async function uploadBuffer({
  bucket,
  path,
  contentType,
  buffer,
}: {
  bucket: string;
  path: string;
  contentType: string;
  buffer: Buffer | Uint8Array;
}): Promise<string> {
  if (!storage) {
    throw new Error(
      "STORAGE_NOT_CONFIGURED: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for creative generation"
    );
  }

  if (!supabaseUrl) {
    throw new Error("STORAGE_NOT_CONFIGURED: SUPABASE_URL is required");
  }

  // Upload to storage
  await storage.putObject(bucket, path, buffer instanceof Buffer ? new Uint8Array(buffer) : buffer, {
    contentType,
  });

  // Construct public URL (Supabase Storage public URLs format: {supabaseUrl}/storage/v1/object/public/{bucket}/{path})
  // Remove trailing slash from supabaseUrl if present
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;

  return publicUrl;
}

/**
 * Check if storage is configured.
 */
export function isStorageConfigured(): boolean {
  return !!storage && !!supabaseUrl;
}
