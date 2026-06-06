import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Konfigurasi dasar Axios
const api = axios.create({
  // Ganti IP ini dengan IP Komputer Anda (Bukan 127.0.0.1 agar terbaca di HP/Emulator)
  baseURL: "http://10.89.16.228:8000/api",
});

// Interceptor: Menambahkan token secara otomatis ke setiap request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;