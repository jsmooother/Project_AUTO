import "./lib/env.js";
import { queue } from "./lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import { processScrapeTest } from "./jobs/scrapeTest.js";
import { processSourceProbe } from "./jobs/sourceProbe.js";
import { processScrapeProd } from "./jobs/scrapeProd.js";
import { processCrawlStub } from "./jobs/crawlStub.js";

const workers: Array<{ close: () => Promise<void> }> = [];

workers.push(
  queue.createWorker(JOB_TYPES.SCRAPE_TEST, processScrapeTest)
);
workers.push(
  queue.createWorker(JOB_TYPES.SOURCE_PROBE, processSourceProbe)
);
workers.push(
  queue.createWorker(JOB_TYPES.SCRAPE_PROD, processScrapeProd)
);
workers.push(
  queue.createWorker(JOB_TYPES.CRAWL, processCrawlStub)
);

async function shutdown(): Promise<void> {
  for (const w of workers) await w.close();
  await queue.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
