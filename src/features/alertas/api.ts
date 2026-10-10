import { apiClient } from "@/shared/api/client";

export const ESTADOS_ALERTA = ["GENERADO", "ATENDIDO", "CERRADO"] as const;
export type EstadoAlerta = (typeof ESTADOS_ALERTA)[number];
export type Severidad = "CRITICO" | "ALTO" | "MEDIO" | "BAJO";

export interface AlertaEvento {
  id: string;
  empresaId: number;
  sede: string;
  maquinariaId: number;
  maquinaria: string;
  fechaHora: string;
  valorRegistrado: number;
  valorUmbral: number;
  condicion: string;
  estado: EstadoAlerta;
  severidad: Severidad;
  regla: string;
}

export interface AlertaDetalle extends Omit<AlertaEvento, "sede"> {
  evidencia: {
    metrica: string;
    fechaEvento: string;
    ventanaInicio: string;
    ventanaFin: string;
    ticksTiempo: string[];
    puntosCaudal: (number | null)[];
    puntosVelocidad: (number | null)[];
    caudalMax: number | null;
    velocidadMax: number | null;
  };
  metricas: {
    duracionMin: number | null;
    distanciaKm: number | null;
    consumoGal: number | null;
    velocidadMediaKmH: number | null;
    ignicion: boolean | null;
    lecturasSensor: number;
  };
}

export interface AlertaGeocerca {
  id: string;
  empresaId: number;
  geocercaId: number;
  geocerca: string;
  maquinariaId: number;
  maquinaria: string;
  tipoEvento: "ENTRADA" | "SALIDA" | string;
  fechaHora: string;
  latitud: number | null;
  longitud: number | null;
}

export interface AlertasOperador {
  maquinariaId: number;
  maquinaria: string;
  periodo: { inicio: string; fin: string | null };
  eventosMotor: { id: string; regla: string; severidad: Severidad; valor: number; estado: EstadoAlerta; fechaHora: string }[];
  crucesGeocerca: { id: string; geocerca: string; evento: string; fechaHora: string }[];
}

export type RangoAlertas = "todo" | "24h" | "7d" | "30d";

export interface FiltrosAlertas {
  estado: "" | EstadoAlerta;
  severidad: "" | Severidad;
  maquinariaId: number | null;
  rango: RangoAlertas;
}

export interface ResumenAlertas {
  porEstado: Record<EstadoAlerta, number>;
  /** Alertas por severidad dentro del estado filtrado (respeta unidad y periodo). */
  porSeveridad: Record<Severidad, number>;
}

export interface PaginaAlertas {
  items: AlertaEvento[];
  total: number;
  page: number;
  limit: number;
  hayMas: boolean;
  resumen: ResumenAlertas;
}

export const ALERTAS_POR_PAGINA = 50;

const HORAS_RANGO: Record<Exclude<RangoAlertas, "todo">, number> = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 };

export async function getAlertasEventos(empresaId: number, f: FiltrosAlertas, page: number): Promise<PaginaAlertas> {
  // `desde` se calcula al pedir, no al renderizar: así la clave de caché no cambia cada segundo
  const desde = f.rango === "todo" ? undefined : new Date(Date.now() - HORAS_RANGO[f.rango] * 3_600_000).toISOString();
  const { data } = await apiClient.get<PaginaAlertas>("/alertas/eventos", {
    params: {
      empresaId,
      estado: f.estado || undefined,
      severidad: f.severidad || undefined,
      maquinariaId: f.maquinariaId ?? undefined,
      desde,
      page,
      limit: ALERTAS_POR_PAGINA,
    },
  });
  return data;
}

export async function cambiarEstadoMasivo(ids: string[], estado: EstadoAlerta) {
  const { data } = await apiClient.patch<{ solicitadas: number; actualizadas: number; estado: EstadoAlerta }>("/alertas/eventos/estado", { ids, estado });
  return data;
}

export async function getAlertaDetalle(id: string): Promise<AlertaDetalle> {
  const { data } = await apiClient.get<AlertaDetalle>(`/alertas/eventos/${id}`);
  return data;
}

export async function cambiarEstadoAlerta(id: string, estado: EstadoAlerta) {
  const { data } = await apiClient.patch<{ id: string; estado: EstadoAlerta }>(`/alertas/eventos/${id}/estado`, { estado });
  return data;
}

export async function getAlertasGeocerca(empresaId: number): Promise<AlertaGeocerca[]> {
  const { data } = await apiClient.get<AlertaGeocerca[]>("/alertas/geocercas", { params: { empresaId } });
  return data;
}

export async function getAlertasOperador(operadorId: number): Promise<AlertasOperador[]> {
  const { data } = await apiClient.get<AlertasOperador[]>(`/alertas/operador/${operadorId}`);
  return data;
}
