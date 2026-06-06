const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'productdb',
    password: 'password',
    port: 5433,
});

const createTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            price DECIMAL(10,2),
            stock INTEGER,
            category VARCHAR(100)
        )
    `);
    console.log('✅ Products table ready');
};

app.get('/api/products', async (req, res) => {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
});

app.post('/api/products', async (req, res) => {
    const { name, price, stock, category } = req.body;
    const result = await pool.query(
        'INSERT INTO products (name, price, stock, category) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, price, stock, category]
    );
    res.json(result.rows[0]);
});

const addSampleProducts = async () => {
    const count = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(count.rows[0].count) === 0) {
        const sampleProducts = [
            ['Laptop', 999.99, 10, 'Electronics'],
            ['Mouse', 29.99, 50, 'Electronics'],
            ['Keyboard', 79.99, 30, 'Electronics'],
        ];
        for (const product of sampleProducts) {
            await pool.query(
                'INSERT INTO products (name, price, stock, category) VALUES ($1, $2, $3, $4)',
                product
            );
        }
        console.log('✅ Sample products added');
    }
};

const startServer = async () => {
    await createTable();
    await addSampleProducts();
    const PORT = 8081;
    app.listen(PORT, () => {
        console.log(`🚀 Product Service running on http://localhost:${PORT}`);
    });
};

startServer();