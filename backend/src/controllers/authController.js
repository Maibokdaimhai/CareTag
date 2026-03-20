const supabase = require('../config/supabase');
const lineService = require('../services/lineService');
const { v4: uuidv4 } = require('uuid');

// 1. สมัครสมาชิกพร้อมลงทะเบียนผู้สูงอายุ
exports.signUp = async (req, res) => {
    const { 
        email, password, p_fullname, phone1, phone2, relation, address, province, postal_code,
        elder_fname, elder_mname, elder_sname, blood_type, chronic_diseases, allergies, medical_rights,
        line_user_id // <-- รับค่า ID ของผู้ดูแลที่ส่งมาจากหน้าบ้าน (สมัครสมาชิก)
    } = req.body;

    try {
        // 1. สร้าง User ในระบบ Auth ของ Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        const userId = authData.user.id;

        // 2. บันทึกข้อมูลลงตาราง Profiles (เพิ่ม line_user_id ของผู้ดูแลเข้าไปด้วย)
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
                profile_id: userId, 
                email, 
                p_fullname, 
                phone1, 
                phone2, 
                relation, 
                address, 
                province, 
                postal_code,
                line_user_id // <-- บันทึก ID ของผู้ดูแลลงฐานข้อมูลที่นี่!
            }]);
        if (profileError) throw profileError;

        // ... (ส่วนบันทึกข้อมูล Elders และ elders_contacts เหมือนเดิมที่คุณเขียนไว้) ...
        
        // 3. บันทึกข้อมูลลงตาราง Elders
        const { data: elderData, error: elderError } = await supabase
            .from('elders')
            .insert([{ elder_fname, elder_mname, elder_sname, blood_type, chronic_diseases, allergies, medical_rights }])
            .select().single();
        if (elderError) throw elderError;

        // 4. เชื่อมความสัมพันธ์
        const { error: junctionError } = await supabase
            .from('elders_contacts')
            .insert([{ profile_id: userId, elder_id: elderData.elder_id }]);
        if (junctionError) throw junctionError;

        res.json({ message: 'ลงทะเบียนสำเร็จ และผูกบัญชี LINE เรียบร้อย!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 2. เข้าสู่ระบบ
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            session: data.session,
            user: data.user
        });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

