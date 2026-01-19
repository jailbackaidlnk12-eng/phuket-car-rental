CREATE TABLE `auditLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`action` text NOT NULL,
	`targetTable` text NOT NULL,
	`targetId` integer NOT NULL,
	`oldValue` text,
	`newValue` text,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'car' NOT NULL,
	`licensePlate` text,
	`hourlyRate` real,
	`dailyRate` real NOT NULL,
	`description` text,
	`imageUrl` text,
	`status` text DEFAULT 'available' NOT NULL,
	`metadata` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedBy` integer,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `systemSettings_key_unique` ON `systemSettings` (`key`);--> statement-breakpoint
DROP TABLE `cars`;--> statement-breakpoint
ALTER TABLE `rentals` ADD `productId` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `rentals` DROP COLUMN `carId`;