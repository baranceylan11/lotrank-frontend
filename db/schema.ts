import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const auctionSources = sqliteTable("auction_sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["active", "delayed", "maintenance", "disabled"] }).notNull().default("active"),
  lastSyncedAt: text("last_synced_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("auction_sources_slug_unique").on(table.slug)]);

export const auctionListings = sqliteTable("auction_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceId: integer("source_id").notNull().references(() => auctionSources.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  slug: text("slug").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileageKm: integer("mileage_km").notNull(),
  fuel: text("fuel").notNull().default("Diesel"),
  transmission: text("transmission").notNull().default("Automatique"),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  currentPriceCents: integer("current_price_cents").notNull(),
  startingPriceCents: integer("starting_price_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  lotrankScore: integer("lotrank_score").notNull().default(0),
  priceAdvantagePercent: integer("price_advantage_percent").notNull().default(0),
  status: text("status", { enum: ["upcoming", "live", "ended", "cancelled"] }).notNull().default("live"),
  auctionEndsAt: text("auction_ends_at"),
  sourceUrl: text("source_url").notNull(),
  firstSeenAt: text("first_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("auction_listings_source_external_unique").on(table.sourceId, table.externalId),
  uniqueIndex("auction_listings_slug_unique").on(table.slug),
]);

export const priceEvents = sqliteTable("price_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull().references(() => auctionListings.id, { onDelete: "cascade" }),
  priceCents: integer("price_cents").notNull(),
  observedAt: text("observed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("price_events_listing_observed_unique").on(table.listingId, table.observedAt)]);

export const ingestionRuns = sqliteTable("ingestion_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceId: integer("source_id").notNull().references(() => auctionSources.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["running", "succeeded", "failed"] }).notNull().default("running"),
  recordsSeen: integer("records_seen").notNull().default(0),
  recordsChanged: integer("records_changed").notNull().default(0),
  errorMessage: text("error_message"),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  finishedAt: text("finished_at"),
});
