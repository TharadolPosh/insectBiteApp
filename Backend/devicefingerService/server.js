require('dotenv').config();  // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Fetch DATABASE_URL from .env
});

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// 🔹 **API: Save device fingerprint**
app.post('/device-fingerprints', async (req, res) => {
  try {
    const { user_id, fingerprint, device_id, brand, model, system_name, system_version, is_emulator, ip_address } = req.body;

    // 🔹 ตรวจสอบค่าที่รับจาก Client
    console.log("Received Device Fingerprint Data:", req.body);

    // 🔹 เช็คว่าค่าที่สำคัญต้องไม่เป็น null
    if (!fingerprint || !device_id || !brand || !model || !system_name || !system_version) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // 🔹 ป้องกัน error: invalid input syntax for type inet
    const validIpAddress = ip_address && ip_address !== 'unknown' ? ip_address : null;

    const query = `
      INSERT INTO DeviceFingerprints 
      (user_id, fingerprint, device_id, brand, model, system_name, system_version, is_emulator, ip_address, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (fingerprint) DO UPDATE 
      SET updated_at = CURRENT_TIMESTAMP 
      RETURNING *;
    `;

    const values = [user_id, fingerprint, device_id, brand, model, system_name, system_version, is_emulator, validIpAddress];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving fingerprint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔹 **API: Fetch device fingerprint by user_id**
app.get('/device-fingerprints/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query('SELECT * FROM DeviceFingerprints WHERE user_id = $1', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No fingerprint found' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fingerprint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
