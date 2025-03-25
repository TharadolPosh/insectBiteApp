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

// ✅ API ดึงข้อมูลวิเคราะห์สำหรับผู้เชี่ยวชาญ
app.get('/api/expert/analysis', async (req, res) => {
    const { expert_id } = req.query;

    if (!expert_id) {
        return res.status(400).json({ error: 'Missing expert_id parameter' });
    }

    try {
        const result = await pool.query(
            `SELECT ia.upload_id, 
                    ia.insect_type, 
                    COALESCE(AVG(ia.confidence), 0) AS avg_confidence
             FROM image_analysis ia
             LEFT JOIN expert_votes ev 
             ON ia.upload_id = ev.image_id AND ev.expert_id = $1
             WHERE ev.expert_id IS NULL
             GROUP BY ia.upload_id, ia.insect_type
             ORDER BY avg_confidence DESC`, 
            [expert_id]
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

// ✅ API ดึงรูปภาพสำหรับผู้เชี่ยวชาญ
app.get('/api/expert/images', async (req, res) => {
    try {
        const images = await getImageData();
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching images' });
    }
});

app.use('/api', voteRoutes);

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
