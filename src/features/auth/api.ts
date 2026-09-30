import { apiClient } from "@/shared/api/client";
import type { UsuarioSesion } from "@/types";

interface RespuestaLogin {
  access_token: string;
  usuario: { id: number; nombres: string; empresa?: string | null };
  roles: string[];
  empresaId: number | null;
}

export async function login(email: string, password: string): Promise<{ usuario: UsuarioSesion; token: string }> {
  const { data } = await apiClient.post<RespuestaLogin>("/auth/login", { email, password });
  return {
    token: data.access_token,
    usuario: {
      id: data.usuario.id,
      email,
      nombre: data.usuario.nombres,
      roles: data.roles ?? [],
      empresaId: data.empresaId ?? null,
      empresaNombre: data.usuario.empresa ?? undefined,
    },
  };
}
