import type { Sesion } from "@/types";

const SESSION_KEY = "multiempresa_sesion";

// El access token (15 min) vive solo en memoria: no se guarda en localStorage ni en cookies legibles.
// La renovación usa la cookie HttpOnly del refresh token, que JavaScript no puede leer.
let accessToken: string | null = null;
export const obtenerAccessToken = () => accessToken;
export const fijarAccessToken = (t: string | null) => {
  accessToken = t;
};

/** Solo datos de interfaz (nombre, roles…), nada secreto. El servidor valida los permisos en cada petición. */
export type SesionGuardada = Pick<Sesion, "usuario" | "fechaInicio">;

export function guardarSesion(sesion: SesionGuardada): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ usuario: sesion.usuario, fechaInicio: sesion.fechaInicio }));
}

export function obtenerSesion(): SesionGuardada | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SesionGuardada;
    // Formatos anteriores (con tokens guardados o rol numérico) obligan a volver a entrar y se descartan
    if ("token" in (s as object) || "refreshToken" in (s as object) || !Array.isArray(s?.usuario?.roles)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function limpiarSesion(): void {
  accessToken = null;
  localStorage.removeItem(SESSION_KEY);
}

/** Clave de almacenamiento, para escuchar cambios de sesión desde otras pestañas. */
export const CLAVE_SESION = SESSION_KEY;
