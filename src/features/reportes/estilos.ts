import type { EstadoFlota } from "@/features/flota/api";
import { ESTADO_UNIDAD } from "@/features/flota/estado";

/** Los mismos colores y nombres que el resto de la plataforma (features/flota/estado.ts). */
export const ESTADO: Record<EstadoFlota, { color: string; etiqueta: string }> = ESTADO_UNIDAD;

export { ESTADOS_ORDEN } from "@/features/flota/estado";
