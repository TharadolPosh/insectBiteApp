const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'usercs',
  host: 'localhost',
  database: 'InsectPlatformDB',
  password: 'password',
  port: '5432',
});

app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // ดึงข้อมูล user ที่มี email ตรงกัน
    const result = await pool.query(
      'SELECT user_id, password, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // ตรวจสอบว่าเป็น expert หรือไม่
    if (user.role !== 'expert') {
      return res.status(403).json({ message: 'Unauthorized: Only experts can log in' });
    }

    // เช็ครหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ส่ง expert_id กลับไป
    res.json({
      message: 'Login successful',
      user_id: user.user_id,
      role: user.role,
    });

  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(3008, () => {
  console.log('Server is running on port 3008');
});
