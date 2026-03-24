import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const thaiProvinces = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", 
  "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", 
  "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", 
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", 
  "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", 
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", 
  "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", 
  "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State สำหรับการแก้ไขโปรไฟล์ผู้ดูแล
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // State สำหรับ Modal เพิ่มผู้สูงอายุ
  const [isAddingElder, setIsAddingElder] = useState(false);
  const [newElder, setNewElder] = useState({
    elder_fname: '', elder_mname: '', elder_sname: '', 
    blood_type: 'A', chronic_diseases: '', allergies: '', medical_rights: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const startEditing = () => {
    setEditForm({
      p_fullname: data.profile.p_fullname || '',
      phone1: data.profile.phone1 || '',
      phone2: data.profile.phone2 || '',
      relation: data.profile.relation || '',
      address: data.profile.address || '',
      province: data.profile.province || '',
      postal_code: data.profile.postal_code || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('บันทึกข้อมูลโปรไฟล์สำเร็จ');
      setIsEditing(false);
      fetchData(); 
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleAddElder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/add-elder`, newElder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('เพิ่มข้อมูลผู้สูงอายุสำเร็จ');
      setIsAddingElder(false);
      setNewElder({ elder_fname: '', elder_sname: '', blood_type: 'A', chronic_diseases: '', allergies: '', medical_rights: '' });
      fetchData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
  };

  const handleDeleteElder = async (elderId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้สูงอายุท่านนี้?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/delete-elder/${elderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('ลบข้อมูลเรียบร้อยแล้ว');
      fetchData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleGenerateTag = async (elderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/generate-tag`, 
        { elder_id: elderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('สร้าง QR Code สำเร็จ!');
      fetchData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Tag');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600 font-bold animate-pulse">
      กำลังโหลดข้อมูล CareTag...
    </div>
  );

return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">ยินดีต้อนรับ, {data?.profile?.p_fullname}</h1>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition cursor-pointer">ออกจากระบบ</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =========================================
              ส่วนที่ 1: ข้อมูลผู้ดูแล
          ========================================= */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🏠 ข้อมูลผู้ดูแล</h2>
              {!isEditing ? (
                <button 
                  onClick={startEditing} 
                  className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer hover:bg-blue-100 transition shadow-sm"
                >
                  ✏️ แก้ไข
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md cursor-pointer hover:bg-green-700">บันทึก</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">ยกเลิก</button>
                </div>
              )}
            </div>

            <div className="space-y-4 text-gray-600">
              <div className="flex justify-between border-b pb-2 text-sm italic text-gray-400">
                <strong>อีเมล (ID):</strong> <span>{data?.profile?.email}</span>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อ-นามสกุล</label>
                    <input className="w-full border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="ชื่อ-นามสกุล" value={editForm.p_fullname} onChange={e => setEditForm({...editForm, p_fullname: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">เบอร์โทรหลัก</label>
                      <input className="w-full border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="เบอร์โทรหลัก" value={editForm.phone1} onChange={e => setEditForm({...editForm, phone1: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">ความสัมพันธ์</label>
                      <input className="w-full border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="เช่น ลูก, หลาน" value={editForm.relation} onChange={e => setEditForm({...editForm, relation: e.target.value})} />
                    </div>
                  </div>
                  
                  {/* แยกส่วน ที่อยู่ และ จังหวัด อย่างชัดเจน */}
                  <div className="space-y-1 mt-2 border-t pt-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ที่อยู่ (เลขที่, หมู่, ซอย, ถนน, ตำบล, อำเภอ)</label>
                    <textarea className="w-full border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 h-16 resize-none" placeholder="กรอกรายละเอียดที่อยู่" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">จังหวัด</label>
                    <select 
                      className="w-full border p-2 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-green-500 cursor-pointer" 
                      value={editForm.province} 
                      onChange={e => setEditForm({...editForm, province: e.target.value})}
                    >
                      <option value="">-- เลือกจังหวัด --</option>
                      {thaiProvinces.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="flex justify-between border-b pb-2"><strong>ชื่อ:</strong> <span>{data?.profile?.p_fullname}</span></p>
                  <p className="flex justify-between border-b pb-2"><strong>เบอร์โทร:</strong> <span>{data?.profile?.phone1}</span></p>
                  <p className="flex justify-between border-b pb-2"><strong>ความสัมพันธ์:</strong> <span>{data?.profile?.relation || '-'}</span></p>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase">ที่อยู่ปัจจุบัน:</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-xl mt-1">
                      {data?.profile?.address ? `${data.profile.address} ` : 'ไม่ระบุรายละเอียดที่อยู่ '} 
                      {data?.profile?.province ? `จ.${data.profile.province}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =========================================
              ส่วนที่ 2: รายการผู้สูงอายุ
          ========================================= */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">👵 ผู้สูงอายุในความดูแล</h2>
              <button 
                onClick={() => setIsAddingElder(true)} 
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition cursor-pointer flex items-center gap-2"
              >
                ➕ เพิ่มคนใหม่1
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {data?.elders?.length > 0 ? (
                data.elders.map((elder) => (
                  // ใส่ relative และเพิ่ม pt-12 เพื่อเว้นที่ให้ปุ่มลบด้านบน
                  <div key={elder.elder_id} className="relative bg-white p-6 pt-12 md:pt-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                    
                    {/* 🔴 ปุ่มลบถูกดึงมาลอยไว้ขวาบนสุดของการ์ด พร้อม Popup ยืนยัน */}
                    <button 
                      onClick={() => {
                        if (window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${elder.elder_fname} ${elder.elder_sname}" ?\n\n(การลบจะซ่อนข้อมูลนี้ออกจากหน้าจอของคุณ)`)) {
                          handleDeleteElder(elder.elder_id);
                        }
                      }}
                      className="absolute top-4 right-4 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 shadow-sm"
                      title="ลบข้อมูลผู้สูงอายุท่านนี้"
                    >
                      🗑️ ลบข้อมูล
                    </button>
                    
                    {/* ข้อมูลสุขภาพ */}
                    <div className="flex-1 space-y-3 text-gray-600">
                      <h3 className="text-xl font-bold text-green-700 border-b pb-2 pr-24">
                        {elder.elder_fname} {elder.elder_sname}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                        <p><strong>กรุ๊ปเลือด:</strong> <span className="text-red-500 font-bold">{elder.blood_type}</span></p>
                        <p><strong>สิทธิรักษา:</strong> {elder.medical_rights || '-'}</p>
                      </div>
                      <p className="text-sm"><strong>โรคประจำตัว:</strong> {elder.chronic_diseases || 'ไม่มี'}</p>
                      <p className="text-sm text-red-400 font-medium italic bg-red-50 p-2 rounded-lg inline-block w-full">⚠️ แพ้: {elder.allergies || 'ไม่ระบุ'}</p>
                    </div>

                    {/* QR Code ของแต่ละคน */}
                    <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 min-w-[180px]">
                      {elder.tag_id ? (
                        <div className="text-center space-y-2 w-full">
                          <div className="flex justify-center bg-white p-2 rounded-xl shadow-sm mb-2">
                            <QRCodeCanvas 
                              id={`qr-${elder.tag_id}`}
                              value={`${window.location.origin}/scan/${elder.tag_id}`} 
                              size={120} 
                              level={"H"} 
                            />
                          </div>
                          <p className="text-[10px] font-mono text-gray-400 bg-white px-2 py-1 rounded-full border">ID: {elder.tag_id}</p>
                          <button 
                            onClick={() => {
                              const canvas = document.getElementById(`qr-${elder.tag_id}`);
                              const img = canvas.toDataURL("image/png");
                              const link = document.createElement('a');
                              link.href = img;
                              link.download = `CareTag-${elder.elder_fname}.png`;
                              link.click();
                            }} 
                            className="text-green-600 text-xs font-bold hover:bg-green-50 px-3 py-2 rounded-xl transition flex items-center justify-center gap-1 w-full cursor-pointer border border-green-100"
                          >
                            🖨️ ดาวน์โหลด QR
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleGenerateTag(elder.elder_id)} 
                          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 w-full cursor-pointer transition"
                        >
                          + สร้าง CareTag
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
                  <span className="text-4xl mb-3 opacity-50">👥</span>
                  <p className="text-gray-400 font-bold text-lg">ยังไม่ได้ลงทะเบียนผู้สูงอายุ</p>
                  <p className="text-gray-400 text-sm mt-1">คลิกที่ปุ่ม "เพิ่มคนใหม่" ด้านบนเพื่อเริ่มต้น</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            ส่วนที่ 3: ประวัติการสแกน (Logs)
        ========================================= */}
        <div className="mt-12 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📍 ประวัติการสแกนล่าสุด (ทั้งหมด)</h2>
          {data?.recent_logs?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 border-b">
                    <th className="pb-3">ผู้ถูกสแกน</th>
                    <th className="pb-3">เวลา</th>
                    <th className="pb-3">พิกัด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recent_logs.map((log) => {
                    const elderName = data.elders?.find(e => e.elder_id === log.elder_id)?.elder_fname || 'ไม่ระบุ';
                    return (
                      <tr key={log.log_id} className="hover:bg-gray-50 transition">
                        <td className="py-4 font-bold text-green-700">{elderName}</td>
                        <td className="py-4 text-gray-600">{new Date(log.scanned_at).toLocaleString('th-TH')}</td>
                        <td className="py-4">
                          {log.location_lat ? (
                            <a href={`https://www.google.com/maps?q=${log.location_lat},${log.location_lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-full text-xs">📍 เปิดแผนที่</a>
                          ) : <span className="text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-full text-xs">ไม่มีพิกัด</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center py-10 text-gray-400 italic">ยังไม่มีประวัติการสแกนเข้ามาในระบบ</p>}
        </div>

        {/* =========================================
            Modal เพิ่มผู้สูงอายุ
        ========================================= */}
        {isAddingElder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-[40px] w-full max-w-xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">➕ เพิ่มผู้สูงอายุในดูแล</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">ชื่อ*</label>
                    <input required className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm" placeholder="ชื่อ" value={newElder.elder_fname} onChange={e => setNewElder({...newElder, elder_fname: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">ชื่อกลาง</label>
                    <input className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm" placeholder="ถ้ามี" value={newElder.elder_mname} onChange={e => setNewElder({...newElder, elder_mname: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">นามสกุล*</label>
                    <input required className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm" placeholder="นามสกุล" value={newElder.elder_sname} onChange={e => setNewElder({...newElder, elder_sname: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">กรุ๊ปเลือด</label>
                    <select className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm bg-white cursor-pointer" value={newElder.blood_type} onChange={e => setNewElder({...newElder, blood_type: e.target.value})}>
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                      <option value="O">Group O</option>
                      <option value="AB">Group AB</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">สิทธิการรักษา</label>
                    <input className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm" placeholder="เช่น บัตรทอง, ประกันสังคม" value={newElder.medical_rights} onChange={e => setNewElder({...newElder, medical_rights: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">โรคประจำตัว</label>
                  <input className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm" placeholder="ระบุโรคประจำตัว" value={newElder.chronic_diseases} onChange={e => setNewElder({...newElder, chronic_diseases: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">ประวัติการแพ้ยา/อาหาร</label>
                  <textarea className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm shadow-sm h-24 resize-none" placeholder="ระบุสิ่งที่แพ้และอาการ" value={newElder.allergies} onChange={e => setNewElder({...newElder, allergies: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleAddElder} className="flex-1 bg-[#00B041] text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-600 transition cursor-pointer active:scale-95">
                  บันทึกข้อมูล
                </button>
                <button onClick={() => setIsAddingElder(false)} className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition cursor-pointer">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Dashboard;