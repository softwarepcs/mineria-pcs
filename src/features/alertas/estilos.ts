/** Nombres legibles de las reglas conocidas; el resto se muestra con la clave en mayúsculas. */
const NOMBRES_REGLA: Record<string, string> = {
  velocidad_consumo: "Consumo de combustible",
};
export const nombreRegla = (r: string) => NOMBRES_REGLA[r] ?? r.replace(/_/g, " ");

export const COLOR_CONSUMO = "#B65CFF";
export const COLOR_GEOCERCA = "#14B8A6";
