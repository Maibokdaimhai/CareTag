import axios from 'axios';

const instance = axios.create({
    // ใช้ค่าจาก .env ของ Vite หรือเลือกตามโหมด
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

export default instance;