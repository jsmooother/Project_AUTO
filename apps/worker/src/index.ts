import "./lib/env.js";
import { queue } from "./lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import { processScrapeTest } from "./jobs/scrapeTest.js";
import { processSourceProbe } from "./jobs/sourceProbe.js";
import { processScrapeProd } from "./jobs/scrapeProd.js";
import { processCrawlStub } from "./jobs/crawlStub.js";
import { processPreviewGen } from "./jobs/previewGen.js";

// Log configuration on startup
function redactPassword(url: string | undefined): string {
  if (!url) return "not set";
  try {
    const u = new URL(url);
    if (u.password) {
      u.password = "***";
    }
    return u.toString();
  } catch {
    return url.includes("@") ? url.replace(/:[^:@]+@/, ":***@") : url;
  }
}

const databaseUrl = redactPassword(process.env["DATABASE_URL"]);
const redisUrl = redactPassword(process.env["REDIS_URL"]);

console.log(`[Worker] DATABASE_URL: ${databaseUrl}`);
console.log(`[Worker] REDIS_URL: ${redisUrl || "not set (defaults to localhost:6379)"}`);
console.log(`[Worker] Starting workers for job types: ${Object.values(JOB_TYPES).join(", ")}`);

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
workers.push(
  queue.createWorker(JOB_TYPES.PREVIEW, processPreviewGen)
);

console.log(`[Worker] All workers started (${workers.length} total)`);

async function shutdown(): Promise<void> {
  for (const w of workers) await w.close();
  await queue.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
