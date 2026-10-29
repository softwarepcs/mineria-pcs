const LOCALE = "es-AR";

/** Posición de un instante dentro de la ventana, en % (acotada a 0–100). */
export function posicion(t: number, desde: number, hasta: number): number {
  return Math.min(100, Math.max(0, ((t - desde) / (hasta - desde)) * 100));
}

/** Hora y minuto locales de un instante en la zona `tz` (la de la sede, no la del navegador). */
function partesLocales(t: number, tz: string) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(t));
  const v = (tipo: string) => p.find((x) => x.type === tipo)?.value ?? "";
  return { hora: Number(v("hour")), minuto: Number(v("minute")) };
}

/** "13:36" en la zona de la sede. */
export function horaEn(t: number | string | Date, tz: string): string {
  return new Date(t).toLocaleTimeString(LOCALE, { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
}

/** "23/10 22:10" en la zona de la sede. */
export function fechaHoraEn(t: number | string | Date, tz: string): string {
  const d = new Date(t);
  return `${d.toLocaleDateString(LOCALE, { timeZone: tz, day: "2-digit", month: "2-digit" })} ${horaEn(d, tz)}`;
}

/** Instantes (ms) de cada medianoche local dentro de la ventana. */
export function medianoches(desde: number, hasta: number, tz: string): number[] {
  const res: number[] = [];
  // Se recorre de hora en hora (los cambios de horario no caen en medio de una hora entera)
  for (let t = Math.ceil(desde / 3_600_000) * 3_600_000; t < hasta; t += 3_600_000) {
    const { hora, minuto } = partesLocales(t, tz);
    if (hora === 0 && minuto === 0) res.push(t);
  }
  return res;
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
