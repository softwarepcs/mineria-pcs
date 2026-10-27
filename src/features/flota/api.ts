import { apiClient } from "@/shared/api/client";

export type Periodo = 1 | 7;

export interface FlotaResumen {
  equipos: number;
  reportando: number;
  periodo: string;
  periodoDias: number;
  desde: string;
  configurado: boolean;
  objetivoL100km: number;
  kmTotal: number;
  consumoTotalL: number;
  consumoMedioL100km: number;
  desvioVsObjetivoPct: number;
  ralentiLitros: number;
  ralentiHoras: number;
  sobrecargaLitros: number;
  sobrecargaHoras: number;
  emisionesCo2Ton: number;
  emisionesCo2Kg: number;
  horasMotor: number;
}

/**
 * Los 4 estados de una unidad (los calcula el backend, common/utils/estado-unidad.ts):
 * conduccion = "En ruta", ralenti, apagado (ignición apagada) y sin_senal ("Sin comunicación").
 */
export type EstadoFlota = "conduccion" | "ralenti" | "apagado" | "sin_senal";

export const ESTADOS_ORDEN: EstadoFlota[] = ["conduccion", "ralenti", "apagado", "sin_senal"];

/** Estadísticas de una unidad en el período. */
export interface MaquinariaStats {
  id: string;
  placa: string;
  km: number;
  litros: number;
  l100km: number;
  consumoMedioL100km: number;
  desvioPct: number;
  ralentiLitros: number;
  ralentiHoras: number;
  sobrecargaLitros: number;
  sobrecargaHoras: number;
  horas: number;
  co2Ton: number;
  co2Kg: number;
  estado: EstadoFlota;
  /** null si la unidad nunca envió posición. */
  lat: number | null;
  lng: number | null;
  ultimaLectura: string | null;
}

export interface FlotaDashboard {
  resumen: FlotaResumen;
  maquinarias: MaquinariaStats[];
}

export async function getFlotaDashboard(empresaId: number, dias: Periodo): Promise<FlotaDashboard> {
  const { data } = await apiClient.get<FlotaDashboard>("/analytics/flota/dashboard", { params: { empresaId, dias } });
  return data;
}
