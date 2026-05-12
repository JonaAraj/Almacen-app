const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log(`\n📋 Verificando configuración de Supabase...`);
console.log(`   - URL: ${supabaseUrl ? "✅ Configurada" : "❌ Faltante"}`);
console.log(`   - KEY: ${supabaseKey ? "✅ Configurada" : "❌ Faltante"}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error(
    `\n❌ ERROR CRÍTICO: Faltan variables de Supabase en el entorno.`
  );
  console.error(`   Variables esperadas:`);
  console.error(`   - SUPABASE_URL o EXPO_PUBLIC_SUPABASE_URL`);
  console.error(`   - SUPABASE_SERVICE_ROLE_KEY o EXPO_PUBLIC_SUPABASE_ANON_KEY\n`);
  console.error(`   En Render, configúralas en Settings > Environment Variables\n`);
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log(`✅ Cliente Supabase inicializado correctamente\n`);
  module.exports = supabase;
} catch (err) {
  console.error(`❌ Error al inicializar Supabase:`, err.message);
  process.exit(1);
}
