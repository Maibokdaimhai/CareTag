const supabase = require('../config/supabase');
const lineService = require('../services/lineService');

exports.reportEmergency = async (req, res) => {
  const { slug, lat, lng, incident_type, helper_phone } = req.body;
  const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  try {
    // 1. หาข้อมูล Elder และ Profile (เหมือนเดิม)
    const { data: elder, error: elderError } = await supabase
      .from('elders')
      .select(`elder_id, elder_fname, elder_sname, tags!inner(qr_code_slug), profiles(line_user_id)`)
      .eq('tags.qr_code_slug', slug)
      .single();

    if (elderError || !elder) return res.status(404).json({ error: 'ไม่พบข้อมูล' });

    // 2. บันทึก Log เริ่มต้น (ใส่สถานะเป็น pending หรือปล่อย default)
    // เก็บค่า id ของ log ที่เพิ่งสร้างไว้เพื่อเอาไปอัปเดตต่อ
    const { data: logData, error: logError } = await supabase
      .from('logs')
      .insert([{ 
        elder_id: elder.elder_id, 
        location_lat: lat, 
        location_lng: lng,
        incident_type, 
        helper_phone,
        log_status: 'pending' // ระบุสถานะเริ่มต้น
      }])
      .select()
      .single();

    if (logError) throw logError;

    // 3. เตรียมข้อความและส่ง LINE
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const alertMsg = `🆘 แจ้งเตือน! คุณ${elder.elder_fname} ${incident_type}\n⏰ เวลา: ${time}\n📍 พิกัด: ${mapUrl}\n📞 เบอร์ผู้ช่วยเหลือ: ${helper_phone}`;

    const sendPromises = elder.profiles
      .filter(p => p.line_user_id)
      .map(p => lineService.sendPushMessage(p.line_user_id, alertMsg));

    // รอให้ทุกข้อความส่งสำเร็จ
    await Promise.all(sendPromises);

    // 4. *** ขั้นตอนสำคัญ: อัปเดตสถานะใน Log เป็น 'sent' เมื่อส่งสำเร็จ ***
    await supabase
      .from('logs')
      .update({ log_status: 'sent' })
      .eq('log_id', logData.log_id); // อ้างอิงจาก ID ที่สร้างในข้อ 2

    res.json({ status: 'success', message: 'ส่งข้อมูลและบันทึกประวัติเรียบร้อย' });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getElderInfo = async (req, res) => {
  const { slug } = req.params;
  try {
    const { data, error } = await supabase
      .from('elders')
      .select(`*, tags!inner(qr_code_slug), profiles(phone1)`)
      .eq('tags.qr_code_slug', slug)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};