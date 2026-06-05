-- 006_add_sample_products.sql
-- Migration: Insert sample products

INSERT INTO products (name, price, stock, category) VALUES
('Laptop', 999.99, 10, 'Electronics'),
('Mouse', 29.99, 50, 'Electronics'),
('Keyboard', 79.99, 30, 'Electronics'),
('Monitor', 299.99, 15, 'Electronics'),
('Headphones', 59.99, 25, 'Electronics'),
('T-Shirt', 19.99, 100, 'Clothing'),
('Jeans', 49.99, 50, 'Clothing'),
('Java Programming Book', 39.99, 30, 'Books'),
('Python Cookbook', 45.99, 25, 'Books'),
('Coffee Mug', 12.99, 200, 'Home'),
('Desk Lamp', 29.99, 75, 'Home')
ON CONFLICT (id) DO NOTHING;