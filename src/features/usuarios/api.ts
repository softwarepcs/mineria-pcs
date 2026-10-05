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

export async function crearUsuario(data: any) {
  const res = await apiClient.post("/usuarios", data);
  return res.data;
}

export async function actualizarUsuario(id: number, data: any) {
  const res = await apiClient.patch(`/usuarios/${id}`, data);
  return res.data;
}

export async function eliminarUsuario(id: number) {
  await apiClient.delete(`/usuarios/${id}`);
}
