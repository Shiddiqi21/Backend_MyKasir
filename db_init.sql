-- MyKasir DB init script
-- Run: mysql -u root -p < db_init.sql

-- 1) Create database (if not exists)
CREATE DATABASE IF NOT EXISTS `mykasir` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `mykasir`;

-- 2) Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','kasir') NOT NULL DEFAULT 'kasir',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(255) DEFAULT '',
  `price` INT NOT NULL DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `minStock` INT NOT NULL DEFAULT 0,
  `imageUri` VARCHAR(1024) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Customers table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) Transactions table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customerId` INT NOT NULL,
  `total` INT NOT NULL,
  `userId` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_transactions_customerId` (`customerId`),
  INDEX `idx_transactions_userId` (`userId`),
  CONSTRAINT `fk_transactions_customer` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) Transaction items table
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `transactionId` INT NOT NULL,
  `productName` VARCHAR(255) NOT NULL,
  `unitPrice` INT NOT NULL,
  `quantity` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_items_transactionId` (`transactionId`),
  CONSTRAINT `fk_items_transaction` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: insert an admin user (password hashed required)
-- If you want a quick admin user with plain password (not recommended), uncomment below.
-- INSERT INTO `users` (`email`,`password`,`name`,`role`) VALUES ('admin@mykasir.com', 'password_plain', 'Admin', 'admin');

-- End of script
