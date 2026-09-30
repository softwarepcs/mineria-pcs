import type { EstadoLicencia, EstadoOperador } from "./api";

export const ESTADO_OPERADOR: Record<EstadoOperador, { etiqueta: string; clase: string }> = {
  ACTIVO: { etiqueta: "Activo", clase: "border-teal-500/30 bg-teal-500/10 text-teal-400" },
  DE_LICENCIA: { etiqueta: "De licencia", clase: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  INACTIVO: { etiqueta: "Inactivo", clase: "border-slate-500/30 bg-slate-500/10 text-slate-400" },
};

export const ESTADO_LICENCIA: Record<EstadoLicencia, { etiqueta: string; punto: string; texto: string }> = {
  VIGENTE: { etiqueta: "Vigente", punto: "bg-teal-500", texto: "text-teal-400" },
  POR_VENCER: { etiqueta: "Por vencer", punto: "bg-amber-500", texto: "text-amber-400" },
  VENCIDA: { etiqueta: "Vencida", punto: "bg-red-500", texto: "text-red-400" },
  SIN_LICENCIA: { etiqueta: "Sin licencia", punto: "bg-slate-500", texto: "text-slate-400" },
};
