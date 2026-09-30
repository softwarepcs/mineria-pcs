import { apiClient } from "@/shared/api/client";

export interface EmpresaResumen {
  id: number;
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
  nombre: string;
  estado: boolean;
  zonaHoraria: string;
  sedes: Sede[];
}

interface EmpresaApi {
  id: number;
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
    nombre: e.nombreRazonSocial,
    estado: e.estado,
    indicadores: e.indicadores ?? { unidades: 0, alertasAbiertas: 0, disponibilidadPct: null },
  }));
}

export async function obtenerEmpresa(id: number): Promise<EmpresaDetalle> {
  const { data } = await apiClient.get<EmpresaApi>(`/empresas/${id}`);
  return {
    id: data.id,
    nombre: data.nombreRazonSocial,
    estado: data.estado,
    zonaHoraria: data.zonaHoraria,
    sedes: (data.sedes ?? []).filter((s) => s.estado),
  };
}
