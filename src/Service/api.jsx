import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.89.16.228:8000/api",
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");

    if (__DEV__) {
      console.log("=== TOKEN ===", token);
      console.log("=== URL ===", config.url);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("name");
      await SecureStore.deleteItemAsync("email");
      // opsional: arahkan ke screen login
    }
    return Promise.reject(error);
  }
);

export default api;