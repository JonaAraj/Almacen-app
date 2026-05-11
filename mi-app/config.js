import Constants from "expo-constants";

const isDevelopment = __DEV__;
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

const API_BASE_URL = isDevelopment
  ? "http://localhost:3000"
  : extra.apiUrl || "https://almacen-app-backend.onrender.com";

const SUPABASE_URL = extra.supabaseUrl || "https://sxpynaopbvsjfxfkrgeu.supabase.co";
const SUPABASE_KEY = extra.supabaseKey || "";

export const config = {
  API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_KEY,
  isDevelopment,
};
