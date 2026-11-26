ALTER TABLE `bookings` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `bookings_user_idx` ON `bookings` (`user_id`);