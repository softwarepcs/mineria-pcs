import type { EstadoFlota } from "@/features/flota/api";
import { COLOR_CONSUMO, COLOR_GEOCERCA, nombreRegla } from "@/features/alertas/estilos";
import type { AlertaReporte } from "./api";
import { ESTADO_UNIDAD } from "@/features/flota/estado";

/** Los mismos colores y nombres que el resto de la plataforma (features/flota/estado.ts). */
export const ESTADO: Record<EstadoFlota, { color: string; etiqueta: string }> = ESTADO_UNIDAD;

export { ESTADOS_ORDEN } from "@/features/flota/estado";

export const colorAlerta = (a: AlertaReporte) => (a.origen === "GEOCERCA" ? COLOR_GEOCERCA : COLOR_CONSUMO);

export const nombreAlerta = (a: AlertaReporte) => (a.origen === "GEOCERCA" ? `Geocerca: ${a.tipo}` : nombreRegla(a.tipo));

export const etiquetaSeveridad = (a: AlertaReporte) => (a.origen === "GEOCERCA" ? "Informativa" : a.fin ? "Cerrado" : "Abierto");
