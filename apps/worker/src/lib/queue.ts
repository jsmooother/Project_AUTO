import { createRedisQueueAdapter } from "@repo/queue";

const queue = createRedisQueueAdapter();

export { queue };
