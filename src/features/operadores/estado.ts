import type { EstadoOperador } from "./api";

export const ESTADO_OPERADOR: Record<EstadoOperador, { etiqueta: string; clase: string }> = {
  ACTIVO: { etiqueta: "Activo", clase: "border-teal-500/30 bg-teal-500/10 text-teal-400" },
  DE_LICENCIA: { etiqueta: "De licencia", clase: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  INACTIVO: { etiqueta: "Inactivo", clase: "border-slate-500/30 bg-slate-500/10 text-slate-400" },
};
