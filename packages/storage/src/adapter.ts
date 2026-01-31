/**
 * Storage adapter contract. S3-like method names for portability.
 */

export type GetObjectResult = {
  body: Uint8Array;
  contentType?: string;
};

export type ListObjectsResult = {
  keys: string[];
  nextContinuationToken?: string;
};

export type StorageAdapter = {
  /** Get object bytes by key (bucket + path). */
  getObject(bucket: string, key: string): Promise<GetObjectResult>;

  /** Put object; body as Buffer or Uint8Array (typed as Uint8Array for portability). */
  putObject(
    bucket: string,
    key: string,
    body: Uint8Array,
    options?: { contentType?: string }
  ): Promise<void>;

  /** Delete a single object. */
  deleteObject(bucket: string, key: string): Promise<void>;

  /** List object keys under prefix. Optional limit and continuation token. */
  listObjects(
    bucket: string,
    prefix: string,
    options?: { limit?: number; continuationToken?: string }
  ): Promise<ListObjectsResult>;

  /** Create a signed URL for GET (expiry in seconds). */
  getSignedUrl(bucket: string, key: string, expiresInSeconds: number): Promise<string>;
};
