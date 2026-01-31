import { createSupabaseStorageAdapter } from "@repo/storage";

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

export const storage =
  supabaseUrl && supabaseServiceRoleKey
    ? createSupabaseStorageAdapter({ supabaseUrl, supabaseServiceRoleKey })
    : null;

export const REPRO_BUCKET = "repro";
