require('dotenv').config(); // 1. โหลดไฟล์ .env
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 2. ตั้งค่า CORS ให้ยืดหยุ่น
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // อนุญาตเฉพาะหน้าบ้านเรา
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); 

// Test Route (สำหรับเช็คว่า Server ยังไม่หลับ)
app.get('/', (req, res) => res.send('CareTag API is running...'));

// 3. ใช้ Port จาก Environment Variable ที่ Render กำหนดมาให้
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});