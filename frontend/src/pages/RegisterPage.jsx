import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 1. กำหนด State ให้ครบทุก Attributes ตาม Schema
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    p_fullname: '',
    phone1: '',
    phone2: '',
    line_id: '',
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

  // 2. ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลใน Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. ฟังก์ชันส่งข้อมูลไปยัง Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, formData);
      alert(res.data.message || 'ลงทะเบียนสำเร็จ!');
      navigate('/login'); // เมื่อสำเร็จให้ไปหน้า Login
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  // Tailwind Utility Classes
  const inputClass = "w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-sm shadow-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1 mt-4 tracking-wide";

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header ส่วนหัว */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white text-center">
          <h2 className="text-3xl font-extrabold">✨ ลงทะเบียนสมาชิก CareTag</h2>
          <p className="mt-2 text-green-100 opacity-90">กรอกข้อมูลผู้ดูแลและผู้สูงอายุเพื่อเริ่มต้นระบบช่วยเหลือ</p>
        </div>

        <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Section 1: ข้อมูลผู้ดูแล (Profiles Table) */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 mb-6 border-b-2 border-green-100 pb-2">
              <span className="text-2xl">🏠</span>
              <h3 className="text-xl font-bold text-green-700">ข้อมูลส่วนตัวผู้ดูแล</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>อีเมล *</label>
                <input name="email" type="email" placeholder="example@mail.com" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>รหัสผ่าน *</label>
                <input name="password" type="password" placeholder="รหัสผ่าน 6 ตัวขึ้นไป" onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ชื่อ-นามสกุลจริง *</label>
                <input name="p_fullname" placeholder="นาย สมชาย ใจดี" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>ความสัมพันธ์</label>
                <input name="relation" placeholder="เช่น ลูก, หลาน, ผู้ช่วย" onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className={labelClass}>เบอร์โทรหลัก *</label>
                <input name="phone1" placeholder="08xxxxxxxx" onChange={handleChange} className={inputClass} required />
              </div>
              <div className="col-span-1">
                <label className={labelClass}>เบอร์สำรอง</label>
                <input name="phone2" placeholder="ถ้ามี" onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-1">
                <label className={labelClass}>Line ID</label>
                <input name="line_id" placeholder="@id" onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <label className={labelClass}>ที่อยู่ปัจจุบัน</label>
            <textarea name="address" placeholder="บ้านเลขที่, ถนน, ตำบล/แขวง" onChange={handleChange} className={`${inputClass} h-24 resize-none`}></textarea>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>จังหวัด</label>
                <input name="province" placeholder="กรุงเทพฯ" onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>รหัสไปรษณีย์</label>
                <input name="postal_code" placeholder="10xxx" onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Section 2: ข้อมูลผู้สูงอายุ (Elders Table) */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 mb-6 border-b-2 border-blue-100 pb-2">
              <span className="text-2xl">👵</span>
              <h3 className="text-xl font-bold text-blue-700">ข้อมูลผู้สูงอายุในดูแล</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>ชื่อ *</label>
                <input name="elder_fname" placeholder="ชื่อ" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>ชื่อกลาง</label>
                <input name="elder_mname" placeholder="ถ้ามี" onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>นามสกุล *</label>
                <input name="elder_sname" placeholder="นามสกุล" onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>กรุ๊ปเลือด</label>
                <select name="blood_type" onChange={handleChange} className={inputClass}>
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="O">Group O</option>
                  <option value="AB">Group AB</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>สิทธิการรักษา</label>
                <input name="medical_rights" placeholder="เช่น บัตรทอง" onChange={handleChange} className={inputClass} />
              </div>
            </div>
            
            <label className={labelClass}>โรคประจำตัว</label>
            <input name="chronic_diseases" placeholder="ระบุโรคประจำตัวทั้งหมด" onChange={handleChange} className={inputClass} />
            
            <label className={labelClass}>ประวัติการแพ้ยา/อาหาร</label>
            <textarea name="allergies" placeholder="ระบุสิ่งที่แพ้และอาการ" onChange={handleChange} className={`${inputClass} h-24 resize-none`}></textarea>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 leading-relaxed">
                * ข้อมูลสุขภาพจะถูกนำไปใช้ในกรณีฉุกเฉินเมื่อมีการสแกน Tag เพื่อให้เจ้าหน้าที่หรือผู้ช่วยเหลือปฐมพยาบาลได้อย่างถูกต้อง
              </p>
            </div>
          </section>
        </div>

        {/* Footer Action ปุ่มกดยืนยัน */}
        <div className="p-8 bg-slate-50 border-t flex flex-col items-center">
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full md:w-2/3 py-4 rounded-2xl shadow-lg font-bold text-lg text-white transition-all transform active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : '✅ ยืนยันการลงทะเบียนทั้งหมด'}
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            มีบัญชีผู้ใช้งานแล้ว? <a href="/login" className="text-green-600 font-bold hover:underline">เข้าสู่ระบบที่นี่</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;