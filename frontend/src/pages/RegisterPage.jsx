import React, { useState, useEffect } from 'react'; // 1. เพิ่ม useEffect
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import liff from '@line/liff'; // 2. Import liff

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    p_fullname: '',
    phone1: '',
    phone2: '',
    line_user_id: '', // 3. เปลี่ยนจาก line_id เป็น line_user_id ให้ตรงกับ Database
    relation: '',
    address: '',
    province: '',
    postal_code: '',
    elder_fname: '',
    elder_mname: '',
    elder_sname: '',
    blood_type: 'A',
    chronic_diseases: '',
    allergies: '',
    medical_rights: ''
  });

  // 4. ส่วนดึง LINE User ID อัตโนมัติ
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: import.meta.env.VITE_LIFF_ID }); // ใช้ ID จาก Vercel Env
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          // บันทึก ID ลงใน formData ทันที
          setFormData(prev => ({ ...prev, line_user_id: profile.userId }));
        } else {
          // ถ้าเปิดผ่าน Browser อื่น ให้บังคับ Login LINE ก่อนสมัคร
          liff.login();
        }
      } catch (err) {
        console.error("LIFF Initialization failed", err);
      }
    };
    initLiff();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check ก่อนส่งว่าได้ ID มาหรือยัง
    if (!formData.line_user_id) {
        alert("ไม่พบข้อมูล LINE กรุณาลองใหม่อีกครั้ง");
        return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, formData);
      alert(res.data.message || 'ลงทะเบียนสำเร็จ!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1 mt-4 tracking-wide";

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white text-center">
          <h2 className="text-3xl font-extrabold">✨ ลงทะเบียนสมาชิก CareTag</h2>
          <p className="mt-2 text-green-100">ผูกบัญชี LINE อัตโนมัติเพื่อรับการแจ้งเตือนพิกัด</p>
        </div>

        <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="space-y-2">
            <div className="flex items-center space-x-2 mb-6 border-b-2 border-green-100 pb-2">
              <span className="text-2xl">🏠</span>
              <h3 className="text-xl font-bold text-green-700">ข้อมูลส่วนตัวผู้ดูแล</h3>
            </div>

            {/* แสดงสถานะ LINE ID ที่ดึงมาได้ (เพื่อให้ผู้ใช้มั่นใจ) */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
               <p className="text-xs text-green-700 font-bold">✅ เชื่อมต่อ LINE สำเร็จ</p>
               <p className="text-[10px] text-green-600 truncate">ID: {formData.line_user_id || 'กำลังดึงข้อมูล...'}</p>
            </div>

            {/* Email/Password Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>อีเมล *</label>
                <input name="email" type="email" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>รหัสผ่าน *</label>
                <input name="password" type="password" onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ชื่อ-นามสกุลจริง *</label>
                <input name="p_fullname" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>ความสัมพันธ์</label>
                <input name="relation" onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>เบอร์โทรหลัก *</label>
                <input name="phone1" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>เบอร์สำรอง</label>
                <input name="phone2" onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* ส่วน Address เหมือนเดิม... */}
            <label className={labelClass}>ที่อยู่ปัจจุบัน</label>
            <textarea name="address" onChange={handleChange} className={`${inputClass} h-24 resize-none`}></textarea>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>จังหวัด</label>
                <input name="province" onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>รหัสไปรษณีย์</label>
                <input name="postal_code" onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Section 2: ข้อมูลผู้สูงอายุ (เหมือนเดิม) */}
          <section className="space-y-2">
             {/* ... ข้อมูลผู้สูงอายุที่คุณเขียนไว้ ... */}
             <div className="flex items-center space-x-2 mb-6 border-b-2 border-blue-100 pb-2">
               <span className="text-2xl">👵</span>
               <h3 className="text-xl font-bold text-blue-700">ข้อมูลผู้สูงอายุ</h3>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <input name="elder_fname" placeholder="ชื่อ" onChange={handleChange} className={inputClass} required />
               <input name="elder_sname" placeholder="นามสกุล" onChange={handleChange} className={inputClass} required />
             </div>
             {/* [คงโค้ดส่วน Elders เดิมไว้] */}
          </section>
        </div>

        <div className="p-8 bg-slate-50 border-t flex flex-col items-center">
          <button type="submit" disabled={loading || !formData.line_user_id} className={`w-full md:w-2/3 py-4 rounded-2xl shadow-lg font-bold text-lg text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
            {loading ? 'กำลังบันทึกข้อมูล...' : '✅ ยืนยันการลงทะเบียนทั้งหมด'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;