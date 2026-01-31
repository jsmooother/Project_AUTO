/**
 * Supabase Storage implementation of the storage adapter (S3-like API).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StorageAdapter, GetObjectResult, ListObjectsResult } from "./adapter.js";

export type SupabaseStorageOptions = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  /** Optional existing client (e.g. from app auth). */
  client?: SupabaseClient;
};

export function createSupabaseStorageAdapter(options: SupabaseStorageOptions): StorageAdapter {
  const client =
    options.client ??
    createClient(options.supabaseUrl, options.supabaseServiceRoleKey);

  return {
    async getObject(bucket: string, key: string): Promise<GetObjectResult> {
      const { data, error } = await client.storage.from(bucket).download(key);
      if (error) throw new Error(`Storage getObject failed: ${error.message}`);
      const body = new Uint8Array(await data.arrayBuffer());
      return { body };
    },

    async putObject(
      bucket: string,
      key: string,
      body: Uint8Array,
      options?: { contentType?: string }
    ): Promise<void> {
      const { error } = await client.storage.from(bucket).upload(key, body, {
        upsert: true,
        contentType: options?.contentType,
      });
      if (error) throw new Error(`Storage putObject failed: ${error.message}`);
    },

    async deleteObject(bucket: string, key: string): Promise<void> {
      const { error } = await client.storage.from(bucket).remove([key]);
      if (error) throw new Error(`Storage deleteObject failed: ${error.message}`);
    },

    async listObjects(
      bucket: string,
      prefix: string,
      options?: { limit?: number; continuationToken?: string }
    ): Promise<ListObjectsResult> {
      const limit = Math.min(options?.limit ?? 1000, 100);
      const offset = options?.continuationToken ? parseInt(options.continuationToken, 10) : 0;
      const { data, error } = await client.storage.from(bucket).list(prefix, {
        limit,
        offset,
      });
      if (error) throw new Error(`Storage listObjects failed: ${error.message}`);
      const keys = data.map((item) => (prefix ? `${prefix}/${item.name}` : item.name));
      const nextContinuationToken = data.length === limit ? String(offset + data.length) : undefined;
      return { keys, nextContinuationToken };
    },

    async getSignedUrl(bucket: string, key: string, expiresInSeconds: number): Promise<string> {
      const { data, error } = await client.storage.from(bucket).createSignedUrl(key, expiresInSeconds);
      if (error) throw new Error(`Storage getSignedUrl failed: ${error.message}`);
      if (!data?.signedUrl) throw new Error("Storage getSignedUrl returned no URL");
      return data.signedUrl;
    },
  };
}