// 3. ดึงข้อมูล Dashboard (Profile + Elder + Recent Logs)
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // ดึงโปรไฟล์ผู้ดูแล
        const { data: profile } = await supabase
            .from('profiles').select('*').eq('profile_id', userId).single();

        // ดึงข้อมูลผู้สูงอายุ "ทั้งหมด" ผ่านตาราง junction (เอา .single() ออก)
        const { data: junctionData } = await supabase
            .from('elders_contacts')
            .select(`elders ( * )`)
            .eq('profile_id', userId);

        const elders = junctionData ? junctionData.map(j => j.elders) : [];

        let logs = [];
        if (elders.length > 0) {
            // ดึงประวัติการสแกนรวมของทุกคน 10 รายการล่าสุด
            const elderIds = elders.map(e => e.elder_id);
            const { data: logData } = await supabase
                .from('logs')
                .select('*')
                .in('elder_id', elderIds)
                .order('scanned_at', { ascending: false })
                .limit(10);
            logs = logData || [];
        }

        res.json({ 
            profile, 
            elders: elders,
            recent_logs: logs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. สร้าง Tag QR Code ใหม่
exports.generateTag = async (req, res) => {
    try {
        const { elder_id } = req.body;
        const qr_code_slug = uuidv4().substring(0, 8); 

        const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .insert([{ qr_code_slug }])
            .select()
            .single();

        if (tagError) throw tagError;

        const { error: elderUpdateError } = await supabase
            .from('elders')
            .update({ tag_id: tagData.tag_id })
            .eq('elder_id', elder_id);

        if (elderUpdateError) throw elderUpdateError;

        res.json({ message: 'สร้าง Tag สำเร็จ', qr_code_slug, tag_id: tagData.tag_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. ดึงข้อมูลสาธารณะเมื่อมีการสแกน (Public Profile)
exports.getPublicProfile = async (req, res) => {
    try {
        const { tag_id } = req.params;

        const { data: elder, error: eError } = await supabase
            .from('elders')
            .select(`
                elder_id, elder_fname, elder_sname, blood_type, chronic_diseases, allergies, medical_rights,
                elders_contacts (
                    profiles ( line_user_id, p_fullname, phone1, phone2 )
                )
            `)
            .eq('tag_id', tag_id)
            .single();

        if (eError || !elder) return res.status(404).json({ error: "ไม่พบข้อมูลผู้สูงอายุ" });

        // บันทึก Log การสแกนเบื้องต้น (Throttle 5 วินาทีเพื่อกันบันทึกซ้ำ)
        const { data: recentLogs } = await supabase
            .from('logs')
            .select('scanned_at')
            .eq('elder_id', elder.elder_id)
            .order('scanned_at', { ascending: false })
            .limit(1);

        const now = new Date();
        const lastScan = recentLogs && recentLogs.length > 0 ? new Date(recentLogs[0].scanned_at) : null;

        if (!lastScan || (now - lastScan) > 5000) { 
            await supabase.from('logs').insert([{ 
                elder_id: elder.elder_id,
                log_status: 'scanned',
                scanned_at: now.toISOString()
            }]);
        }

        const responseData = {
            ...elder,
            contacts: elder.elders_contacts.map(ec => ec.profiles).filter(p => p !== null)
        };
        delete responseData.elders_contacts;

        res.json(responseData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. อัปเดตพิกัด และประเภทเหตุการณ์ + แจ้งเตือน LINE
exports.updateScanLocation = async (req, res) => {
    try {
        const { elder_id, lat, lng, incident_type, helper_phone } = req.body;
        const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        // 1. หา Log ล่าสุดที่เพิ่งสร้างจากการสแกน
        const { data: latestLog } = await supabase
            .from('logs').select('log_id').eq('elder_id', elder_id)
            .order('scanned_at', { ascending: false }).limit(1).single();

        if (!latestLog) return res.status(404).json({ error: "ไม่พบข้อมูลการสแกน" });

        // 2. อัปเดตข้อมูลพิกัดและรายละเอียดเหตุการณ์
        await supabase.from('logs').update({ 
            location_lat: lat || null, 
            location_lng: lng || null, 
            incident_type,
            helper_phone,
            log_status: 'notified'
        }).eq('log_id', latestLog.log_id);

        // 3. ดึงข้อมูลเพื่อส่ง LINE แจ้งเตือนผู้ดูแล
        const { data: elder } = await supabase
            .from('elders')
            .select(`elder_fname, elder_sname, elders_contacts ( profiles ( line_user_id ) )`)
            .eq('elder_id', elder_id)
            .single();

        if (elder) {
            const mapUrl = lat ? `https://www.google.com/maps?q=${lat},${lng}` : 'ไม่ระบุพิกัด';
            const alertMsg = `🆘 แจ้งเตือน! คุณ${elder.elder_fname} ${elder.elder_sname} : ${incident_type}\n⏰ เวลา: ${time}\n📍 พิกัด: ${mapUrl}\n📞 เบอร์ผู้ช่วยเหลือ: ${helper_phone || 'ไม่ได้ระบุ'}`;

            const lineIds = elder.elders_contacts
                .map(ec => ec.profiles?.line_user_id)
                .filter(id => id);

            if (lineIds.length > 0) {
                await Promise.allSettled(lineIds.map(id => lineService.sendPushMessage(id, alertMsg)));
            }
        }

        res.json({ message: 'บันทึกข้อมูลและส่งแจ้งเตือนเรียบร้อย' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 7. ระบบแก้ไขโปรไฟล์ (แก้ไขได้ทุกอย่างยกเว้นอีเมล)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { p_fullname, phone1, phone2, relation, address, province, postal_code } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                p_fullname, 
                phone1, 
                phone2, 
                relation, 
                address, 
                province, 
                postal_code 
            })
            .eq('profile_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ', profile: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 8. ระบบจัดการรหัสผ่าน
exports.resetPasswordRequest = async (req, res) => {
    const { email } = req.body;
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/update-password`, 
        });
        if (error) throw error;
        res.json({ message: 'ส่งลิงก์รีเซ็ตรหัสผ่านสำเร็จ' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.addElder = async (req, res) => {
    try {
        const userId = req.user.id; // ตรวจสอบให้แน่ใจว่า Middleware ส่ง ID มาถูกต้อง
        
        // รับค่าและป้องกันค่า undefined ด้วยการใส่ || null หรือ || ""
        const { 
            elder_fname, elder_mname, elder_sname, 
            blood_type, chronic_diseases, allergies, medical_rights 
        } = req.body;

        // 1. บันทึกข้อมูลลงตาราง elders
        const { data: elderData, error: elderError } = await supabase
            .from('elders')
            .insert([{ 
                elder_fname, 
                elder_mname: elder_mname || null, 
                elder_sname, 
                blood_type: blood_type || 'A', 
                chronic_diseases: chronic_diseases || null, 
                allergies: allergies || null, 
                medical_rights: medical_rights || null
            }])
            .select(); // เอา .single() ออกก่อนเพื่อเช็ค Error

        if (elderError) {
            console.error("DEBUG: Elder Insert Error ->", elderError.message);
            throw new Error(`สร้างข้อมูลผู้สูงอายุไม่สำเร็จ: ${elderError.message}`);
        }

        const newElder = elderData[0];

        // 2. สร้างความสัมพันธ์ (ตรวจสอบ userId ว่ามีค่า)
        if (!userId) throw new Error("ไม่พบ ID ผู้ดูแลในระบบ");

        const { error: junctionError } = await supabase
            .from('elders_contacts')
            .insert([{ profile_id: userId, elder_id: newElder.elder_id }]);

        if (junctionError) {
            console.error("DEBUG: Junction Error ->", junctionError.message);
            throw new Error(`เชื่อมโยงผู้ดูแลไม่สำเร็จ: ${junctionError.message}`);
        }

        res.json({ message: 'เพิ่มข้อมูลผู้สูงอายุสำเร็จ', elder: newElder });
    } catch (err) {
        console.error("DEBUG: Catch Block ->", err.message);
        res.status(400).json({ error: err.message });
    }
};