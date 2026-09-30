import type { Sesion } from "@/types";

const SESSION_KEY = "multiempresa_sesion";

export function guardarSesion(sesion: Sesion): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
}

export function obtenerSesion(): Sesion | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Sesion;
    // Sesiones guardadas con el formato anterior (rol numérico) obligan a volver a entrar
    return s?.token && Array.isArray(s.usuario?.roles) ? s : null;
  } catch {
    return null;
  }
}

export function limpiarSesion(): void {
  localStorage.removeItem(SESSION_KEY);
}
