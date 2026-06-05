require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ecommerce',
    password: process.env.DB_PASSWORD || 'indu1989',
    port: process.env.DB_PORT || 5432,
});

const runMigrations = async () => {
    try {
        console.log('🔄 Starting migrations...');
        
        // Create migrations table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get all SQL files from migrations folder
        const migrationsDir = path.join(__dirname, 'migrations');
        
        if (!fs.existsSync(migrationsDir)) {
            console.log('📁 Creating migrations folder...');
            fs.mkdirSync(migrationsDir);
            console.log('⚠️  No migration files found. Please add .sql files to migrations folder');
            process.exit(0);
        }
        
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('⚠️  No migration files found in migrations folder');
            process.exit(0);
        }

        for (const file of files) {
            // Check if migration already ran
            const result = await pool.query('SELECT * FROM migrations WHERE name = $1', [file]);
            
            if (result.rows.length === 0) {
                console.log(`📝 Running migration: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await pool.query(sql);
                await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                console.log(`✅ Completed: ${file}`);
            } else {
                console.log(`⏭️ Skipping (already ran): ${file}`);
            }
        }

        console.log('🎉 All migrations completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigrations();