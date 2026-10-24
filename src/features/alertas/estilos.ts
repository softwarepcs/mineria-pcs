import type { EstadoAlerta, Severidad } from "./api";

export const SEV: Record<Severidad, { strip: string; clase: string; etiqueta: string; corta: string }> = {
  CRITICO: { strip: "#ef5350", clase: "border-[#ef5350] text-[#ef5350] bg-red-500/10", etiqueta: "CRÍTICO", corta: "Crít." },
  ALTO: { strip: "#d99b42", clase: "border-[#d99b42] text-[#d99b42] bg-amber-500/10", etiqueta: "ALTO", corta: "Alto" },
  MEDIO: { strip: "#60a5fa", clase: "border-blue-400 text-blue-400 bg-blue-500/10", etiqueta: "MEDIO", corta: "Medio" },
  BAJO: { strip: "#1a9a7a", clase: "border-teal-500 text-teal-400 bg-teal-500/10", etiqueta: "BAJO", corta: "Bajo" },
};

export const EST: Record<EstadoAlerta, { clase: string; etiqueta: string; punto: string }> = {
  GENERADO: { clase: "border-blue-500/50 text-blue-400 bg-blue-500/10", etiqueta: "SIN ATENDER", punto: "bg-blue-400" },
  ATENDIDO: { clase: "border-green-500/50 text-green-400 bg-green-500/10", etiqueta: "ATENDIDO", punto: "bg-green-400" },
  CERRADO: { clase: "border-white/15 text-slate-400 bg-white/5", etiqueta: "CERRADO", punto: "bg-slate-500" },
};

export const SEVERIDADES_ORDEN: Severidad[] = ["CRITICO", "ALTO", "MEDIO", "BAJO"];

export const sev = (s: string) => SEV[s as Severidad] ?? SEV.BAJO;
export const est = (e: string) => EST[e as EstadoAlerta] ?? EST.CERRADO;
/** Nombres legibles de las reglas conocidas; el resto se muestra con la clave en mayúsculas. */
const NOMBRES_REGLA: Record<string, string> = {
  velocidad_consumo: "CONSUMO 0 CON VELOCIDAD",
};
export const nombreRegla = (r: string) => NOMBRES_REGLA[r] ?? r.replace(/_/g, " ").toUpperCase();

/** Consumo instantáneo que dispara la alerta (la condición es consumo = 0). */
export const CONSUMO_ALERTA_LH = 0;
