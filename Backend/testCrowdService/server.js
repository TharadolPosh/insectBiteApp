const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const { getImageData } = require('./imageService');
const voteRoutes = require('./voteRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ✅ API ดึงข้อมูลวิเคราะห์ (ไม่มี image_url แล้ว)
app.get('/api/analysis', async (req, res) => {
    const { fingerprint } = req.query;

    try {
        const result = await pool.query(
            `SELECT ia.upload_id, 
                    ia.insect_type, 
                    COALESCE(AVG(ia.confidence), 0) AS avg_confidence
             FROM image_analysis ia
             LEFT JOIN crowdsourcing_votes v 
             ON ia.upload_id = v.image_id AND v.user_fingerprint = $1
             WHERE v.user_fingerprint IS NULL
             GROUP BY ia.upload_id, ia.insect_type
             ORDER BY avg_confidence DESC`, 
            [fingerprint]
        );

        res.json(result.rows.map(row => ({
            ...row,
            avg_confidence: row.avg_confidence !== null ? parseFloat(row.avg_confidence).toFixed(2) : "0.00"
        })));
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});


// ✅ API ดึงรูปภาพแยกต่างหาก
app.get('/api/images', async (req, res) => {
    try {
        const images = await getImageData();
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching images' });
    }
});

app.use('/api', voteRoutes);

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
