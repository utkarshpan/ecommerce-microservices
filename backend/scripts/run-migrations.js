const { migrate } = require('postgres-migrations');
const path = require('path');
require('dotenv').config();

const runMigrations = async () => {
    const dbConfig = {
        database: process.env.DB_NAME || 'ecommerce',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'indu1989',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
    };

    try {
        console.log('🔄 Running database migrations...');
        await migrate(dbConfig, path.join(__dirname, '../migrations'));
        console.log('✅ Migrations completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigrations();