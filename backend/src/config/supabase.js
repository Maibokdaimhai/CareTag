const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: Supabase URL or Key is missing from process.env");
  console.log("Current SUPABASE_URL:", supabaseUrl ? "OK" : "NULL");
  console.log("Current SUPABASE_KEY:", supabaseKey ? "OK" : "NULL");
}

const supabase = createClient(
  supabaseUrl || '', 
  supabaseKey || ''
);

module.exports = supabase;