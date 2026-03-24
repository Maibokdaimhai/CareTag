import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // เรียก API ไปยัง Backend
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      
      // เก็บ Token และข้อมูลผู้ใช้ลงใน LocalStorage
      localStorage.setItem('token', res.data.session.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('ยินดีต้อนรับเข้าสู่ระบบ!');
      navigate('/dashboard'); // ล็อกอินสำเร็จให้ไปหน้าหลัก
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้ยืนยันอีเมล');
    } finally {
      setLoading(false);
    }
  };
  
  const validateLogin = () => {
    if (!email || !password) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return false;
    }
    return true;
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">CareTag Login</h2>
          <p className="text-green-100 mt-2 font-light">เข้าสู่ระบบเพื่อดูแลผู้สูงอายุของคุณ</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">อีเมลผู้ใช้งาน</label>
            <input 
              type="email" 
              required
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition shadow-sm"
              placeholder="example@mail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">รหัสผ่าน</label>
            <input 
              type="password" 
              required
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition shadow-sm"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-500 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              จดจำฉันไว้
            </label>
            <a href="/forgot-password" size="sm" className="text-green-600 font-semibold hover:underline">ลืมรหัสผ่าน?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-green-100 transition-all transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}
          </button>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              ยังไม่มีบัญชีสมาชิก? 
              <Link to="/register" className="text-green-600 font-bold hover:underline">
                ลงทะเบียนที่นี่
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;