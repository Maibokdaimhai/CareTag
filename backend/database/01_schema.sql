-- 1. Profiles (Owner)
CREATE TABLE profiles (
  profile_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  p_fullname TEXT NOT NULL,
  phone1 TEXT NOT NULL,
  phone2 TEXT,
  line_user_id TEXT UNIQUE,
  relation TEXT,
  address TEXT,
  province TEXT,
  postal_code TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tags
CREATE TABLE tags (
  tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Elders
CREATE TABLE elders (
  elder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID REFERENCES tags(tag_id) ON DELETE SET NULL,
  elder_fname TEXT NOT NULL,
  elder_mname TEXT,
  elder_sname TEXT NOT NULL,
  blood_type TEXT,
  chronic_diseases TEXT,
  allergies TEXT,
  medical_rights TEXT,
  e_status TEXT DEFAULT 'active' -- active, inactive
);

-- 4. Junction Table
CREATE TABLE elders_contacts (
  profile_id UUID REFERENCES profiles(profile_id) ON DELETE CASCADE,
  elder_id UUID REFERENCES elders(elder_id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, elder_id)
);

-- 5. Logs
CREATE TABLE logs (
  log_id SERIAL PRIMARY KEY,
  elder_id UUID REFERENCES elders(elder_id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  log_status TEXT DEFAULT 'pending', -- pending, notified
  incident_type TEXT, -- เก็บค่า 'พลัดหลง' หรือ 'อุบัติเหตุ'
  helper_phone TEXT
);