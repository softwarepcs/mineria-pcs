import usuariosData from "../data/usuarios.json";
import type { Usuario, UsuarioSesion, Permisos } from "../types";

const usuarios = usuariosData as Usuario[];

/**
 * Simula una llamada a API de autenticación.
 * En una fase posterior, este método debe reemplazarse por un
 * fetch/axios hacia un endpoint real (ej. POST /api/auth/login),
 * sin necesidad de modificar los componentes que lo consumen.
 */
export async function login(
  usuario: string,
  password: string
): Promise<UsuarioSesion> {
  // Simula latencia de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  const encontrado = usuarios.find(
    (u) => u.usuario.toLowerCase() === usuario.toLowerCase() && u.password === password
  );

  if (!encontrado) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const { password: _password, ...usuarioSesion } = encontrado;
  return usuarioSesion;
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
