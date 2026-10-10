import { apiClient } from "@/shared/api/client";

import type { EstadoFlota } from "@/features/flota/api";
import type { CampoSistema } from "@/features/telemetria/api";

export type EstadoUnidad = EstadoFlota;
export const ESTADOS_OPERATIVOS = ["Activo", "Mantenimiento", "Fuera de servicio"] as const;

/** Unidad con su estado en vivo (GET /maquinarias/monitoreo). */
export interface Unidad {
  id: number;
  identificador: string;
  marca: string | null;
  modelo: string | null;
  estadoOperativo: string;
  tipoMaquinariaId: number | null;
  tipo: string | null;
  sedeId: number;
  sede: string;
  empresaId: number;
  dispositivo: { id: number; imei: string; modelo: string | null; instaladoEn: string } | null;
  /** conduccion | ralenti | offline — calculado por el backend. */
  estado: EstadoUnidad;
  ultimaConexion: string | null;
  telemetria: {
    timestamp: string;
    lat: number | null;
    lng: number | null;
    velocidad: number | null;
    ignicion: boolean | null;
    rpm: number | null;
    flujoIn: number | null;
    flujoRet: number | null;
    consumoGh: number | null;
  } | null;
  operadorActual: { id: number; nombre: string } | null;
}

export interface TipoMaquinaria {
  id: number;
  nombre: string;
}

export interface NuevaUnidad {
  identificador: string;
  sedeId: number;
  tipoMaquinariaId: number;
  marca?: string;
  modelo?: string;
  estadoOperativo: string;
}

export interface AsignacionHistorial {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string | null;
  atribucion: string | null;
  usuario: { id: number; nombres: string; apellidos: string; legajo: string | null };
}

export interface Configuracion {
  maquinariaId: number;
  objetivoFlotaL100km: number;
  precioUsdPorLitro: number;
  emisionesCo2Factor: number;
}

export async function getUnidades(empresaId?: number): Promise<Unidad[]> {
  const { data } = await apiClient.get<Unidad[]>("/maquinarias/monitoreo", { params: { empresaId } });
  return data;
}

export async function getTiposMaquinaria(): Promise<TipoMaquinaria[]> {
  const { data } = await apiClient.get<TipoMaquinaria[]>("/maquinarias/tipos");
  return data;
}

export async function crearUnidad(dto: NuevaUnidad) {
  const { data } = await apiClient.post("/maquinarias", dto);
  return data as { id: number; identificador: string };
}

export async function actualizarUnidad(id: number, dto: Partial<NuevaUnidad>) {
  const { data } = await apiClient.patch(`/maquinarias/${id}`, dto);
  return data;
}

export async function getHistorialOperadores(maquinariaId: number): Promise<AsignacionHistorial[]> {
  const { data } = await apiClient.get<AsignacionHistorial[]>(`/maquinarias/${maquinariaId}/operadores`);
  return data;
}

export async function getConfiguracion(maquinariaId: number): Promise<Configuracion | null> {
  const { data } = await apiClient.get<Configuracion | null>(`/maquinarias/${maquinariaId}/configuracion`);
  return data || null;
}

export async function guardarConfiguracion(maquinariaId: number, dto: Omit<Configuracion, "maquinariaId">): Promise<Configuracion> {
  const { data } = await apiClient.patch<Configuracion>(`/maquinarias/${maquinariaId}/configuracion`, dto);
  return data;
}

export interface SistemaDeUnidad {
  id: number;
  sistemaId: number;
  estado: boolean;
  sistema: { id: number; nombre: string; campos: CampoSistema[] };
}

export async function getSistemasUnidad(maquinariaId: number): Promise<SistemaDeUnidad[]> {
  const { data } = await apiClient.get<SistemaDeUnidad[]>(`/maquinarias/${maquinariaId}/sistemas`);
  return data;
}
