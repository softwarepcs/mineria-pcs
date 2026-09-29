import axios from 'axios';
import { limpiarSesion, obtenerSesion } from '@/utils/session';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token en cada petición
apiClient.interceptors.request.use((config) => {
  const session = obtenerSesion();
  const token = session?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores globales (ej: 401)
apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    if (error.config?.url?.includes('/auth/login')) return Promise.reject(error);
    // Si el token expira o es inválido, limpiamos la sesión
    limpiarSesion();
    
    
    // Si usamos Zustand, aquí podríamos despachar una acción de logout,
    // o recargar la página para que el router expulse al usuario.
    // Para simplificar, recargamos la página.
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
