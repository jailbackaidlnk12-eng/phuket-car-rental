CREATE TABLE `cars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`type` text NOT NULL,
	`licensePlate` text NOT NULL,
	`hourlyRate` real NOT NULL,
	`dailyRate` real NOT NULL,
	`description` text,
	`imageUrl` text,
	`status` text DEFAULT 'available' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cars_licensePlate_unique` ON `cars` (`licensePlate`);--> statement-breakpoint
CREATE TABLE `idCards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`idNumber` text NOT NULL,
	`fullName` text NOT NULL,
	`dateOfBirth` text,
	`imageUrl` text NOT NULL,
	`imageUrlWithWatermark` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`verifiedBy` integer,
	`verificationNotes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`rentalId` integer,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`isRead` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`rentalId` integer,
	`amount` real NOT NULL,
	`type` text DEFAULT 'top_up' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`promptPayRef` text,
	`confirmedBy` integer,
	`confirmedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pushTokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`token` text NOT NULL,
	`platform` text NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rentals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`carId` integer NOT NULL,
	`startDate` integer NOT NULL,
	`endDate` integer NOT NULL,
	`actualReturnDate` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`totalCost` real,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`passwordHash` text NOT NULL,
	`name` text,
	`email` text,
	`role` text DEFAULT 'user' NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);