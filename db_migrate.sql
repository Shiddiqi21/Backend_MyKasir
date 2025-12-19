-- MyKasir Migration Script
-- Script ini akan menambahkan struktur multi-tenant TANPA menghapus data yang ada
-- Run: Import file ini via phpMyAdmin atau jalankan di MySQL CLI

USE `mykasir`;

-- ============================================================
-- STEP 1: Buat tabel stores (jika belum ada)
-- ============================================================
CREATE TABLE IF NOT EXISTS `stores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- STEP 2: Buat store default untuk data yang sudah ada
-- ============================================================
INSERT INTO `stores` (`name`) 
SELECT 'Toko Default' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `stores` WHERE `id` = 1);

-- Ambil ID store default (harusnya 1)
SET @default_store_id = (SELECT `id` FROM `stores` ORDER BY `id` ASC LIMIT 1);

-- ============================================================
-- STEP 3: Tambahkan kolom storeId ke tabel users (jika belum ada)
-- ============================================================
-- Cek apakah kolom storeId sudah ada
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_schema = 'mykasir' AND table_name = 'users' AND column_name = 'storeId');

-- Tambahkan kolom jika belum ada
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `storeId` INT NULL AFTER `role`', 
    'SELECT "storeId column already exists in users"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update semua user yang belum punya storeId
UPDATE `users` SET `storeId` = @default_store_id WHERE `storeId` IS NULL;

-- Ubah kolom menjadi NOT NULL setelah diisi
ALTER TABLE `users` MODIFY COLUMN `storeId` INT NOT NULL;

-- Tambahkan foreign key (jika belum ada)
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints 
                  WHERE table_schema = 'mykasir' AND table_name = 'users' AND constraint_name = 'fk_users_store');
SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE `users` ADD CONSTRAINT `fk_users_store` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE', 
    'SELECT "FK already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- STEP 4: Update kolom role di users
-- ============================================================
-- Ubah enum role dari admin/kasir menjadi owner/cashier
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin','kasir','owner','cashier') NOT NULL DEFAULT 'owner';

-- Konversi role lama ke role baru
UPDATE `users` SET `role` = 'owner' WHERE `role` = 'admin';
UPDATE `users` SET `role` = 'cashier' WHERE `role` = 'kasir';

-- Ubah enum menjadi hanya owner/cashier
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('owner','cashier') NOT NULL DEFAULT 'owner';

-- ============================================================
-- STEP 5: Tambahkan kolom storeId ke tabel products
-- ============================================================
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_schema = 'mykasir' AND table_name = 'products' AND column_name = 'storeId');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE `products` ADD COLUMN `storeId` INT NULL', 
    'SELECT "storeId column already exists in products"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `products` SET `storeId` = @default_store_id WHERE `storeId` IS NULL;
ALTER TABLE `products` MODIFY COLUMN `storeId` INT NOT NULL;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints 
                  WHERE table_schema = 'mykasir' AND table_name = 'products' AND constraint_name = 'fk_products_store');
SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE `products` ADD CONSTRAINT `fk_products_store` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE', 
    'SELECT "FK already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- STEP 6: Tambahkan kolom storeId ke tabel customers
-- ============================================================
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_schema = 'mykasir' AND table_name = 'customers' AND column_name = 'storeId');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE `customers` ADD COLUMN `storeId` INT NULL', 
    'SELECT "storeId column already exists in customers"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `customers` SET `storeId` = @default_store_id WHERE `storeId` IS NULL;
ALTER TABLE `customers` MODIFY COLUMN `storeId` INT NOT NULL;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints 
                  WHERE table_schema = 'mykasir' AND table_name = 'customers' AND constraint_name = 'fk_customers_store');
SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE `customers` ADD CONSTRAINT `fk_customers_store` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE', 
    'SELECT "FK already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- STEP 7: Tambahkan kolom storeId ke tabel transactions
-- ============================================================
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_schema = 'mykasir' AND table_name = 'transactions' AND column_name = 'storeId');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE `transactions` ADD COLUMN `storeId` INT NULL', 
    'SELECT "storeId column already exists in transactions"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `transactions` SET `storeId` = @default_store_id WHERE `storeId` IS NULL;
ALTER TABLE `transactions` MODIFY COLUMN `storeId` INT NOT NULL;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints 
                  WHERE table_schema = 'mykasir' AND table_name = 'transactions' AND constraint_name = 'fk_transactions_store');
SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE `transactions` ADD CONSTRAINT `fk_transactions_store` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE', 
    'SELECT "FK already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- STEP 8: Update user pertama menjadi owner toko default
-- ============================================================
UPDATE `users` SET `role` = 'owner' WHERE `id` = (SELECT MIN(u.id) FROM (SELECT id FROM users) u);

-- ============================================================
-- SELESAI!
-- ============================================================
SELECT 'Migration completed successfully!' AS result;
SELECT 'Default store created: Toko Default' AS info;
SELECT CONCAT('All existing data assigned to store ID: ', @default_store_id) AS info;
