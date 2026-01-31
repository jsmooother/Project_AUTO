import type { FastifyRequest, FastifyReply } from "fastify";

const CUSTOMER_ID_HEADER = "x-customer-id";
const USER_ID_HEADER = "x-user-id";

export type CustomerContext = {
  customerId: string;
  userId?: string;
};

declare module "fastify" {
  interface FastifyRequest {
    customer: CustomerContext;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requireCustomerContext(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
): void {
  const raw = request.headers[CUSTOMER_ID_HEADER];
  const customerId = Array.isArray(raw) ? raw[0] : raw;
  if (!customerId || !UUID_REGEX.test(customerId)) {
    reply.status(401).send({
      error: { code: "UNAUTHORIZED", message: "Missing or invalid x-customer-id header (UUID required)" },
    });
    return done();
  }
  const userIdRaw = request.headers[USER_ID_HEADER];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;
  request.customer = { customerId, userId };
  done();
}
