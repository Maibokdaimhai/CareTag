import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State สำหรับการแก้ไขโปรไฟล์
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

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
      alert('บันทึกข้อมูลสำเร็จ');
      setIsEditing(false);
      fetchData(); 
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleGenerateTag = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/generate-tag`, 
        { elder_id: data.elder.elder_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('สร้าง QR Code สำเร็จ!');
      fetchData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Tag');
    }
  };

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
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition">ออกจากระบบ</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ข้อมูลผู้ดูแล */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🏠 ข้อมูลผู้ดูแล</h2>
              {!isEditing ? (
                <button onClick={startEditing} className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-bold">แก้ไขข้อมูล</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">บันทึก</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full text-sm font-bold">ยกเลิก</button>
                </div>
              )}
            </div>

            <div className="space-y-4 text-gray-600">
              <div className="flex justify-between border-b pb-2 text-sm italic text-gray-400">
                <strong>อีเมล (ID):</strong> <span>{data?.profile?.email}</span>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <input className="border p-2 rounded-xl" placeholder="ชื่อ-นามสกุล" value={editForm.p_fullname} onChange={e => setEditForm({...editForm, p_fullname: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="border p-2 rounded-xl" placeholder="เบอร์โทรหลัก" value={editForm.phone1} onChange={e => setEditForm({...editForm, phone1: e.target.value})} />
                    <input className="border p-2 rounded-xl" placeholder="เบอร์โทรสำรอง" value={editForm.phone2} onChange={e => setEditForm({...editForm, phone2: e.target.value})} />
                  </div>
                  <input className="border p-2 rounded-xl" placeholder="ความสัมพันธ์" value={editForm.relation} onChange={e => setEditForm({...editForm, relation: e.target.value})} />
                  <input className="border p-2 rounded-xl" placeholder="ที่อยู่" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="border p-2 rounded-xl" placeholder="จังหวัด" value={editForm.province} onChange={e => setEditForm({...editForm, province: e.target.value})} />
                    <input className="border p-2 rounded-xl" placeholder="รหัสไปรษณีย์" value={editForm.postal_code} onChange={e => setEditForm({...editForm, postal_code: e.target.value})} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="flex justify-between border-b pb-2"><strong>ชื่อผู้ดูแล:</strong> <span>{data?.profile?.p_fullname}</span></p>
                  <p className="flex justify-between border-b pb-2"><strong>เบอร์โทรหลัก:</strong> <span>{data?.profile?.phone1}</span></p>
                  <p className="flex justify-between border-b pb-2"><strong>เบอร์โทรสำรอง:</strong> <span>{data?.profile?.phone2 || '-'}</span></p>
                  <p className="flex justify-between border-b pb-2"><strong>ความสัมพันธ์:</strong> <span>{data?.profile?.relation || '-'}</span></p>
                  <p className="flex justify-between border-b pb-2"><strong>รหัสไปรษณีย์:</strong> <span>{data?.profile?.postal_code || '-'}</span></p>
                 <div className="pt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">ที่อยู่ปัจจุบัน:</p>
                    {data?.profile?.address || data?.profile?.province ? (
                      <p className="text-sm text-gray-700">
                        {data?.profile?.address || 'ไม่ระบุที่อยู่'} จ.{data?.profile?.province || 'ไม่ระบุจังหวัด'}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">ไม่ระบุข้อมูลที่อยู่</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ข้อมูลผู้สูงอายุ */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">👵 ข้อมูลผู้สูงอายุ</h2>
            {data?.elder ? (
              <div className="space-y-3 text-gray-600">
                <p className="flex justify-between border-b pb-2"><strong>ชื่อ-นามสกุล:</strong> <span>{data.elder.elder_fname} {data.elder.elder_sname}</span></p>
                <p className="flex justify-between border-b pb-2"><strong>กรุ๊ปเลือด:</strong> <span className="text-red-500 font-bold">{data.elder.blood_type}</span></p>
                <p className="flex justify-between border-b pb-2 text-sm"><strong>โรคประจำตัว:</strong> <span>{data.elder.chronic_diseases || 'ไม่มี'}</span></p>
                <p className="text-sm text-red-400 font-medium pt-2 italic">⚠️ แพ้ยา/อาหาร: {data.elder.allergies || 'ไม่ระบุ'}</p>
              </div>
            ) : (
              <p className="text-gray-400 italic text-center py-10">ยังไม่ได้ลงทะเบียนผู้สูงอายุ</p>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-12 text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">QR Code ประจำตัว</h2>
          {data?.elder?.tag_id ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white border-4 border-green-500 rounded-2xl">
                <QRCodeCanvas value={`${window.location.origin}/scan/${data.elder.tag_id}`} size={200} level={"H"} />
              </div>
              <button onClick={() => window.print()} className="text-green-600 font-semibold hover:underline">🖨️ พิมพ์ QR Code</button>
            </div>
          ) : (
            <button onClick={handleGenerateTag} className="bg-green-600 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-green-700 transition">➕ สร้าง CareTag</button>
          )}
        </div>

        {/* Logs */}
        <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📍 ประวัติการสแกนล่าสุด</h2>
          {data?.recent_logs?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b text-sm">
                    <th className="pb-3">เวลา</th>
                    <th className="pb-3">สถานะ</th>
                    <th className="pb-3">พิกัด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recent_logs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-gray-50">
                      <td className="py-4 text-sm">{new Date(log.scanned_at).toLocaleString('th-TH')}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.log_status === 'notified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {log.log_status === 'notified' ? '● แจ้งเหตุแล้ว' : '○ สแกนแล้ว'}
                        </span>
                      </td>
                      <td className="py-4">
                        {log.location_lat ? (
                          <a href={`https://www.google.com/maps?q=${log.location_lat},${log.location_lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm">📍 แผนที่</a>
                        ) : <span className="text-gray-400 italic text-sm">ไม่มีพิกัด</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center py-10 text-gray-400 italic">ยังไม่มีประวัติการสแกน</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;