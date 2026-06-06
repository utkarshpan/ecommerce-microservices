const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'orderdb',
    password: 'password',
    port: 5434,
});

const createTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            total_amount DECIMAL(10,2),
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Orders table ready');
};

app.get('/api/orders', async (req, res) => {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
});

app.post('/api/orders', async (req, res) => {
    const { user_id, product_id, quantity, total_amount } = req.body;
    const result = await pool.query(
        'INSERT INTO orders (user_id, product_id, quantity, total_amount) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, product_id, quantity, total_amount]
    );
    res.json(result.rows[0]);
});

const startServer = async () => {
    await createTable();
    const PORT = 8082;
    app.listen(PORT, () => {
        console.log(`🚀 Order Service running on http://localhost:${PORT}`);
    });
};

startServer();