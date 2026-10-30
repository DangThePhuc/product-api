const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');

const app = express();

// Ghi log mỗi request (bỏ qua /health vì healthcheck gọi mỗi 10 giây)
app.use((req, res, next) => {
  if (req.originalUrl === '/health') return next();
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`
    );
  });
  next();
});

app.use(express.json());

// Endpoint dùng cho healthcheck ở các bước sau
app.get('/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: 'ok', db: 'connected' });
  }
  res.status(503).json({ status: 'error', db: 'disconnected' });
});
   app.get('/', (req, res) => {
     res.json({ message: 'Product API - CI/CD OK' });
   });
app.use('/api/products', productRoutes);

module.exports = app;
