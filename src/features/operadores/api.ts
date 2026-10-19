import { apiClient } from "@/shared/api/client";

export const ESTADOS_OPERADOR = ["ACTIVO", "DE_LICENCIA", "INACTIVO"] as const;
export type EstadoOperador = (typeof ESTADOS_OPERADOR)[number];

/** Igual a la respuesta de GET /operadores y GET /operadores/:id. */
export interface Operador {
  id: number;
  empresaId: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  legajo: string | null;
  numeroDocumento: string | null;
  estado: EstadoOperador;
  creadoEn: string;
  sede: { id: number; nombre: string } | null;
  asignacion: { id: number; maquinariaId: number; maquinaria: string; desde: string } | null;
}

/** Igual a CreateOperadoreDto del backend. */
export interface NuevoOperador {
  empresaId?: number;
  nombres: string;
  apellidos?: string;
  legajo?: string;
  numeroDocumento?: string;
  estado?: EstadoOperador;
  sedeId?: number;
  maquinariaId?: number;
}

export type CambiosOperador = Omit<Partial<NuevoOperador>, "empresaId" | "maquinariaId">;

export interface Rendimiento {
  periodoDias: number;
  desde: string;
  totales: { km: number; litros: number; horasMotor: number; diasConActividad: number; l100km: number | null };
  serieDiaria: { fecha: string; maquinaria: string; km: number; litros: number; horasMotor: number; l100km: number | null }[];
  asignaciones: {
    id: number;
    maquinariaId: number;
    maquinaria: string;
    estado: string;
    fechaInicio: string;
    fechaFin: string | null;
    km: number;
    litros: number;
    horasMotor: number;
  }[];
}

/** Quita los campos vacíos: el backend valida "" como dato (p. ej. fecha inválida). */
export function limpiar<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null)) as T;
}

export async function getOperadores(empresaId?: number): Promise<Operador[]> {
  const { data } = await apiClient.get<Operador[]>("/operadores", { params: { empresaId } });
  return data;
}

export async function getOperador(id: number): Promise<Operador> {
  const { data } = await apiClient.get<Operador>(`/operadores/${id}`);
  return data;
}

export async function crearOperador(dto: NuevoOperador): Promise<Operador> {
  const { data } = await apiClient.post<Operador>("/operadores", limpiar(dto));
  return data;
}

export async function actualizarOperador(id: number, dto: CambiosOperador): Promise<Operador> {
  const { data } = await apiClient.patch<Operador>(`/operadores/${id}`, limpiar(dto));
  return data;
}

export async function darDeBajaOperador(id: number): Promise<void> {
  await apiClient.delete(`/operadores/${id}`);
}

export async function asignarUnidad(id: number, maquinariaId: number): Promise<Operador> {
  const { data } = await apiClient.post<Operador>(`/operadores/${id}/asignar-maquinaria`, { maquinariaId });
  return data;
}

export async function liberarUnidad(id: number): Promise<Operador> {
  const { data } = await apiClient.post<Operador>(`/operadores/${id}/liberar-maquinaria`);
  return data;
}

export async function getRendimiento(id: number, dias: 7 | 30 | 90 | 365): Promise<Rendimiento> {
  const { data } = await apiClient.get<Rendimiento>(`/operadores/${id}/rendimiento`, { params: { dias } });
  return data;
}
