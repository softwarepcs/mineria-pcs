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

export interface MaquinariaReporte {
  id: number;
  nombre: string;
  placa: string;
  segmentos: SegmentoReporte[];
  alertas: AlertaReporte[];
  consumoGal: number;
  distanciaKm: number;
}

export interface ReporteEventos {
  desde: string;
  hasta: string;
  maquinarias: MaquinariaReporte[];
  totales: {
    consumoGal: number;
    distanciaKm: number;
    horasConduccion: number;
    horasRalenti: number;
    horasOffline: number;
  };
}

/** Ventana móvil [ahora − periodo, ahora]. Sin `maquinariaId` = toda la flota. */
export async function getReporteEventos(empresaId: number, periodo: PeriodoReporte, maquinariaId: number | null): Promise<ReporteEventos> {
  const { data } = await apiClient.get<ReporteEventos>("/reportes/eventos", {
    params: { empresaId, periodo, maquinariaId: maquinariaId ?? undefined },
  });
  return data;
}
