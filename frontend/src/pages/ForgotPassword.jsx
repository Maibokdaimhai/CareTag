import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { email });
      setMessage('✅ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว โปรดตรวจสอบกล่องจดหมาย');
    } catch (err) {
      console.error(err);
      setMessage('❌ ' + (err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งอีเมล'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">ลืมรหัสผ่าน?</h2>
          <p className="text-gray-500 mt-2 text-sm">ไม่ต้องกังวล! กรอกอีเมลที่คุณใช้สมัครสมาชิกเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">อีเมลที่ใช้สมัคร</label>
            <input 
              type="email" 
              placeholder="example@mail.com" 
              required 
              className="w-full p-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition shadow-sm"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}
          >
            {loading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-green-600 hover:text-green-700 transition"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;