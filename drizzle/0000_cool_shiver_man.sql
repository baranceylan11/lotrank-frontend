CREATE TABLE `auction_listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`external_id` text NOT NULL,
	`slug` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`mileage_km` integer NOT NULL,
	`fuel` text DEFAULT 'Diesel' NOT NULL,
	`transmission` text DEFAULT 'Automatique' NOT NULL,
	`location` text NOT NULL,
	`image_url` text NOT NULL,
	`current_price_cents` integer NOT NULL,
	`starting_price_cents` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`lotrank_score` integer DEFAULT 0 NOT NULL,
	`price_advantage_percent` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'live' NOT NULL,
	`auction_ends_at` text,
	`source_url` text NOT NULL,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `auction_sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auction_listings_source_external_unique` ON `auction_listings` (`source_id`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `auction_listings_slug_unique` ON `auction_listings` (`slug`);--> statement-breakpoint
CREATE TABLE `auction_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_synced_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auction_sources_slug_unique` ON `auction_sources` (`slug`);--> statement-breakpoint
CREATE TABLE `ingestion_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`records_seen` integer DEFAULT 0 NOT NULL,
	`records_changed` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`finished_at` text,
	FOREIGN KEY (`source_id`) REFERENCES `auction_sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `price_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listing_id` integer NOT NULL,
	`price_cents` integer NOT NULL,
	`observed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `auction_listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `price_events_listing_observed_unique` ON `price_events` (`listing_id`,`observed_at`);