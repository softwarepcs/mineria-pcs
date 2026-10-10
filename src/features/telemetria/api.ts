import { apiClient } from "@/shared/api/client";

export interface Lectura {
  id: string;
  maquinariaId: string;
  timestamp: string;
  /** Operador asignado a la unidad cuando llegó la lectura. */
  operador: string | null;
  lat: number | null;
  lng: number | null;
  velocidad: number | null;
  rumbo: number | null;
  temIngreso: number | null;
  temRetorno: number | null;
  rpm: number | null;
  flujoIn: number | null;
  flujoRet: number | null;
  consumoGh: number | null;
  totalGal: number | null;
  odometro: number | null;
  porcPaso: number | null;
}

/** Lecturas entre dos instantes (ISO). El backend limita el rango a 90 días. Se devuelven en orden cronológico. */
export async function getLecturas(maquinariaId: number, desde: string, hasta: string, limite = 5000): Promise<Lectura[]> {
  const { data } = await apiClient.get<Lectura[]>(`/telemetria/maquinaria/${maquinariaId}`, {
    params: { fechaInicio: desde, fechaFin: hasta, limite },
  });
  return [...data].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export interface CampoSistema {
  clave: string;
  etiqueta: string;
  unidad: string;
  tipo: "number" | "boolean" | "string";
  decimales: number;
  /** Se dibuja como serie en el detalle de la unidad. */
  grafico: boolean;
}

export type ValorCampo = number | boolean | string | null;

/** Lecturas de UN sistema de la unidad, con los campos que ese sistema declara. */
export interface LecturasSistema {
  sistema: { id: number; nombre: string };
  campos: CampoSistema[];
  ultima: { timestamp: string; valores: Record<string, ValorCampo> } | null;
  serie: { timestamp: string; valores: Record<string, ValorCampo> }[];
}

export async function getLecturasSistema(maquinariaId: number, sistemaId: number, horas: number): Promise<LecturasSistema> {
  const { data } = await apiClient.get<LecturasSistema>(`/telemetria/maquinaria/${maquinariaId}/sistemas/${sistemaId}`, { params: { horas } });
  return data;
}
