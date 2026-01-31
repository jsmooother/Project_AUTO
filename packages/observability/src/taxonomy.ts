/**
 * event_code -> category, severity, user_message_template, runbook. Reads from error_taxonomy table.
 */

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@repo/db/schema";
import { errorTaxonomy } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export type TaxonomyEntry = {
  category: string;
  severityDefault: string;
  userMessageTemplate: string | null;
  runbookReference: string | null;
};

export async function getTaxonomy(
  db: NodePgDatabase<typeof schema>,
  eventCode: string
): Promise<TaxonomyEntry | null> {
  const rows = await db
    .select()
    .from(errorTaxonomy)
    .where(eq(errorTaxonomy.eventCode, eventCode))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    category: row.category,
    severityDefault: row.severityDefault,
    userMessageTemplate: row.userMessageTemplate,
    runbookReference: row.runbookReference,
  };
}
