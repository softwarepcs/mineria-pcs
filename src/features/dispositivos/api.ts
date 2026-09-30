import { apiClient } from "@/shared/api/client";

export interface Sistema {
  id: number;
  nombre: string;
}

export interface Instalacion {
  id: number;
  activa: boolean;
  fechaInicio: string;
  fechaFin: string | null;
  dispositivo: { id: number; imei: string; modelo: string | null; ultimaConexionEn: string };
  sistema: Sistema;
  maquinaria: { id: number; identificador: string };
  sede: { id: number; nombre: string };
  empresaId: number;
}

export interface NuevaInstalacion {
  imei: string;
  modelo?: string;
  maquinariaId: number;
  sistemaId: number;
}

export async function getSistemas(): Promise<Sistema[]> {
  const { data } = await apiClient.get<Sistema[]>("/dispositivos/sistemas");
  return data;
}

export async function getInstalaciones(empresaId: number, soloActivas: boolean): Promise<Instalacion[]> {
  const { data } = await apiClient.get<Instalacion[]>("/dispositivos", { params: { empresaId, activas: soloActivas ? "true" : undefined } });
  return data;
}

export async function instalarDispositivo(dto: NuevaInstalacion): Promise<Instalacion> {
  const { data } = await apiClient.post<Instalacion>("/dispositivos/instalar", dto);
  return data;
}

export async function retirarDispositivo(instalacionId: number): Promise<Instalacion> {
  const { data } = await apiClient.patch<Instalacion>(`/dispositivos/instalaciones/${instalacionId}/retirar`);
  return data;
}
