import axios from "axios";
import { limpiarSesion, obtenerSesion } from "@/utils/session";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = obtenerSesion()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      // Token vencido o inválido: se limpia la sesión y se recarga en /login,
      // lo que también descarta la caché de consultas en memoria.
      limpiarSesion();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
