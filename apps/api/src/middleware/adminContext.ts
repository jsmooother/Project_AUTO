import type { FastifyRequest, FastifyReply } from "fastify";

const ADMIN_KEY_HEADER = "x-admin-key";
let warnedInsecureAdmin = false;

function allowWithoutKey(): boolean {
  const nodeEnv = process.env["NODE_ENV"];
  if (nodeEnv !== "development") return false;
  return process.env["ALLOW_INSECURE_ADMIN"] === "true";
}

/**
 * Admin auth:
 * - In NODE_ENV=development: allow without x-admin-key only if ALLOW_INSECURE_ADMIN=true.
 * - In all other environments: always require x-admin-key matching ADMIN_API_KEY.
 */
export function requireAdminContext(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
): void {
  if (allowWithoutKey()) {
    if (!warnedInsecureAdmin) {
      console.warn("ALLOW_INSECURE_ADMIN enabled; admin routes are unprotected in development.");
      warnedInsecureAdmin = true;
    }
    done();
    return;
  }
  const expectedKey = process.env["ADMIN_API_KEY"];
  if (!expectedKey) {
    reply.status(503).send({
      error: { code: "CONFIG_ERROR", message: "ADMIN_API_KEY must be set for admin access" },
    });
    return done();
  }
  const raw = request.headers[ADMIN_KEY_HEADER];
  const key = Array.isArray(raw) ? raw[0] : raw;
  if (!key || key !== expectedKey) {
    reply.status(403).send({
      error: { code: "FORBIDDEN", message: "Invalid or missing x-admin-key header" },
    });
    return done();
  }
  done();
}
