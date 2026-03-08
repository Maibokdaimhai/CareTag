const supabase = require('../config/supabase');

exports.registerElder = async (req, res) => {
  const { email, p_fullname, phone1, line_user_id, qr_code_slug, elder_fname, elder_sname, blood_type, chronic_diseases, allergies, medical_rights } = req.body;

  try {
    // 1. สร้าง Profile ลูกหลาน (หรือ Update ถ้ามีอยู่แล้ว)
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .upsert({ 
        email, p_fullname, phone1, line_user_id 
      }, { onConflict: 'email' }) // อ้างอิงตาม email
      .select()
      .single();

    if (pError) throw pError;

    // 2. สร้าง Tag ใหม่
    const { data: tag, error: tError } = await supabase
      .from('tags')
      .insert([{ qr_code_slug }])
      .select()
      .single();

    if (tError) throw tError;

    // 3. สร้างข้อมูลผู้สูงอายุและผูกกับ Tag
    const { data: elder, error: eError } = await supabase
      .from('elders')
      .insert([{
        tag_id: tag.tag_id,
        elder_fname, elder_sname, blood_type, chronic_diseases, allergies, medical_rights
      }])
      .select()
      .single();

    if (eError) throw eError;

    // 4. ผูกความสัมพันธ์ลูกหลานกับผู้สูงอายุ
    await supabase.from('elders_contacts').insert([{
      profile_id: profile.profile_id,
      elder_id: elder.elder_id
    }]);

    res.json({ status: 'success', message: 'ลงทะเบียนสำเร็จ!' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};