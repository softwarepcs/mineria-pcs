import { apiClient, type RespuestaSesion } from "@/shared/api/client";
import type { UsuarioSesion } from "@/types";

/** Convierte la respuesta del servidor (login o renovación) en el usuario de la sesión. */
export function usuarioDeRespuesta(data: RespuestaSesion, email: string): UsuarioSesion {
  return {
    id: data.usuario.id,
    email,
    nombre: data.usuario.nombres,
    roles: data.roles ?? [],
    permisos: data.permisos ?? [],
    empresaId: data.empresaId ?? null,
    empresaNombre: data.usuario.empresa ?? undefined,
  };
}

export async function login(email: string, password: string): Promise<{ usuario: UsuarioSesion; token: string }> {
  // withCredentials: el navegador acepta la cookie HttpOnly con el refresh token
  const { data } = await apiClient.post<RespuestaSesion>("/auth/login", { email, password }, { withCredentials: true });
  return { token: data.access_token, usuario: usuarioDeRespuesta(data, email) };
}

/** Cierra la sesión en el servidor (revoca el refresh token y borra la cookie). Si falla, el cierre local igual se hace. */
export async function cerrarSesionEnServidor(): Promise<void> {
  try {
    await apiClient.post("/auth/logout", {}, { withCredentials: true });
  } catch {
    /* la cookie caduca sola */
  }
}
