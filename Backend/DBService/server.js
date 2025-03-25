const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// 🟢 Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors()); // เปิดใช้งาน CORS

const pool = new Pool({
  user: 'usercs',
  host: 'localhost',
  database: 'InsectPlatformDB',
  password: 'password',
  port: '5432',
});

// 🟢 ดึงข้อมูลแมลงทั้งหมด
app.get("/insect_bites", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        name_eng, 
        description,
        first_aid_method,
        symptom_description, 
        ENCODE(image, 'base64') AS image, 
        ENCODE(wound_image, 'base64') AS wound_image 
      FROM insect_bites
    `);
    console.log("Fetched insect data:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching insect data:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลแมลงได้" });
  }
});

// 🟢 เพิ่มข้อมูลแมลงใหม่
app.post("/insect_bites", async (req, res) => {
  console.log("Received request body:", req.body);

  const { name, name_eng, description, symptom_description, first_aid_method, image, wound_image } = req.body;

  if (!name || !description || !symptom_description) {
    return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO insect_bites (name, name_eng, description, symptom_description, first_aid_method, image, wound_image) 
       VALUES ($1, $2, $3, $4, $5, DECODE($6, 'base64'), DECODE($7, 'base64')) RETURNING *`, 
      [name, name_eng, description, symptom_description, first_aid_method, image?.split(',')[1], wound_image?.split(',')[1]]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting insect data:", err);
    res.status(500).json({ error: "ไม่สามารถเพิ่มข้อมูลแมลงได้" });
  }
});

// 🟢 แก้ไขข้อมูลแมลง
app.put("/insect_bites/:id", async (req, res) => {
  console.log("Received Update Request:", req.body); // ✅ Log request body
  const { id } = req.params;
  const { name, name_eng, description, symptom_description, first_aid_method, image, wound_image } = req.body;

  try {
    const result = await pool.query(
      `UPDATE insect_bites 
       SET name = $1, name_eng = $2, description = $3, symptom_description = $4, first_aid_method = $5, 
           image = DECODE($6, 'base64'), wound_image = DECODE($7, 'base64') 
       WHERE id = $8 RETURNING *`,
      [name, name_eng, description, symptom_description, first_aid_method, image?.split(',')[1], wound_image?.split(',')[1], id]
    );

    console.log("Updated Row:", result.rows); // ✅ Log response ก่อนส่งกลับ

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลแมลงที่ต้องการแก้ไข" });
    }

    res.json(result.rows[0]); // ✅ ต้องแน่ใจว่าส่ง JSON กลับ
  } catch (err) {
    console.error("Error updating insect data:", err);
    res.status(500).json({ error: "ไม่สามารถแก้ไขข้อมูลแมลงได้" }); // ✅ ควรส่ง JSON เสมอ
  }
});


// 🟢 ลบข้อมูลแมลง
app.delete("/insect_bites/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM insect_bites WHERE id = $1 RETURNING *`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลแมลงที่ต้องการลบ" });
    }

    res.json({ message: "ลบข้อมูลแมลงสำเร็จ", deleted: result.rows[0] });
  } catch (err) {
    console.error("Error deleting insect data:", err);
    res.status(500).json({ error: "ไม่สามารถลบข้อมูลแมลงได้" });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
});
