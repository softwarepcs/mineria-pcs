import type { Sesion } from "../types";

const SESSION_KEY = "multiempresa_sesion";

export function guardarSesion(sesion: Sesion): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
}

export function obtenerSesion(): Sesion | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
