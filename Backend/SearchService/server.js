const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3005;

const pool = new Pool({
  user: 'usercs',
  host: 'localhost',
  database: 'InsectPlatformDB',
  password: 'password',
  port: '5432',
});

// อนุญาตทุกโดเมนให้เรียกใช้ API
app.use(cors({
  origin: '*'
}));

app.get('/insect_bites/Ssearch', async (req, res) => {
    const { name } = req.query;
    try {
      const result = await pool.query(
        'SELECT id, name, description, symptom_description, first_aid_method, encode(image, \'base64\') AS image, encode(wound_image, \'base64\') AS wound_image FROM insect_bites WHERE name ILIKE $1',
        [`%${name}%`]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
