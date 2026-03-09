import React, { useEffect, useState, useRef } from 'react'; // เพิ่ม useRef
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, AlertTriangle, Heart, Ambulance, MapPin, HelpCircle } from 'lucide-react';

const ScanResult = () => {
    const { tag_id } = useParams();
    const [elder, setElder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('selection');
    
    // ใช้ useRef เพื่อป้องกันการรัน API ซ้ำใน Strict Mode
    const hasFetched = useRef(false);

    useEffect(() => {
        // ถ้าเคยรันไปแล้ว ให้หยุดทำงาน (ป้องกัน Log ซ้ำ 2 รอบ)
        if (hasFetched.current) return;

        const fetchPublicData = async () => {
            try {
                // ดึงข้อมูลผู้สูงอายุ (ขั้นตอนนี้ Backend จะสร้าง Log เริ่มต้นที่มีสถานะ 'scanned')
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/scan/${tag_id}`);
                setElder(res.data);
                hasFetched.current = true; // มาร์คว่าดึงข้อมูลและสร้าง Log สำเร็จแล้ว
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, [tag_id]);

    const [helperPhone, setHelperPhone] = useState('');
    // ฟังก์ชันจัดการตอนกดปุ่มเลือกเหตุการณ์
    const handleIncidentReport = (type) => {
        const sendData = async (lat = null, lng = null) => {
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/report-emergency`, {
                    elder_id: elder.elder_id,
                    lat: lat,
                    lng: lng,
                    incident_type: type,
                    helper_phone: helperPhone // ส่งเบอร์ผู้ช่วยไปด้วย
                });
            } catch (err) {
                console.error("API Error:", err);
            } finally {
                setStep('details');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => sendData(pos.coords.latitude, pos.coords.longitude),
                (err) => {
                    console.warn(err.message);
                    sendData();
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            sendData();
        }
    };

    // ในส่วน return UI หน้าจอ 'selection'
    if (step === 'selection') {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="text-red-500 mb-4 animate-bounce" size={60} />
                <h1 className="text-2xl font-black mb-2 text-gray-800">ระบุสถานะที่พบ</h1>
                
                {/* เพิ่มช่องกรอกเบอร์โทรศัพท์ตรงนี้ */}
                <div className="w-full max-w-sm mb-6">
                    <label className="block text-left text-sm font-bold text-gray-600 mb-1 ml-2">
                        เบอร์โทรศัพท์ของคุณ (เพื่อความสะดวกในการติดต่อกลับ)
                    </label>
                    <input
                        type="tel"
                        placeholder="เช่น 0812345678"
                        value={helperPhone}
                        onChange={(e) => setHelperPhone(e.target.value)}
                        className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none text-lg transition-all shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                    <button 
                        onClick={() => handleIncidentReport('พลัดหลง')} 
                        className="bg-orange-500 text-white p-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition"
                    >
                        <MapPin size={24} /> พลัดหลง
                    </button>
                    <button 
                        onClick={() => handleIncidentReport('อุบัติเหตุ')} 
                        className="bg-red-600 text-white p-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition"
                    >
                        <Ambulance size={24} /> อุบัติเหตุ
                    </button>
                    <button 
                        onClick={() => handleIncidentReport('อื่นๆ')} 
                        className="bg-gray-500 text-white p-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition"
                    >
                        <HelpCircle size={24} /> อื่นๆ
                    </button>
                </div>
            </div>
        );
    }

    // เช็คสถานะการโหลด (วางไว้ล่วงหน้า return UI)
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">กำลังเตรียมข้อมูล...</div>;
    if (!elder) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">❌ ไม่พบข้อมูลในระบบ</div>;

    // หน้าจอที่ 1: เลือกสถานะ
    if (step === 'selection') {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="text-red-500 mb-4 animate-bounce" size={60} />
                <h1 className="text-2xl font-black mb-2 text-gray-800">ระบุสถานะที่พบ</h1>
                <p className="text-gray-500 mb-8">กรุณากดเลือกสถานะเพื่อแจ้งพิกัดให้ญาติทราบ</p>
                <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                    <button onClick={() => handleIncidentReport('พลัดหลง')} className="bg-orange-500 text-white p-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition">
                        <MapPin size={24} /> พลัดหลง
                    </button>
                    <button onClick={() => handleIncidentReport('อุบัติเหตุ')} className="bg-red-600 text-white p-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition">
                        <Ambulance size={24} /> อุบัติเหตุ
                    </button>
                    <button onClick={() => handleIncidentReport('อื่นๆ')} className="bg-gray-500 text-white p-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition">
                        <HelpCircle size={24} /> อื่นๆ
                    </button>
                </div>
            </div>
        );
    }

    // หน้าจอที่ 2: รายละเอียด (คงโค้ดเดิมของคุณไว้)
    const contact = elder?.elders_contacts?.[0]?.profiles;
    return (
        <div className="min-h-screen bg-red-50 p-4 flex flex-col items-center">
            {/* ... UI ส่วนรายละเอียดที่มี medical_rights และปุ่มโทรหาผู้ดูแล ... */}
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-red-600">
                <div className="p-4 bg-green-50 text-green-700 text-center font-bold border-b border-green-100">
                    ✅ แจ้งพิกัดและเหตุการณ์ไปยังญาติแล้ว
                </div>
                <div className="p-6 space-y-4 text-gray-800">
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs text-gray-400 uppercase font-bold">ชื่อผู้สูงอายุ</p>
                        <p className="text-lg font-bold">{elder.elder_fname} {elder.elder_sname}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-400">กรุ๊ปเลือด</p><p className="font-bold text-red-600">{elder.blood_type || '-'}</p></div>
                        <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-400">โรคประจำตัว</p><p className="font-semibold">{elder.chronic_diseases || '-'}</p></div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs text-gray-400">สิทธิการรักษา</p>
                        <p className="font-semibold">{elder.medical_rights || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <p className="text-xs text-yellow-600 font-bold">⚠️ ข้อมูลการแพ้</p>
                        <p className="font-medium text-gray-700">{elder.allergies || 'ไม่มี'}</p>
                    </div>
                    {contact && (
                    <div className="flex flex-col gap-3 w-full">
                        <a href={`tel:${contact.phone1}`} className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-4 rounded-2xl text-xl font-black shadow-lg">
                        <Phone fill="white" /> โทรหาญาติ (หลัก)
                        </a>
                        {contact.phone2 && (
                        <a href={`tel:${contact.phone2}`} className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-4 rounded-2xl text-xl font-black shadow-lg">
                            <Phone fill="white" /> โทรหาญาติ (สำรอง)
                        </a>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScanResult;