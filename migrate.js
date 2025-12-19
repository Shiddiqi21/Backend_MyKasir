// Migration script untuk MyKasir
// Jalankan: node migrate.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    console.log('🚀 Starting migration...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'mykasir',
        multipleStatements: true
    });

    try {
        // Check if users table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'users'");

        if (tables.length === 0) {
            console.log('⚠️ Tabel users tidak ditemukan!');
            console.log('📌 Database masih kosong, akan membuat semua tabel...\n');

            // Create all tables from scratch
            await createAllTables(connection);
        } else {
            console.log('✅ Tabel users ditemukan, akan melakukan migration...\n');
            await migrateExisting(connection);
        }

        console.log('═══════════════════════════════════════');
        console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════');
        console.log('\n🔄 Please restart the backend server!\n');

    } catch (error) {
        console.error('❌ Migration error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

async function createAllTables(connection) {
    // Create stores table
    console.log('📦 Creating stores table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS stores (
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Done\n');

    // Create users table
    console.log('👤 Creating users table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role ENUM('owner','cashier') NOT NULL DEFAULT 'owner',
            storeId INT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_users_storeId (storeId),
            CONSTRAINT fk_users_store FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Done\n');

    // Create products table
    console.log('📦 Creating products table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(255) DEFAULT '',
            price INT NOT NULL DEFAULT 0,
            stock INT NOT NULL DEFAULT 0,
            minStock INT NOT NULL DEFAULT 0,
            imageUri VARCHAR(1024) DEFAULT NULL,
            storeId INT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_products_storeId (storeId),
            CONSTRAINT fk_products_store FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Done\n');

    // Create customers table
    console.log('👥 Creating customers table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS customers (
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            storeId INT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_customers_storeId (storeId),
            CONSTRAINT fk_customers_store FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Done\n');

    // Create transactions table
    console.log('💰 Creating transactions table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INT NOT NULL AUTO_INCREMENT,
            customerId INT NOT NULL,
            total INT NOT NULL,
            userId INT DEFAULT NULL,
            storeId INT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_transactions_customerId (customerId),
            INDEX idx_transactions_userId (userId),
            INDEX idx_transactions_storeId (storeId),
            CONSTRAINT fk_transactions_customer FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT fk_transactions_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT fk_transactions_store FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Done\n');

    // Create transaction_items table
    console.log('🧾 Creating transaction_items table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS transaction_items (
            id INT NOT NULL AUTO_INCREMENT,
            transactionId INT NOT NULL,
            productName VARCHAR(255) NOT NULL,
            unitPrice INT NOT NULL,
            quantity INT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_items_transactionId (transactionId),
            CONSTRAINT fk_items_transaction FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Done\n');

    console.log('📍 All tables created with new schema!\n');
}

async function migrateExisting(connection) {
    // STEP 1: Create stores table
    console.log('📦 Step 1: Creating stores table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS stores (
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Done\n');

    // STEP 2: Create default store
    console.log('🏪 Step 2: Creating default store...');
    const [stores] = await connection.query('SELECT id FROM stores LIMIT 1');
    let defaultStoreId;

    if (stores.length === 0) {
        const [result] = await connection.query("INSERT INTO stores (name) VALUES ('Toko Default')");
        defaultStoreId = result.insertId;
        console.log(`   ✅ Created "Toko Default" with ID: ${defaultStoreId}\n`);
    } else {
        defaultStoreId = stores[0].id;
        console.log(`   ✅ Using existing store with ID: ${defaultStoreId}\n`);
    }

    // STEP 3: Add storeId to users
    console.log('👤 Step 3: Adding storeId to users...');
    const [userCols] = await connection.query("SHOW COLUMNS FROM users LIKE 'storeId'");
    if (userCols.length === 0) {
        await connection.query('ALTER TABLE users ADD COLUMN storeId INT NULL');
        console.log('   Added storeId column');
    }
    await connection.query('UPDATE users SET storeId = ? WHERE storeId IS NULL', [defaultStoreId]);
    try {
        await connection.query('ALTER TABLE users MODIFY COLUMN storeId INT NOT NULL');
    } catch (e) { }
    console.log('   ✅ Done\n');

    // STEP 4: Update role enum
    console.log('🔄 Step 4: Updating role enum...');
    try {
        await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin','kasir','owner','cashier') NOT NULL DEFAULT 'owner'");
        await connection.query("UPDATE users SET role = 'owner' WHERE role = 'admin'");
        await connection.query("UPDATE users SET role = 'cashier' WHERE role = 'kasir'");
        await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('owner','cashier') NOT NULL DEFAULT 'owner'");
        console.log('   ✅ Done\n');
    } catch (e) {
        console.log('   ⚠️ Already migrated or error\n');
    }

    // STEP 5-7: Add storeId to other tables
    for (const table of ['products', 'customers', 'transactions']) {
        console.log(`📦 Adding storeId to ${table}...`);
        const [cols] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE 'storeId'`);
        if (cols.length === 0) {
            await connection.query(`ALTER TABLE ${table} ADD COLUMN storeId INT NULL`);
        }
        await connection.query(`UPDATE ${table} SET storeId = ? WHERE storeId IS NULL`, [defaultStoreId]);
        try {
            await connection.query(`ALTER TABLE ${table} MODIFY COLUMN storeId INT NOT NULL`);
        } catch (e) { }
        console.log('   ✅ Done\n');
    }

    // Make first user owner
    console.log('👑 Setting first user as owner...');
    await connection.query("UPDATE users SET role = 'owner' ORDER BY id ASC LIMIT 1");
    console.log('   ✅ Done\n');

    console.log(`📍 Default Store ID: ${defaultStoreId}`);
    console.log('📍 All existing data assigned to "Toko Default"\n');
}

migrate().catch(console.error);
