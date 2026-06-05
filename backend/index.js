require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppError, notFound, errorHandler } = require('./middleware/errorHandler');
const asyncHandler = require('./middleware/asyncHandler');
const { successResponse } = require('./utils/responseHelper');
const { generalLimiter, authLimiter, orderLimiter, productLimiter } = require('./middleware/rateLimiter');
const {
    validateSignup,
    validateLogin,
    validateProduct,
    validateOrder,
    validateProfile
} = require('./validation');

const app = express();
app.use(cors());
app.use(express.json());

// Apply rate limiting to all requests
app.use(generalLimiter);

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ecommerce',
    password: process.env.DB_PASSWORD || 'indu1989',
    port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully');
        release();
    }
});

// ============ CREATE TABLES ============
const createTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            price DECIMAL(10,2),
            stock INTEGER,
            category VARCHAR(100) DEFAULT 'Uncategorized'
        )
    `);
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending',
            shipping_address TEXT,
            shipping_city VARCHAR(100),
            shipping_zip VARCHAR(20),
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
            product_name VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    console.log('✅ All tables ready');
};

const insertSampleProducts = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM products');
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
        const sampleProducts = [
            ['Laptop', 999.99, 10, 'Electronics'],
            ['Mouse', 29.99, 50, 'Electronics'],
            ['Keyboard', 79.99, 30, 'Electronics'],
            ['Monitor', 299.99, 15, 'Electronics'],
            ['Headphones', 59.99, 25, 'Electronics'],
            ['T-Shirt', 19.99, 100, 'Clothing'],
            ['Jeans', 49.99, 50, 'Clothing'],
            ['Java Programming Book', 39.99, 30, 'Books'],
            ['Python Cookbook', 45.99, 25, 'Books'],
            ['Coffee Mug', 12.99, 200, 'Home'],
            ['Desk Lamp', 29.99, 75, 'Home']
        ];
        
        for (const product of sampleProducts) {
            await pool.query(
                'INSERT INTO products (name, price, stock, category) VALUES ($1, $2, $3, $4)',
                product
            );
        }
        console.log('✅ Sample products inserted');
    }
};

// ============ AUTHENTICATION ============
app.post('/api/auth/signup', authLimiter, asyncHandler(async (req, res) => {
    const { error } = validateSignup(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    
    const { name, email, password } = req.body;
    
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw new AppError('User already exists', 400);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name || email.split('@')[0], email, hashedPassword]
    );
    
    const token = jwt.sign(
        { id: result.rows[0].id, email: result.rows[0].email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    successResponse(res, { token, user: result.rows[0] }, 'User created successfully', 201);
}));

app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
        throw new AppError('Invalid credentials', 401);
    }
    
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    successResponse(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Login successful');
}));

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        throw new AppError('Access denied. No token provided.', 401);
    }
    
    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        throw new AppError('Invalid or expired token', 403);
    }
};

app.get('/api/auth/me', verifyToken, asyncHandler(async (req, res) => {
    const result = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [req.user.id]
    );
    
    if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
    }
    
    successResponse(res, result.rows[0], 'User profile fetched');
}));

app.put('/api/auth/profile', verifyToken, asyncHandler(async (req, res) => {
    const { error } = validateProfile(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    
    const { name } = req.body;
    const result = await pool.query(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
        [name, req.user.id]
    );
    
    if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
    }
    
    successResponse(res, result.rows[0], 'Profile updated successfully');
}));

// ============ PRODUCT APIs ============
app.get('/api/products', asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice, search } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    if (search) {
        query += ` AND LOWER(name) LIKE LOWER($${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }
    
    if (category && category !== 'All') {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
    }
    
    if (minPrice) {
        query += ` AND price >= $${paramIndex}`;
        params.push(parseFloat(minPrice));
        paramIndex++;
    }
    
    if (maxPrice) {
        query += ` AND price <= $${paramIndex}`;
        params.push(parseFloat(maxPrice));
        paramIndex++;
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    successResponse(res, result.rows, 'Products fetched successfully');
}));

app.get('/api/categories', asyncHandler(async (req, res) => {
    const result = await pool.query(
        'SELECT DISTINCT category FROM products ORDER BY category'
    );
    successResponse(res, result.rows.map(r => r.category), 'Categories fetched');
}));

app.post('/api/products', verifyToken, productLimiter, asyncHandler(async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    
    const { name, price, stock, category } = req.body;
    const result = await pool.query(
        'INSERT INTO products (name, price, stock, category) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, price, stock, category || 'Uncategorized']
    );
    
    successResponse(res, result.rows[0], 'Product added successfully', 201);
}));

// ============ ORDER APIs ============
app.post('/api/orders', verifyToken, orderLimiter, asyncHandler(async (req, res) => {
    const { error } = validateOrder(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    
    const { items, total_amount, shipping_address, shipping_city, shipping_zip, phone } = req.body;
    
    await pool.query('BEGIN');
    
    const orderResult = await pool.query(
        `INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_zip, phone) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [req.user.id, total_amount, shipping_address, shipping_city, shipping_zip, phone]
    );
    const orderId = orderResult.rows[0].id;
    
    for (const item of items) {
        await pool.query(
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
             VALUES ($1, $2, $3, $4, $5)`,
            [orderId, item.id, item.name, item.quantity, item.price]
        );
        
        await pool.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [item.quantity, item.id]
        );
    }
    
    await pool.query('COMMIT');
    successResponse(res, { orderId }, 'Order placed successfully', 201);
}));

app.get('/api/orders', verifyToken, asyncHandler(async (req, res) => {
    const orders = await pool.query(
        `SELECT * FROM orders 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [req.user.id]
    );
    successResponse(res, orders.rows, 'Orders fetched successfully');
}));

app.get('/api/orders/:id', verifyToken, asyncHandler(async (req, res) => {
    const orderResult = await pool.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
    );
    
    if (orderResult.rows.length === 0) {
        throw new AppError('Order not found', 404);
    }
    
    const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [req.params.id]
    );
    
    successResponse(res, { ...orderResult.rows[0], items: itemsResult.rows }, 'Order details fetched');
}));

app.put('/api/orders/:id/status', verifyToken, asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400);
    }
    
    const orderCheck = await pool.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
    );
    
    if (orderCheck.rows.length === 0) {
        throw new AppError('Order not found', 404);
    }
    
    if (status === 'cancelled' && orderCheck.rows[0].status !== 'pending') {
        throw new AppError('Only pending orders can be cancelled', 400);
    }
    
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    
    if (status === 'cancelled') {
        const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
        
        for (const item of items.rows) {
            await pool.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
        }
    }
    
    successResponse(res, null, `Order ${status} successfully`);
}));

// ============ ERROR HANDLING MIDDLEWARE ============
app.use(notFound);
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await createTables();
    await insertSampleProducts();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📦 Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
        console.log('✅ Input validation enabled');
        console.log('✅ Error handling enabled');
        console.log('✅ Rate limiting enabled');
    });
};

startServer();