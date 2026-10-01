const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');

const app = express();
app.use(express.json());

// Endpoint dùng cho healthcheck ở các bước sau
app.get('/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: 'ok', db: 'connected' });
  }
  res.status(503).json({ status: 'error', db: 'disconnected' });
});

app.use('/api/products', productRoutes);

module.exports = app;