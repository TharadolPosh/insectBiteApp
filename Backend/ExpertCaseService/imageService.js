const { Pool } = require('pg');
const pool = new Pool({
    user: "usercs",
    host: "localhost",
    database: "InsectPlatformDB",
    password: "password", // 🔥 Hardcode ค่าพาสเวิร์ด
    port: 5432,
});

const getImageData = async () => {
    try {
        const result = await pool.query(
            `SELECT id AS upload_id, 
                    image_url 
             FROM upload_image`
        );

        console.log("📸 Raw Data from DB:", result.rows); // ตรวจสอบข้อมูลที่ดึงจาก DB

        return result.rows.map(row => ({
            upload_id: row.upload_id,
            image_url: row.image_url && row.image_url.startsWith('http') 
                ? row.image_url 
                : `http://172.20.10.14:5001${row.image_url}`
        }));
    } catch (error) {
        console.error('❌ Error fetching image data:', error);
        throw error;
    }
};

module.exports = { getImageData };
