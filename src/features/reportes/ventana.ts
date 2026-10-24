import type { PeriodoReporte } from "./api";

const LOCALE = "es-PE";

/** Posición de un instante dentro de la ventana, en % (acotada a 0–100). */
export function posicion(t: number, desde: number, hasta: number): number {
  return Math.min(100, Math.max(0, ((t - desde) / (hasta - desde)) * 100));
}

export interface Marca {
  t: number;
  etiqueta: string;
}

/** Marcas de la cinta de horas: cada 2 h exactas en 24 h; cada medianoche en 7 días (hora local). */
export function marcasDeVentana(desde: number, hasta: number, periodo: PeriodoReporte): Marca[] {
  const marcas: Marca[] = [];
  const d = new Date(desde);
  if (periodo === "24h") {
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + (d.getHours() % 2 === 0 ? 2 : 1));
    for (; d.getTime() < hasta; d.setHours(d.getHours() + 2)) {
      marcas.push({ t: d.getTime(), etiqueta: d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false }) });
    }
  } else {
    d.setHours(24, 0, 0, 0);
    for (; d.getTime() < hasta; d.setDate(d.getDate() + 1)) {
      marcas.push({ t: d.getTime(), etiqueta: d.toLocaleDateString(LOCALE, { weekday: "short", day: "2-digit" }) });
    }
  }
  return marcas;
}

/** "45 min", "2 h 15 min", "3 d 4 h". */
export function duracion(ms: number): string {
  const min = Math.max(0, Math.round(ms / 60_000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return min % 60 ? `${h} h ${min % 60} min` : `${h} h`;
  const dias = Math.floor(h / 24);
  return h % 24 ? `${dias} d ${h % 24} h` : `${dias} d`;
}

export const tituloPeriodo = (periodo: PeriodoReporte) =>
  periodo === "24h" ? "Monitoreo de últimas 24h" : "Monitoreo de últimos 7 días";
