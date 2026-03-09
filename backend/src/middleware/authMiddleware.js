const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. ดึง Token จาก Header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    // 2. ใช้ Supabase ตรวจสอบว่า Token นี้ยังใช้งานได้และเป็นของใคร
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // 3. ฝากข้อมูล user ไว้ใน req เพื่อให้ Controller นำไปใช้ต่อ
    req.user = user;
    next(); // ผ่านด่านไปทำงานที่ Controller ต่อได้
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;