-- OLUWASHOLA ATELIER DATABASE MIGRATION SCHEMA
-- Compatible with MySQL and MariaDB databases

-- Create Database (Optional, depending on user privileges on DirectAdmin)
-- CREATE DATABASE IF NOT EXISTS `oluwashola_atelier`;
-- USE `oluwashola_atelier`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `address` TEXT NULL,
  `salt` VARCHAR(64) NOT NULL,
  `hash` VARCHAR(128) NOT NULL,
  `measurements` TEXT NULL, -- Contains stringified JSON of customer measurements
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `userId` VARCHAR(50) NOT NULL,
  `orderType` VARCHAR(50) NOT NULL,
  `fabricId` VARCHAR(50) NULL,
  `yardsOrdered` INT NULL,
  `customStyleId` VARCHAR(50) NULL,
  `selectedFabrics` TEXT NULL, -- Stringified JSON array of multiple fabric items [{ fabricId, yards }]
  `selectedServices` TEXT NULL, -- Stringified JSON array of selected custom tailoring add-ons
  `measurementsType` VARCHAR(50) NOT NULL,
  `measurements` TEXT NULL, -- Stringified JSON of custom body dimensions
  `measurementFileUrl` VARCHAR(255) NULL,
  `deliveryType` VARCHAR(50) NOT NULL,
  `deliveryAddress` TEXT NULL,
  `specialInstructions` TEXT NULL,
  `totalPrice` INT NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `createdAt` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_orders_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
