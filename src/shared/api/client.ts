import axios, { type InternalAxiosRequestConfig } from "axios";
import { fijarAccessToken, limpiarSesion, obtenerAccessToken } from "@/utils/session";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const headers = { "Content-Type": "application/json" };

export const apiClient = axios.create({ baseURL, headers });

// Cliente sin interceptores para renovar la sesión (evita bucles)
const clienteRefresh = axios.create({ baseURL, headers });

const RUTAS_SIN_RENOVAR = ["/auth/login", "/auth/refresh", "/auth/logout"];
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

apiClient.interceptors.request.use((config) => {
  const token = obtenerAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface RespuestaSesion {
  access_token: string;
  expires_in: number;
  usuario: { id: number; nombres: string; empresa?: string | null };
  roles: string[];
  permisos?: string[];
  empresaId: number | null;
}

async function pedirRenovacion(): Promise<RespuestaSesion> {
  for (let intento = 0; ; intento++) {
    try {
      // La cookie HttpOnly con el refresh token viaja sola (withCredentials)
      const { data } = await clienteRefresh.post<RespuestaSesion>("/auth/refresh", {}, { withCredentials: true });
      fijarAccessToken(data.access_token);
      return data;
    } catch (err) {
      // 409: otra pestaña está renovando en este instante. Su cookie nueva ya es compartida: se reintenta enseguida.
      if (axios.isAxiosError(err) && err.response?.status === 409 && intento < 8) {
        await esperar(300);
        continue;
      }
      throw err;
    }
  }
}

// Una sola renovación a la vez: las peticiones que fallan juntas esperan la misma
let renovando: Promise<RespuestaSesion> | null = null;

/** Cambia la cookie de refresh por un access token nuevo. Sirve al recargar la página y cuando el access vence. */
export function renovarSesion(): Promise<RespuestaSesion> {
  renovando ??= pedirRenovacion().finally(() => {
    renovando = null;
  });
  return renovando;
}

function cerrarPorSesionInvalida() {
  // Se limpia y se recarga en /login, lo que también descarta la caché de consultas en memoria.
  limpiarSesion();
  window.location.href = "/login";
}

type ConReintento = InternalAxiosRequestConfig & { _reintentado?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as ConReintento | undefined;
    const url: string = config?.url ?? "";
    const esAuth = RUTAS_SIN_RENOVAR.some((r) => url.includes(r));

    if (error.response?.status !== 401 || !config || esAuth || config._reintentado) {
      if (error.response?.status === 401 && !url.includes("/auth/login")) cerrarPorSesionInvalida();
      return Promise.reject(error);
    }

    try {
      const { access_token } = await renovarSesion();
      config._reintentado = true;
      config.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(config);
    } catch {
      cerrarPorSesionInvalida();
      return Promise.reject(error);
    }
  },
);
