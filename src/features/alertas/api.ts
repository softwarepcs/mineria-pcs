import { apiClient } from "@/shared/api/client";

/** Una alerta de consumo está ABIERTO mientras dure la condición y pasa sola a CERRADO; las de geocerca son INFORMATIVAS. */
export type Situacion = "ABIERTO" | "CERRADO" | "INFORMATIVA";
export type TipoAlerta = "CONSUMO" | "GEOCERCA";

/** Fila del historial unificado (GET /alertas/historial). */
export interface FilaHistorial {
  id: string;
  tipo: TipoAlerta;
  situacion: Situacion;
  fechaHora: string;
  fechaFin: string | null;
  maquinariaId: number;
  placa: string;
  conductor: string | null;
  /** CONSUMO: velocidad (km/h) al dispararse */
  valor: number | null;
  galonesDia: number | null;
  km: number | null;
  /** CONSUMO: duración; GEOCERCA: permanencia (solo en salidas) */
  duracionMin: number | null;
  /** GEOCERCA */
  geocerca: string | null;
  tipoEvento: "ENTRADA" | "SALIDA" | null;
  latitud: number | null;
  longitud: number | null;
}

export interface PaginaHistorial {
  items: FilaHistorial[];
  total: number;
  page: number;
  limit: number;
  hayMas: boolean;
  resumen: { abiertas: number; cerradas: number; informativas: number; consumo: number; geocerca: number };
}

export interface FiltroHistorial {
  desde?: string;
  hasta?: string;
  tipo?: TipoAlerta;
  situacion?: Situacion;
  maquinariaId?: number;
}

export async function getHistorial(empresaId: number, f: FiltroHistorial, page = 1, limit = 50): Promise<PaginaHistorial> {
  const { data } = await apiClient.get<PaginaHistorial>("/alertas/historial", { params: { empresaId, ...f, page, limit } });
  return data;
}

/** Todas las filas del rango (para exportar), pidiendo páginas de 500. */
export async function getHistorialCompleto(empresaId: number, f: FiltroHistorial): Promise<FilaHistorial[]> {
  const filas: FilaHistorial[] = [];
  for (let page = 1; page <= 40; page++) {
    const r = await getHistorial(empresaId, f, page, 500);
    filas.push(...r.items);
    if (!r.hayMas) break;
  }
  return filas;
}

/** Última alerta de consumo de un camión (GET /alertas/consumo/ultimas). */
export interface UltimaConsumo {
  maquinariaId: number;
  placa: string;
  alerta: {
    id: string;
    fechaHora: string;
    fechaFin: string | null;
    situacion: "ABIERTO" | "CERRADO";
    duracionMin: number;
    conductor: string | null;
    velocidadKmH: number | null;
    galonesDia: number | null;
    km: number | null;
    galonesAlerta: number | null;
    velocidadMedia: number | null;
    latitud: number | null;
    longitud: number | null;
  } | null;
}

export async function getUltimasConsumo(empresaId: number, situacion?: "ABIERTO" | "CERRADO"): Promise<UltimaConsumo[]> {
  const { data } = await apiClient.get<UltimaConsumo[]>("/alertas/consumo/ultimas", { params: { empresaId, situacion } });
  return data;
}

/** Configuración de avisos por tipo de alerta (`GET /alertas/config`). */
export interface TipoConfig {
  tipo: TipoAlerta;
  activa: boolean;
  canalPlataforma: boolean;
}

/** Resumen de usuario perteneciente a la empresa (`GET /alertas/config`). */
export interface UsuarioAviso {
  id: number;
  nombre: string;
  email: string | null;
  estado: string;
  roles: string[];
  ultimoIngresoEn: string | null;
}

/** Respuesta completa de configuración de alertas y usuarios de la empresa. */
export interface ConfigAlertas {
  tipos: TipoConfig[];
  usuarios: UsuarioAviso[];
}

/** Obtiene la configuración de alertas y el listado de usuarios de la empresa. */
export async function getConfigAlertas(empresaId: number): Promise<ConfigAlertas> {
  const { data } = await apiClient.get<ConfigAlertas>("/alertas/config", { params: { empresaId } });
  return data;
}

/** Actualiza el estado de activación o canal de plataforma de un tipo de alerta. */
export async function guardarConfigAlerta(empresaId: number, tipo: TipoAlerta, cambios: Partial<Pick<TipoConfig, "activa" | "canalPlataforma">>) {
  const { data } = await apiClient.put(`/alertas/config/${tipo}`, cambios, { params: { empresaId } });
  return data;
}
