import type { Unidad } from "./api";
import type { MaquinariaStats } from "@/features/flota/api";

export { ESTADO_UNIDAD } from "@/features/flota/estado";

/** Unidad en vivo + sus estadísticas de hoy (del dashboard con dias=1). */
export type UnidadConHoy = Unidad & { hoy: MaquinariaStats | null };

export function unirConHoy(unidades: Unidad[], stats: MaquinariaStats[] | undefined): UnidadConHoy[] {
  const porId = new Map((stats ?? []).map((s) => [Number(s.id), s]));
  return unidades.map((u) => ({ ...u, hoy: porId.get(u.id) ?? null }));
}

export function posicion(u: Unidad): [number, number] | null {
  const t = u.telemetria;
  return t && t.lat !== null && t.lng !== null ? [t.lat, t.lng] : null;
}
