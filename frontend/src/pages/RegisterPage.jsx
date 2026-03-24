import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import liff from '@line/liff';


const RegisterPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isLiffInitializing, setIsLiffInitializing] = useState(true);
  const [liffError, setLiffError] = useState('');
  const [friendshipChecked, setFriendshipChecked] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const addFriendUrl =
    import.meta.env.VITE_LINE_NOTIFY_ADD_FRIEND_URL ||
    'https://line.me/R/ti/p/%40yourOAid';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    p_fullname: '',
    phone1: '',
    phone2: '',
    line_user_id: '',
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
    medical_rights: '',
  });

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = import.meta.env.VITE_LIFF_ID;

        if (!liffId) {
          setLiffError('ไม่พบ LIFF ID');
          setIsLiffInitializing(false);
          return;
        }

        await liff.init({ liffId });

        const urlParams = new URLSearchParams(window.location.search);
        const hasCallbackParams =
          urlParams.has('code') ||
          urlParams.has('state') ||
          urlParams.has('liff.state');

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();

          setFormData((prev) => ({
            ...prev,
            line_user_id: profile.userId,
            p_fullname: prev.p_fullname || profile.displayName || '',
          }));

          try {
            const friendship = await liff.getFriendship();
            setIsFriend(!!friendship.friendFlag);
          } catch (friendErr) {
            console.error('getFriendship failed:', friendErr);
            setIsFriend(false);
          } finally {
            setFriendshipChecked(true);
          }
        } else if (!hasCallbackParams) {
          liff.login({
            redirectUri: `${window.location.origin}/register`,
          });
          return;
        } else {
          setLiffError('ไม่สามารถเข้าสู่ระบบ LINE ได้ กรุณาลองใหม่อีกครั้ง');
        }
      } catch (err) {
        console.error('LIFF Init failed', err);
        setLiffError('เชื่อมต่อ LINE ไม่สำเร็จ');
      } finally {
        setIsLiffInitializing(false);
      }
    };

    initLiff();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.line_user_id) {
      alert('ไม่พบข้อมูล LINE กรุณาเปิดผ่าน LIFF แล้วลองใหม่');
      return false;
    }

    if (!formData.email || !formData.password) {
      alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return false;
    }

    if (formData.password.length < 6) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    if (!formData.p_fullname) {
      alert('กรุณากรอกชื่อ-นามสกุลผู้ดูแล');
      return false;
    }

    if (!formData.phone1) {
      alert('กรุณากรอกเบอร์โทรหลัก');
      return false;
    }

    if (!formData.elder_fname || !formData.elder_sname) {
      alert('กรุณากรอกชื่อและนามสกุลผู้สูงอายุ');
      return false;
    }

    return true;
  };

  const goToAddFriend = () => {
    window.location.href = addFriendUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        email: formData.email.trim(),
        p_fullname: formData.p_fullname.trim(),
        phone1: formData.phone1.trim(),
        phone2: formData.phone2.trim(),
        relation: formData.relation.trim(),
        address: formData.address.trim(),
        province: formData.province.trim(),
        postal_code: formData.postal_code.trim(),
        elder_fname: formData.elder_fname.trim(),
        elder_mname: formData.elder_mname.trim(),
        elder_sname: formData.elder_sname.trim(),
        chronic_diseases: formData.chronic_diseases.trim(),
        allergies: formData.allergies.trim(),
        medical_rights: formData.medical_rights.trim(),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        payload
      );

      alert(res.data.message || 'ลงทะเบียนสำเร็จ');

      let latestFriendFlag = isFriend;

      try {
        const friendship = await liff.getFriendship();
        latestFriendFlag = !!friendship.friendFlag;
        setIsFriend(latestFriendFlag);
      } catch (friendErr) {
        console.error('re-check friendship failed:', friendErr);
      }

      if (!latestFriendFlag) {
        const shouldAddFriend = window.confirm(
          'ลงทะเบียนสำเร็จแล้ว\n\nต้องการเพิ่มเพื่อน LINE CareTag Notify เพื่อรับการแจ้งเตือนหรือไม่'
        );

        if (shouldAddFriend) {
          goToAddFriend();
          return;
        }
      }

      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm';
  const labelClass =
    'block text-xs font-bold text-gray-500 uppercase mb-1 mt-4 tracking-wide';

  if (isLiffInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">กำลังเชื่อมต่อ LINE...</p>
        </div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-3">เชื่อมต่อ LINE ไม่สำเร็จ</h2>
          <p className="text-gray-600 mb-6">{liffError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white text-center">
          <h2 className="text-3xl font-extrabold">✨ ลงทะเบียนสมาชิก CareTag</h2>
          <p className="mt-2 text-green-100">
            ผูกบัญชี LINE อัตโนมัติเพื่อรับการแจ้งเตือนพิกัด
          </p>
        </div>

        <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="space-y-2">
            <div className="flex items-center space-x-2 mb-6 border-b-2 border-green-100 pb-2">
              <span className="text-2xl">🏠</span>
              <h3 className="text-xl font-bold text-green-700">ข้อมูลส่วนตัวผู้ดูแล</h3>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
              <p className="text-xs text-green-300 font-bold"><FaCheck size={12} color='white'/> เชื่อมต่อ LINE สำเร็จ</p>
              <p className="text-[10px] text-green-600 truncate">
                ID: {formData.line_user_id || 'กำลังดึงข้อมูล...'}
              </p>
            </div>

            {friendshipChecked && !isFriend && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                <p className="text-xs text-yellow-700 font-bold">
                  ⚠️ ยังไม่ได้เพิ่มเพื่อน CareTag Notify
                </p>
                <p className="text-[11px] text-yellow-700 mt-1">
                  แนะนำให้เพิ่มเพื่อนเพื่อรับการแจ้งเตือนหลังลงทะเบียนเสร็จ
                </p>
                <button
                  type="button"
                  onClick={goToAddFriend}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
                >
                  เพิ่มเพื่อน CareTag Notify
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>อีเมล *</label>
                <input
                  name="email"
                  placeholder="example@gmail.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>รหัสผ่าน *</label>
                <input
                  name="password"
                  placeholder="อย่างต่ำ 6 ตัวอักษร"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ชื่อ-นามสกุลจริง *</label>
                <input
                  name="p_fullname"
                  placeholder="John Doe"
                  value={formData.p_fullname}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>ความสัมพันธ์</label>
                <input
                  name="relation"
                  placeholder="เช่น ลูก หลาน"
                  value={formData.relation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>เบอร์โทรหลัก *</label>
                <input
                  name="phone1"
                  placeholder="08xxxxxxxx"
                  value={formData.phone1}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>เบอร์สำรอง</label>
                <input
                  name="phone2"
                  value={formData.phone2}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <label className={labelClass}>ที่อยู่ปัจจุบัน</label>
            <textarea
              name="address"
              placeholder="ที่อยู่"
              value={formData.address}
              onChange={handleChange}
              className={`${inputClass} h-24 resize-none`}
            ></textarea>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>จังหวัด</label>
                <input
                  name="province"
                  placeholder="กรุงเทพฯ"
                  value={formData.province}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>รหัสไปรษณีย์</label>
                <input
                  name="postal_code"
                  placeholder="10000"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center space-x-2 mb-6 border-b-2 border-blue-100 pb-2">
              <span className="text-2xl">👵</span>
              <h3 className="text-xl font-bold text-blue-700">ข้อมูลผู้สูงอายุในดูแล</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>ชื่อ *</label>
                <input
                  name="elder_fname"
                  placeholder="ชื่อ"
                  value={formData.elder_fname}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>ชื่อกลาง</label>
                <input
                  name="elder_mname"
                  placeholder="ถ้ามี"
                  value={formData.elder_mname}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>นามสกุล *</label>
                <input
                  name="elder_sname"
                  placeholder="นามสกุล"
                  value={formData.elder_sname}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>กรุ๊ปเลือด</label>
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="O">Group O</option>
                  <option value="AB">Group AB</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>สิทธิการรักษา</label>
                <input
                  name="medical_rights"
                  placeholder="เช่น บัตรทอง"
                  value={formData.medical_rights}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <label className={labelClass}>โรคประจำตัว</label>
            <input
              name="chronic_diseases"
              placeholder="ระบุโรคประจำตัวทั้งหมด"
              value={formData.chronic_diseases}
              onChange={handleChange}
              className={inputClass}
            />

            <label className={labelClass}>ประวัติการแพ้ยา/อาหาร</label>
            <textarea
              name="allergies"
              placeholder="ระบุสิ่งที่แพ้และอาการ"
              value={formData.allergies}
              onChange={handleChange}
              className={`${inputClass} h-24 resize-none`}
            ></textarea>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 leading-relaxed">
                * ข้อมูลสุขภาพจะถูกนำไปใช้ในกรณีฉุกเฉินเมื่อมีการสแกน Tag
                เพื่อให้เจ้าหน้าที่หรือผู้ช่วยเหลือปฐมพยาบาลได้อย่างถูกต้อง
              </p>
            </div>
          </section>
        </div>

        <div className="p-8 bg-slate-50 border-t flex flex-col items-center">
          <button
            type="submit"
            disabled={loading || !formData.line_user_id}
            className={`w-full md:w-2/3 py-4 rounded-2xl shadow-lg font-bold text-lg text-white transition-all transform active:scale-95 ${
              loading || !formData.line_user_id
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : '✅ ยืนยันการลงทะเบียนทั้งหมด'}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            มีบัญชีผู้ใช้งานแล้ว?{' '}
            <a href="/login" className="text-green-600 font-bold hover:underline">
              เข้าสู่ระบบที่นี่
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;