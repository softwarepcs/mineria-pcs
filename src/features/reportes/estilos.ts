import type { EstadoFlota } from "@/features/flota/api";
import { nombreRegla, sev } from "@/features/alertas/estilos";
import type { AlertaReporte } from "./api";

/** Colores validados contra el fondo #0d1117 (contraste ≥ 3:1 y separables con daltonismo). */
export const ESTADO: Record<EstadoFlota, { color: string; etiqueta: string }> = {
  conduccion: { color: "#109c7c", etiqueta: "Conducción" },
  ralenti: { color: "#b5792c", etiqueta: "Ralentí" },
  offline: { color: "#2b3442", etiqueta: "Offline" },
};

export const ESTADOS_ORDEN: EstadoFlota[] = ["conduccion", "ralenti", "offline"];

const COLOR_GEOCERCA = "#60a5fa";

export const colorAlerta = (a: AlertaReporte) => (a.origen === "GEOCERCA" ? COLOR_GEOCERCA : sev(a.severidad).strip);

export const nombreAlerta = (a: AlertaReporte) => (a.origen === "GEOCERCA" ? `Geocerca: ${a.tipo}` : nombreRegla(a.tipo));

export const etiquetaSeveridad = (a: AlertaReporte) => (a.origen === "GEOCERCA" ? "Informativa" : sev(a.severidad).etiqueta);
