// Configuración de URLs para diferentes entornos
const isDevelopment = __DEV__; // variable nativa de React Native

const API_BASE_URL = isDevelopment
  ? "http://localhost:3000" // Para desarrollo local
  : process.env.REACT_APP_API_URL || "https://almacen-app-backend.onrender.com"; // Para producción

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://sxpynaopbvsjfxfkrgeu.supabase.co";
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const config = {
  API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_KEY,
  isDevelopment,
};
