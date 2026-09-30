import type { EstadoFlota } from "./api";

/**
 * Colores y etiquetas de los tres estados de una unidad. Los usan el mapa de
 * flota, la lista de unidades, el panel y la ficha: una sola definición.
 * El cálculo lo hace el backend (common/utils/estado-unidad.ts).
 */
export const ESTADO_UNIDAD: Record<EstadoFlota, { color: string; etiqueta: string }> = {
  conduccion: { color: "#22c55e", etiqueta: "En conducción" },
  ralenti: { color: "#f59e0b", etiqueta: "Ralentí" },
  offline: { color: "#64748b", etiqueta: "Offline" },
};
