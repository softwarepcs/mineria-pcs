import type { Permisos } from "@/auth/permisos";

export interface UsuarioSesion {
  id: number;
  email: string;
  nombre: string;
  /** Roles tal como los devuelve el backend ("SuperAdmin", "Administrador", …). */
  roles: string[];
  empresaId: number | null;
  empresaNombre?: string;
}

export interface Sesion {
  usuario: UsuarioSesion;
  permisos: Permisos;
  fechaInicio: string;
  token: string;
}

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
}
