const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // O tu SERVICE_ROLE_KEY si lo prefieres para el back-end

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "⚠️ Faltan las variables SUPABASE_URL o SUPABASE_ANON_KEY en tu archivo .env",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
