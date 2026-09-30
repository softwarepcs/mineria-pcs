import { apiClient } from "@/shared/api/client";

export interface UsuarioListado {
  id: number;
  email: string | null;
  nombre: string;
  estado: string;
  roles: string[];
  empresa: string | null;
}

interface UsuarioApi {
  id: number;
  email: string | null;
  nombres: string;
  apellidos: string;
  estado: string;
  empresa: { nombreRazonSocial: string } | null;
  roles: { rol: { nombre: string } }[];
}

export async function listarUsuarios(page: number, limit: number) {
  const { data } = await apiClient.get<{ data: UsuarioApi[]; meta: { total: number; page: number; lastPage: number } }>("/usuarios", { params: { page, limit } });
  return {
    meta: data.meta,
    data: data.data.map<UsuarioListado>((u) => ({
      id: u.id,
      email: u.email,
      nombre: `${u.nombres} ${u.apellidos}`.trim(),
      estado: u.estado,
      roles: u.roles.map((r) => r.rol.nombre),
      empresa: u.empresa?.nombreRazonSocial ?? null,
    })),
  };
}
