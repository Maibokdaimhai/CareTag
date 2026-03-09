const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log("--- Supabase Connection Check ---");
console.log("URL:", supabaseUrl ? "Found" : "Missing");
console.log("KEY:", supabaseKey ? "Found" : "Missing");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key are missing! Check Render Environment Variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;