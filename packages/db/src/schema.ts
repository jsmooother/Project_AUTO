/**
 * Drizzle schema mirror of migrations/*.sql (source of truth).
 * All tenant tables include customer_id.
 *
 * Guardrail: whenever a migration changes schema, update this file in the same PR.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

export const schemaMigrations = pgTable("schema_migrations", {
  version: text("version").primaryKey(),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dataSources = pgTable("data_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  strategy: text("strategy").notNull(),
  scheduleEnabled: boolean("schedule_enabled").notNull().default(false),
  scheduleCron: text("schedule_cron"),
  maxItems: integer("max_items"),
  configJson: jsonb("config_json"), // SiteProfile: profileVersion, probe, discovery, fetch, extract, limits
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scrapeRuns = pgTable("scrape_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  dataSourceId: uuid("data_source_id")
    .notNull()
    .references(() => dataSources.id, { onDelete: "cascade" }),
  runType: text("run_type").notNull(), // 'test' | 'prod' | 'probe'
  status: text("status").notNull(),
  jobId: text("job_id"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  itemsFound: integer("items_found"),
  itemsNew: integer("items_new").notNull().default(0),
  itemsUpdated: integer("items_updated"),
  itemsDeleted: integer("items_deleted"),
  itemsSeen: integer("items_seen").notNull().default(0),
  itemsRemoved: integer("items_removed").notNull().default(0),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
});

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    dataSourceId: uuid("data_source_id")
      .notNull()
      .references(() => dataSources.id, { onDelete: "cascade" }),
    sourceItemId: text("source_item_id").notNull(),
    title: text("title"),
    price: numeric("price", { precision: 20, scale: 4 }),
    currency: text("currency"),
    url: text("url"),
    imageUrl: text("image_url"),
    attributesJson: jsonb("attributes_json"),
    hash: text("hash"),
    isActive: boolean("is_active").notNull().default(true),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    // Lifecycle (incremental add/remove)
    removedAt: timestamp("removed_at", { withTimezone: true }),
    lastSeenRunId: uuid("last_seen_run_id").references(() => scrapeRuns.id, { onDelete: "set null" }),
    lastDetailRunId: uuid("last_detail_run_id").references(() => scrapeRuns.id, { onDelete: "set null" }),
    detailFetchedAt: timestamp("detail_fetched_at", { withTimezone: true }),
    contentHash: text("content_hash"),
    // Detail (vehicle/generic)
    descriptionText: text("description_text"),
    priceAmount: numeric("price_amount", { precision: 20, scale: 4 }),
    priceCurrency: text("price_currency"),
    imageUrlsJson: jsonb("image_urls_json"),
    primaryImageUrl: text("primary_image_url"),
  },
  (t) => [unique().on(t.customerId, t.dataSourceId, t.sourceItemId)]
);

export const catalogs = pgTable("catalogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  rulesJson: jsonb("rules_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const catalogItems = pgTable(
  "catalog_items",
  {
    catalogId: uuid("catalog_id")
      .notNull()
      .references(() => catalogs.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.catalogId, t.itemId] })]
);

export const metaAccounts = pgTable("meta_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  metaAdAccountId: text("meta_ad_account_id").notNull(),
  metaCatalogId: text("meta_catalog_id"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const metaJobs = pgTable("meta_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  catalogId: uuid("catalog_id")
    .notNull()
    .references(() => catalogs.id, { onDelete: "cascade" }),
  jobType: text("job_type").notNull(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  configJson: jsonb("config_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const templateAssets = pgTable("template_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  assetType: text("asset_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  metaCampaignId: text("meta_campaign_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  configJson: jsonb("config_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adsets = pgTable("adsets", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  metaAdsetId: text("meta_adset_id").notNull(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").notNull(),
  configJson: jsonb("config_json"),
});

export const ads = pgTable("ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  metaAdId: text("meta_ad_id").notNull(),
  adsetId: uuid("adset_id")
    .notNull()
    .references(() => adsets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").notNull(),
  creativeJson: jsonb("creative_json"),
});

export const errorTaxonomy = pgTable("error_taxonomy", {
  eventCode: text("event_code").primaryKey(),
  category: text("category").notNull(),
  severityDefault: text("severity_default").notNull(),
  userMessageTemplate: text("user_message_template"),
  runbookReference: text("runbook_reference"),
});

export const runEvents = pgTable("run_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  jobType: text("job_type").notNull(),
  jobId: text("job_id").notNull(),
  runId: text("run_id").notNull(),
  runIdUuid: uuid("run_id_uuid").references(() => scrapeRuns.id, { onDelete: "set null" }),
  dataSourceId: uuid("data_source_id").references(() => dataSources.id, { onDelete: "set null" }),
  level: text("level").notNull(),
  stage: text("stage").notNull(),
  eventCode: text("event_code").notNull(),
  message: text("message").notNull(),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reproBundles = pgTable("repro_bundles", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  jobType: text("job_type").notNull(),
  jobId: text("job_id").notNull(),
  runId: uuid("run_id").references(() => scrapeRuns.id, { onDelete: "set null" }),
  dataSourceId: uuid("data_source_id").references(() => dataSources.id, { onDelete: "set null" }),
  storageKey: text("storage_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supportCases = pgTable("support_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  dataSourceId: uuid("data_source_id").references(() => dataSources.id, { onDelete: "set null" }),
  scrapeRunId: uuid("scrape_run_id").references(() => scrapeRuns.id, { onDelete: "set null" }),
  subject: text("subject"),
  description: text("description"),
  status: text("status").notNull(),
  severity: text("severity"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const onboardingStates = pgTable(
  "onboarding_states",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    companyInfoCompleted: boolean("company_info_completed").notNull().default(false),
    budgetInfoCompleted: boolean("budget_info_completed").notNull().default(false),
    companyName: text("company_name"),
    companyWebsite: text("company_website"),
    monthlyBudgetAmount: numeric("monthly_budget_amount", { precision: 12, scale: 2 }),
    budgetCurrency: text("budget_currency").default("USD"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.customerId)]
);

export const inventorySources = pgTable(
  "inventory_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    websiteUrl: text("website_url").notNull(),
    status: text("status").notNull().default("active"),
    lastCrawledAt: timestamp("last_crawled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.customerId)]
);

export const crawlRuns = pgTable("crawl_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  inventorySourceId: uuid("inventory_source_id")
    .notNull()
    .references(() => inventorySources.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull().default("manual"),
  status: text("status").notNull().default("queued"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    inventorySourceId: uuid("inventory_source_id")
      .notNull()
      .references(() => inventorySources.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    title: text("title"),
    url: text("url"),
    price: integer("price"),
    status: text("status").notNull().default("active"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.customerId, t.inventorySourceId, t.externalId)]
);

// Milestone 3: Templates + Approval workflow
export const adTemplates = pgTable("ad_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adTemplateConfigs = pgTable(
  "ad_template_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    templateKey: text("template_key").notNull(),
    brandName: text("brand_name"),
    primaryColor: text("primary_color"),
    logoUrl: text("logo_url"),
    headlineStyle: text("headline_style"),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.customerId)]
);

export const adPreviews = pgTable("ad_previews", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  templateConfigId: uuid("template_config_id")
    .notNull()
    .references(() => adTemplateConfigs.id, { onDelete: "cascade" }),
  inventoryItemId: uuid("inventory_item_id").references(() => inventoryItems.id, { onDelete: "set null" }),
  previewType: text("preview_type").notNull().default("html"),
  assetUrl: text("asset_url"),
  htmlContent: text("html_content"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const previewRuns = pgTable("preview_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  templateConfigId: uuid("template_config_id")
    .notNull()
    .references(() => adTemplateConfigs.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull().default("manual"),
  status: text("status").notNull().default("queued"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  templateConfigId: uuid("template_config_id")
    .notNull()
    .references(() => adTemplateConfigs.id, { onDelete: "cascade" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }).notNull().defaultNow(),
  approvedByUserId: uuid("approved_by_user_id"),
  notes: text("notes"),
});

export const metaConnections = pgTable(
  "meta_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("disconnected"), // disconnected|connected|error
    metaUserId: text("meta_user_id"),
    accessToken: text("access_token"), // dev placeholder only
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    scopes: text("scopes").array(),
    adAccountId: text("ad_account_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.customerId)]
);

export const adSettings = pgTable(
  "ad_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    geoMode: text("geo_mode").notNull().default("radius"), // 'radius' | 'regions'
    geoCenterText: text("geo_center_text"),
    geoRadiusKm: integer("geo_radius_km"),
    geoRegionsJson: jsonb("geo_regions_json"),
    formatsJson: jsonb("formats_json").notNull().default([]),
    ctaType: text("cta_type").notNull().default("learn_more"),
    budgetOverride: numeric("budget_override", { precision: 20, scale: 4 }),
    status: text("status").notNull().default("draft"), // 'draft' | 'ready' | 'active' | 'error'
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastPublishedAt: timestamp("last_published_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.customerId)]
);

export const adRuns = pgTable("ad_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull().default("manual"), // 'manual' | 'scheduled'
  status: text("status").notNull().default("queued"), // 'queued' | 'running' | 'success' | 'failed'
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const metaAdObjects = pgTable(
  "meta_ad_objects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    catalogId: text("catalog_id"),
    campaignId: text("campaign_id"),
    adsetId: text("adset_id"),
    adId: text("ad_id"),
    status: text("status").notNull().default("draft"), // 'draft' | 'active' | 'paused' | 'error'
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.customerId)]
);
