import { apiClient } from "@/shared/api/client";

export interface EmpresaResumen {
  id: number;
  token: string;
  nombre: string;
  estado: boolean;
  indicadores: { unidades: number; alertasAbiertas: number; disponibilidadPct: number | null };
}

export interface Sede {
  id: number;
  empresaId: number;
  nombre: string;
  ciudad: string;
  estado: boolean;
}

export interface EmpresaDetalle {
  id: number;
  token: string;
  nombre: string;
  estado: boolean;
  zonaHoraria: string;
  sedes: Sede[];
}

interface EmpresaApi {
  id: number;
  token: string;
  nombreRazonSocial: string;
  estado: boolean;
  zonaHoraria: string;
  sedes?: Sede[];
  indicadores?: EmpresaResumen["indicadores"];
}

export async function listarEmpresas(): Promise<EmpresaResumen[]> {
  const { data } = await apiClient.get<EmpresaApi[]>("/empresas");
  return data.map((e) => ({
    id: e.id,
    token: e.token,
    nombre: e.nombreRazonSocial,
    estado: e.estado,
    indicadores: e.indicadores ?? { unidades: 0, alertasAbiertas: 0, disponibilidadPct: null },
  }));
}

export async function obtenerEmpresa(id: number): Promise<EmpresaDetalle> {
  const { data } = await apiClient.get<EmpresaApi>(`/empresas/${id}`);
  return {
    id: data.id,
    token: data.token,
    nombre: data.nombreRazonSocial,
    estado: data.estado,
    zonaHoraria: data.zonaHoraria,
    sedes: (data.sedes ?? []).filter((s) => s.estado),
  };
}

export async function obtenerEmpresaPorToken(token: string): Promise<EmpresaDetalle> {
  const { data } = await apiClient.get<EmpresaApi>(`/empresas/by-token/${token}`);
  return {
    id: data.id,
    token: data.token,
    nombre: data.nombreRazonSocial,
    estado: data.estado,
    zonaHoraria: data.zonaHoraria,
    sedes: (data.sedes ?? []).filter((s) => s.estado),
  };
}

export async function crearEmpresa(data: any): Promise<EmpresaApi> {
  const res = await apiClient.post<EmpresaApi>("/empresas", data);
  return res.data;
}

export async function actualizarEmpresa(id: number, data: any): Promise<EmpresaApi> {
  const res = await apiClient.patch<EmpresaApi>(`/empresas/${id}`, data);
  return res.data;
}

export async function cambiarEstadoEmpresa(id: number, estado: boolean): Promise<EmpresaApi> {
  const res = await apiClient.patch<EmpresaApi>(`/empresas/${id}/estado`, { estado });
  return res.data;
}

export async function eliminarEmpresa(id: number): Promise<void> {
  await apiClient.delete(`/empresas/${id}`);
}
