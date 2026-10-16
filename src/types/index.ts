import type { Permisos } from "@/auth/permisos";

export interface UsuarioSesion {
  id: number;
  email: string;
  nombre: string;
  /** Roles tal como los devuelve el backend ("SuperAdmin", "Administrador", …). */
  roles: string[];
  permisos: string[];
  empresaId: number | null;
  empresaNombre?: string;
}

export interface Sesion {
  usuario: UsuarioSesion;
  permisos: Permisos;
  fechaInicio: string;
  // Los tokens no forman parte de la sesión guardada: el access token vive en memoria y el refresh token en una cookie HttpOnly.
}

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
}
