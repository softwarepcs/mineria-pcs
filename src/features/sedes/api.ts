import { apiClient } from "@/shared/api/client";

export interface Sede {
  id: number;
  empresaId: number;
  nombre: string;
  ciudad: string;
  estado: boolean;
}

export async function listarSedes(): Promise<Sede[]> {
  const { data } = await apiClient.get<Sede[]>("/sedes");
  return data;
}

export async function crearSede(data: any): Promise<Sede> {
  const res = await apiClient.post<Sede>("/sedes", data);
  return res.data;
}

export async function actualizarSede(id: number, data: any): Promise<Sede> {
  const res = await apiClient.patch<Sede>(`/sedes/${id}`, data);
  return res.data;
}

export async function eliminarSede(id: number): Promise<void> {
  await apiClient.delete(`/sedes/${id}`);
}
