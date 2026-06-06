const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;

// Simple proxy without pathRewrite
app.use('/api/products', createProxyMiddleware({
    target: 'http://localhost:8081',
    changeOrigin: true,
    logLevel: 'debug'
}));

app.use('/api/orders', createProxyMiddleware({
    target: 'http://localhost:8082',
    changeOrigin: true,
    logLevel: 'debug'
}));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        services: {
            product: 'http://localhost:8081',
            order: 'http://localhost:8082'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
    console.log(`   Products: http://localhost:${PORT}/api/products`);
    console.log(`   Orders: http://localhost:${PORT}/api/orders`);
});