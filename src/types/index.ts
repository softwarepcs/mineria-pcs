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
  /** Número en rojo a la derecha (p. ej. alertas abiertas). Se oculta si es 0. */
  badge?: number;
  /** Activo solo con la ruta exacta (Home, que es el prefijo de todas las demás). */
  end?: boolean;
}

/** Grupo del menú con su título ("PLATAFORMA", "COMBUSTIBLE"…). */
export interface MenuSeccion {
  titulo: string;
  items: MenuItem[];
}
