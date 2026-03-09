import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจสอบว่ามี Session จากลิงก์อีเมลหรือไม่
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("เข้าสู่โหมดกู้คืนรหัสผ่านสำเร็จ");
      } else if (!session) {
        setMessage('❌ Auth session missing! โปรดเข้าผ่านลิงก์ในอีเมลเท่านั้น');
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setMessage('❌ รหัสผ่านไม่ตรงกัน');
    if (newPassword.length < 6) return setMessage('❌ รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร');

    setLoading(true);
    try {
      // วิธีที่ชัวร์ที่สุด: อัปเดตผ่าน supabase-js ที่ frontend โดยตรง
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      setMessage('✅ อัปเดตรหัสผ่านสำเร็จ! กำลังไปหน้า Login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage('❌ ' + (err.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">🔒 ตั้งรหัสผ่านใหม่</h2>
        
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">รหัสผ่านใหม่</label>
            <input 
              type="password" required placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full p-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
              onChange={(e) => setNewPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input 
              type="password" required placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full p-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยันการเปลี่ยนรหัสผ่าน'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;