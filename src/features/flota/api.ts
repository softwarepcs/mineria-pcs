import { apiClient } from "@/shared/api/client";

export type Periodo = 1 | 7 | 30 | 90;

export interface FlotaResumen {
  equipos: number;
  reportando: number;
  periodo: string;
  periodoDias: number;
  desde: string;
  configurado: boolean;
  ralentiEstimado: boolean;
  objetivoL100km: number;
  precioUsdPorL: number;
  kmTotal: number;
  consumoTotalL: number;
  costoUsd: number;
  rendimientoMedioL100km: number;
  desvioVsObjetivoPct: number;
  ralentiFlotaPct: number;
  ralentiLitros: number;
  ralentiUsd: number;
  emisionesCo2Ton: number;
  horasMotor: number;
}

export type EstadoFlota = "conduccion" | "ralenti" | "offline";

/** Estadísticas de una unidad en el período. */
export interface MaquinariaStats {
  id: string;
  placa: string;
  km: number;
  litros: number;
  l100km: number;
  desvioPct: number;
  ralentiPct: number;
  horas: number;
  pctGasto: number;
  co2Ton: number;
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
