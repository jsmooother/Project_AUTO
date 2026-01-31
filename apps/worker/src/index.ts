import { queue } from "./lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import { processScrapeTest } from "./jobs/scrapeTest.js";

const workers: Array<{ close: () => Promise<void> }> = [];

workers.push(
  queue.createWorker(JOB_TYPES.SCRAPE_TEST, processScrapeTest)
);

// SCRAPE_PROD stub: not implemented
workers.push(
  queue.createWorker(JOB_TYPES.SCRAPE_PROD, async (job) => {
    await job.deadLetter("SCRAPE_PROD not implemented");
  })
);

async function shutdown(): Promise<void> {
  for (const w of workers) await w.close();
  await queue.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
