require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const os = require("os");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const port = process.env.PORT || 5001;

// อนุญาตให้เข้าถึงจากทุกที่ (CORS)
app.use(cors());

// เชื่อมต่อฐานข้อมูล PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// กำหนดโฟลเดอร์สำหรับอัปโหลด
const uploadDir = path.join(__dirname, process.env.UPLOADS_DIR || "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({ storage });

// 📌 API: อัปโหลดรูปภาพและวิเคราะห์ด้วย YOLO
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์รูปภาพ" });
    }

    const { fingerprint } = req.body;
    if (!fingerprint) {
      return res.status(400).json({ error: "ไม่มีข้อมูล fingerprint" });
    }

    // ตรวจสอบ fingerprint
    const fingerprintCheck = await pool.query(
      "SELECT * FROM devicefingerprints WHERE fingerprint = $1",
      [fingerprint]
    );

    if (fingerprintCheck.rows.length === 0) {
      return res.status(400).json({ error: "ไม่พบ fingerprint นี้ในระบบ" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // บันทึกลง PostgreSQL
    const uploadResult = await pool.query(
      `INSERT INTO upload_image (image_url, image_path, fingerprint, status) 
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [imageUrl, req.file.path, fingerprint]
    );

    const uploadData = uploadResult.rows[0];

    // 🔥 ส่งรูปไปยัง FastAPI เพื่อวิเคราะห์
    const fastAPIUrl = "http://172.20.10.14:4000/predict/predict/";
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    const fastApiResponse = await axios.post(fastAPIUrl, formData, {
      headers: { ...formData.getHeaders() },
    });

    const analysisData = fastApiResponse.data.data; // รับผลลัพธ์จาก YOLO

    // บันทึกผลการวิเคราะห์ลง PostgreSQL
    for (const item of analysisData) {
      if (item.insect_type) {
        await pool.query(
          `INSERT INTO image_analysis (upload_id, insect_type, confidence, x_min, y_min, x_max, y_max) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uploadData.id, item.insect_type, item.confidence, item.box.x_min, item.box.y_min, item.box.x_max, item.box.y_max]
        );
      }
    }

    res.json({ 
        message: "อัปโหลดและวิเคราะห์สำเร็จ!", 
        uploadData: { id: uploadData.id, image_url: imageUrl }, 
        analysisData 
      });
      
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปโหลดและวิเคราะห์" });
  }
});

// 📌 API: ดึงรายการรูปที่อัปโหลด
app.get("/images", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM upload_image ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลรูปภาพได้" });
  }
});

// 📌 API: ให้เซิร์ฟเวอร์สามารถแสดงไฟล์รูป
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ฟังก์ชันดึง IP ของเครื่องเซิร์ฟเวอร์
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// เปิดเซิร์ฟเวอร์ให้เข้าถึงได้จากภายนอก
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://${getLocalIP()}:${port}`);
});
