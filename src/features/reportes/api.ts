import { apiClient } from "@/shared/api/client";
import type { EstadoFlota } from "@/features/flota/api";

export type PeriodoReporte = "24h" | "7d";

/** Tramo continuo con un mismo estado (GET /reportes/eventos). */
export interface SegmentoReporte {
  estado: EstadoFlota;
  inicio: string;
  fin: string;
  consumoGal: number;
  distanciaKm: number;
}

export interface AlertaReporte {
  id: string;
  origen: "REGLA" | "GEOCERCA";
  /** REGLA: clave de la regla (ej. `velocidad_consumo`). GEOCERCA: nombre de la geocerca. */
  tipo: string;
  /** CRITICO | ALTO | MEDIO | BAJO para reglas; INFO para geocercas. */
  severidad: string;
  inicio: string;
  /** `null` = sin fin registrado (sigue activa o es anterior al cierre automático). */
  fin: string | null;
}

/** Horas y galones acumulados en cada estado. */
export type PorEstado = Record<EstadoFlota, { horas: number; galones: number }>;

export interface MaquinariaReporte {
  id: number;
  nombre: string;
  placa: string;
  segmentos: SegmentoReporte[];
  alertas: AlertaReporte[];
  consumoGal: number;
  distanciaKm: number;
  /** km por galón del periodo; null si no consumió. */
  kmPorGalon: number | null;
  porEstado: PorEstado;
}

export interface ReporteEventos {
  desde: string;
  hasta: string;
  zonaHoraria: string;
  maquinarias: MaquinariaReporte[];
  totales: {
    consumoGal: number;
    distanciaKm: number;
    kmPorGalon: number | null;
    porEstado: PorEstado;
  };
}

/** Ventana móvil [ahora − periodo, ahora]. Sin `maquinariaId` = toda la flota. */
export async function getReporteEventos(empresaId: number, periodo: PeriodoReporte, maquinariaId: number | null): Promise<ReporteEventos> {
  const { data } = await apiClient.get<ReporteEventos>("/reportes/eventos", {
    params: { empresaId, periodo, maquinariaId: maquinariaId ?? undefined },
  });
  return data;
}

/** Columnas de cada fila de lectura, en este orden (el servidor las repite en `columnas`). */
export type FilaLectura = [
  latitud: number | null, longitud: number | null, fecha: string, odometroKm: number | null,
  galPorHora: number | null, totalGal: number | null, caudalIngreso: number | null,
  caudalRetorno: number | null, horometro: number | null,
];

export interface LecturasExportadas {
  zonaHoraria: string;
  desde: string;
  hasta: string;
  total: number;
  maquinarias: { id: number; placa: string; nombre: string; filas: FilaLectura[] }[];
}

/** Rango de fechas locales (YYYY-MM-DD), máx. 3 meses y hasta 18 meses atrás (GET /reportes/lecturas/exportar). */
export async function exportarLecturas(empresaId: number, desde: string, hasta: string, maquinariaIds: number[]): Promise<LecturasExportadas> {
  const { data } = await apiClient.get<LecturasExportadas>("/reportes/lecturas/exportar", {
    params: { empresaId, desde, hasta, maquinariaIds: maquinariaIds.join(",") || undefined },
    timeout: 120_000,
  });
  return data;
}

export interface PaginaLecturas {
  zonaHoraria: string;
  placa: string;
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  filas: FilaLectura[];
}

/** Lecturas de una unidad, paginadas (GET /reportes/lecturas). */
export async function getLecturas(empresaId: number, maquinariaId: number, desde: string, hasta: string, pagina: number, limite: number): Promise<PaginaLecturas> {
  const { data } = await apiClient.get<PaginaLecturas>("/reportes/lecturas", { params: { empresaId, maquinariaId, desde, hasta, pagina, limite } });
  return data;
}

export interface PuntoRecorrido {
  timestamp: string;
  lat: number;
  lng: number;
  velocidad: number | null;
  estado: EstadoFlota;
}

export interface Recorrido {
  maquinaria: { id: number; placa: string; nombre: string };
  zonaHoraria: string;
  totalPuntos: number;
  puntos: PuntoRecorrido[];
}

export async function getRecorrido(empresaId: number, maquinariaId: number, desde: string, hasta: string): Promise<Recorrido> {
  const { data } = await apiClient.get<Recorrido>("/reportes/recorrido", { params: { empresaId, maquinariaId, desde, hasta } });
  return data;
}
