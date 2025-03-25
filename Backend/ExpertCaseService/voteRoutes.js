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

// บันทึกการโหวตของผู้เชี่ยวชาญ
router.post('/expert/vote', async (req, res) => {
    const { image_id, expert_id, chosen_insect, expert_comment } = req.body;
    
    console.log("📩 Data received:", req.body); // ✅ ตรวจสอบค่าที่ถูกส่งมา

    try {
        if (!image_id || !expert_id || !chosen_insect) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
        }

        const existingVote = await pool.query(
            `SELECT * FROM expert_votes WHERE image_id = $1 AND expert_id = $2`,
            [image_id, expert_id]
        );

        if (existingVote.rows.length > 0) {
            return res.status(400).json({ message: "คุณได้โหวตรูปนี้ไปแล้ว" });
        }

        await pool.query(
            `INSERT INTO expert_votes (image_id, expert_id, chosen_insect, expert_comment) 
             VALUES ($1, $2, $3, $4)`,
            [image_id, expert_id, chosen_insect, expert_comment]
        );

        res.json({ message: "โหวตสำเร็จ" });
    } catch (error) {
        console.error('❌ Error saving expert vote:', error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
});

// ดึงข้อมูลภาพที่ยังไม่ได้โหวตโดยผู้เชี่ยวชาญ
router.get('/expert/analysis', async (req, res) => {
    const { expert_id } = req.query;

    try {
        const result = await pool.query(
            `SELECT ui.id AS upload_id, ui.image_url, 
                    ca.insect_type, ca.avg_confidence
             FROM upload_image ui
             LEFT JOIN expert_votes ev 
             ON ui.id = ev.image_id AND ev.expert_id = $1
             LEFT JOIN classification_analysis ca 
             ON ui.id = ca.upload_id
             WHERE ev.image_id IS NULL`,
            [expert_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching expert analysis data:', error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
    }
});
// ✅ ดึงจำนวนการโหวตของแมลงแต่ละชนิดสำหรับแต่ละรูป
router.get('/expert/vote_counts', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT image_id, chosen_insect, COUNT(*) AS vote_count
            FROM crowdsourcing_votes
            GROUP BY image_id, chosen_insect
        `);

        // แปลงข้อมูลเป็น Map { image_id: { insect_name: vote_count } }
        const voteMap = {};
        result.rows.forEach(row => {
            if (!voteMap[row.image_id]) {
                voteMap[row.image_id] = {};
            }
            voteMap[row.image_id][row.chosen_insect] = row.vote_count;
        });

        res.json(voteMap);
    } catch (error) {
        console.error('Error fetching vote counts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;