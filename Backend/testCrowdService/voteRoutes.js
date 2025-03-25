const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    user: process.env.DB_USER || "usercs",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "InsectPlatformDB",
    password: process.env.DB_PASSWORD || "password",
    port: process.env.DB_PORT || 5432,
});

// บันทึกการโหวต
router.post('/vote', async (req, res) => {
    const { image_id, user_fingerprint, chosen_insect, user_comment } = req.body;
    
    console.log("📩 Data received:", req.body); // ✅ ตรวจสอบค่าที่ถูกส่งมา

    try {
        if (!image_id || !user_fingerprint || !chosen_insect) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
        }

        const existingVote = await pool.query(
            `SELECT * FROM crowdsourcing_votes WHERE image_id = $1 AND user_fingerprint = $2`,
            [image_id, user_fingerprint]
        );

        if (existingVote.rows.length > 0) {
            return res.status(400).json({ message: "คุณได้โหวตรูปนี้ไปแล้ว" });
        }

        await pool.query(
            `INSERT INTO crowdsourcing_votes (image_id, user_fingerprint, chosen_insect, user_comment) 
             VALUES ($1, $2, $3, $4)`,
            [image_id, user_fingerprint, chosen_insect, user_comment]
        );

        res.json({ message: "โหวตสำเร็จ" });
    } catch (error) {
        console.error('❌ Error saving vote:', error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
});


// ดึงข้อมูลภาพที่ยังไม่ได้โหวต
router.get('/analysis', async (req, res) => {
    const { fingerprint } = req.query;

    try {
        const result = await pool.query(
            `SELECT ui.id AS upload_id, ui.image_url, 
                    ca.insect_type, ca.avg_confidence
             FROM upload_image ui
             LEFT JOIN crowdsourcing_votes cv 
             ON ui.id = cv.image_id AND cv.user_fingerprint = $1
             LEFT JOIN classification_analysis ca 
             ON ui.id = ca.upload_id
             WHERE cv.image_id IS NULL`,
            [fingerprint]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching analysis data:', error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
    }
});

module.exports = router;
