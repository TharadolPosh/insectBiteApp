require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());  // ตรวจสอบให้แน่ใจว่า CORS อนุญาตทุกที่
app.use(morgan('dev'));

// ตั้งค่า Proxy Routes
const services = {
  '/upload': process.env.IMAGE_UPLOAD_SERVICE,
  '/predict': process.env.PREDICTION_SERVICE,
  '/crowd': process.env.TEST_CROWD_SERVICE,
  '/db': process.env.DB_SERVICE,
  '/fingerprint': process.env.DEVICE_FINGERPRINT_SERVICE,
  '/search': process.env.SEARCH_SERVICE,
  '/expert': process.env.EXPERT_CASE_SERVICE,
  '/login': process.env.LOGIN_SERVICE,
};

// Proxy Middleware
Object.entries(services).forEach(([route, target]) => {
  if (target) {
    console.log(`Proxy enabled: ${route} → ${target}`); // ตรวจสอบว่ามีการ Map Route ถูกต้อง
    app.use(route, createProxyMiddleware({ target, changeOrigin: true }));
  } else {
    console.error(`⚠️ Missing target for ${route}`);
  }
});

// Error Handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
