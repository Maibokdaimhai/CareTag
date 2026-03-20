import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // State สำหรับ Modal เพิ่มผู้สูงอายุ
  const [isAdding, setIsAdding] = useState(false);
  const [newElder, setNewElder] = useState({
    elder_fname: '', elder_sname: '', blood_type: 'A', chronic_diseases: '', allergies: '', medical_rights: ''
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddElder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/add-elder`, newElder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('เพิ่มข้อมูลสำเร็จ!');
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleGenerateTag = async (elderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/generate-tag`, 
        { elder_id: elderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      alert('สร้าง Tag ไม่สำเร็จ');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-green-600">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold text-green-700">CareTag Dashboard</h1>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-red-500 font-semibold text-sm">ออกจากระบบ</button>
        </header>

        {/* ข้อมูลผู้สูงอายุ List */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">👵 ผู้สูงอายุในความดูแล</h2>
          <button onClick={() => setIsAdding(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-green-700">➕ เพิ่มคนใหม่</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {data?.elders?.map((elder) => (
            <div key={elder.elder_id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-gray-800">{elder.elder_fname} {elder.elder_sname}</h3>
                <p className="text-sm text-gray-500 border-b pb-2 mb-2">กรุ๊ปเลือด: <span className="text-red-500 font-bold">{elder.blood_type}</span></p>
                <p className="text-xs text-gray-600"><strong>โรคประจำตัว:</strong> {elder.chronic_diseases || '-'}</p>
                <p className="text-xs text-red-400 mt-1"><strong>แพ้ยา:</strong> {elder.allergies || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center gap-2">
                {elder.tag_id ? (
                  <>
                    <QRCodeCanvas value={`${window.location.origin}/scan/${elder.tag_id}`} size={120} level={"H"} />
                    <span className="text-[10px] text-gray-400 font-mono">ID: {elder.tag_id}</span>
                  </>
                ) : (
                  <button onClick={() => handleGenerateTag(elder.elder_id)} className="bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-bold">สร้าง Tag</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal เพิ่มข้อมูล (ใช้ CSS Overlay ง่ายๆ) */}
        {isAdding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleAddElder} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">เพิ่มผู้สูงอายุ</h3>
              <input required className="w-full p-3 border rounded-xl" placeholder="ชื่อ" onChange={e => setNewElder({...newElder, elder_fname: e.target.value})} />
              <input required className="w-full p-3 border rounded-xl" placeholder="นามสกุล" onChange={e => setNewElder({...newElder, elder_sname: e.target.value})} />
              <select className="w-full p-3 border rounded-xl" onChange={e => setNewElder({...newElder, blood_type: e.target.value})}>
                <option value="A">Group A</option><option value="B">Group B</option><option value="O">Group O</option><option value="AB">Group AB</option>
              </select>
              <input className="w-full p-3 border rounded-xl" placeholder="โรคประจำตัว" onChange={e => setNewElder({...newElder, chronic_diseases: e.target.value})} />
              <textarea className="w-full p-3 border rounded-xl h-20" placeholder="ประวัติการแพ้ยา" onChange={e => setNewElder({...newElder, allergies: e.target.value})} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">บันทึก</button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold">ยกเลิก</button>
              </div>
            </form>
          </div>
        )}

        {/* ตารางประวัติการสแกนล่าสุด */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold mb-4 text-gray-800">📍 ประวัติการสแกนล่าสุด (รวม)</h2>
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