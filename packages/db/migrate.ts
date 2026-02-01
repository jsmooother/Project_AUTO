/**
 * Migration runner: creates schema_migrations, applies pending SQL files in order.
 * Run from repo root: pnpm db:migrate (runs in packages/db after build).
 * Loads .env from repo root so DATABASE_URL is available when run via turbo.
 * Root .env is used when you run pnpm db:migrate from repo root.
 */
import dotenv from "dotenv";
import pg from "pg";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, "..");
const REPO_ROOT = join(PACKAGE_ROOT, "..", "..");
dotenv.config({ path: join(REPO_ROOT, ".env") });

const ROOT = PACKAGE_ROOT;
const MIGRATIONS_DIR = join(ROOT, "migrations");

async function main(): Promise<void> {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = await readdir(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    const applied = await client
      .query("SELECT version FROM schema_migrations")
      .then((r) => new Set(r.rows.map((row) => row.version as string)));

    for (const file of sqlFiles) {
      const version = file.replace(/\.sql$/, "");
      if (applied.has(version)) {
        console.log("Skip (already applied):", file);
        continue;
      }

      const sql = await readFile(join(MIGRATIONS_DIR, file), "utf-8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version, applied_at) VALUES ($1, NOW())",
          [version]
        );
        await client.query("COMMIT");
        console.log("Applied:", file);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", file, err);
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
