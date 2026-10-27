import { fechaHora, hora } from "@/shared/utils/formato";
import type { EstadoFlota } from "./api";

/**
 * Colores y etiquetas de los 4 estados de una unidad. Los usan el mapa, las tablas, el panel y
 * la línea de tiempo: una sola definición. El cálculo lo hace el backend (common/utils/estado-unidad.ts).
 */
export const ESTADO_UNIDAD: Record<EstadoFlota, { color: string; etiqueta: string; corta: string }> = {
  conduccion: { color: "#15E462", etiqueta: "En ruta", corta: "En ruta" },
  ralenti: { color: "#FCC908", etiqueta: "Ralentí", corta: "Ralentí" },
  apagado: { color: "#AABAD0", etiqueta: "Apagado", corta: "Apagado" },
  sin_senal: { color: "#F64651", etiqueta: "Sin comunicación", corta: "Sin com." },
};

export const ESTADOS_ORDEN: EstadoFlota[] = ["conduccion", "ralenti", "apagado", "sin_senal"];

/** "Ralentí desde 13:36" (hoy) o "Ralentí desde 23/10 22:10" (otro día). */
export function textoEstado(estado: EstadoFlota, desde: string | null | undefined): string {
  const { etiqueta } = ESTADO_UNIDAD[estado];
  if (!desde) return etiqueta;
  const d = new Date(desde);
  if (Number.isNaN(d.getTime())) return etiqueta;
  const hoy = new Date();
  const mismoDia = d.toDateString() === hoy.toDateString();
  return `${etiqueta} desde ${mismoDia ? hora(d) : fechaHora(d).slice(0, 11).replace("/2026", "") + hora(d)}`;
}
