import type { UsuarioSesion, Permisos } from "../types";

const API_URL = 'http://localhost:3000';

/**
 * Conecta con la API real del backend para la autenticación
 */
export async function login(
  email: string,
  password: string
): Promise<UsuarioSesion> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // El backend recibe 'email'
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const data = await response.json();
  
  // Guardar token JWT globalmente (para las siguientes llamadas)
  localStorage.setItem('token', data.access_token);

  // Mapear respuesta del backend a la interfaz del frontend
  return {
    id: data.usuario.id,
    email: email,
    nombre: data.usuario.nombres,
    rol: data.roles?.includes('SuperAdmin') ? 1 : data.roles?.includes('Admin') ? 2 : 3,
    empresaId: data.empresaId || null
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
