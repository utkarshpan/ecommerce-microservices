const path = require('path');

module.exports = {
    databaseUrl: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'indu1989'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'ecommerce'}`,
    migrationsDirectory: path.join(__dirname, 'migrations'),
    migrationsTable: 'migrations',
    direction: 'up',
    createMigrations: true,
    createSchema: true,
    verbose: true,
    checkOrder: true
};