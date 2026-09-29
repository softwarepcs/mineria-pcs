import type { UsuarioSesion, Permisos } from "@/types";

import { apiClient } from "@/utils/apiClient";
/**
 * Conecta con la API real del backend para la autenticación
 */
export async function login(
  email: string,
  password: string
): Promise<{ usuario: UsuarioSesion, token: string }> {
  const response = await apiClient.post('/auth/login', { email, password });
  const data = response.data;
  
  return {
    usuario: {
      id: data.usuario.id,
      email: email,
      nombre: data.usuario.nombres,
      rol: data.roles?.includes('SuperAdmin') ? 1 : (data.roles?.includes('Administrador') ? 2 : 3),
      rolesBackend: data.roles || [],
      empresaId: data.empresaId || null
    },
    token: data.access_token
  };
}

export function obtenerPermisos(rol: number): Permisos {
  switch (rol) {
    case 1:
      return {
        verTodasLasEmpresas: true,
        gestionarUsuarios: true,
        verConfiguracion: true,
        verReportes: true,
      };
    case 2:
      return {
        verTodasLasEmpresas: true,
        gestionarUsuarios: false,
        verConfiguracion: true,
        verReportes: true,
      };
    case 3:
    default:
      return {
        verTodasLasEmpresas: false,
        gestionarUsuarios: false,
        verConfiguracion: false,
        verReportes: true,
      };
  }
}
