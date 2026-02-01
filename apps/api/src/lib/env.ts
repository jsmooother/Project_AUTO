/**
 * Load .env from repo root so API can run without manual export when started
 * via pnpm --filter @repo/api dev from repo root or from apps/api.
 */
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
let dir = join(__dirname, "..", "..", "..");
while (dir !== "/") {
  if (existsSync(join(dir, "apps")) && existsSync(join(dir, "packages"))) {
    dotenv.config({ path: join(dir, ".env"), override: true });
    break;
  }
  dir = join(dir, "..");
}
