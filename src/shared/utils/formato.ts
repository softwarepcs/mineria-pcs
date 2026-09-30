const LOCALE = "es-PE";

/** Número con separadores locales; "—" si no hay dato. */
export function num(valor: number | null | undefined, decimales = 0): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return valor.toLocaleString(LOCALE, { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

export function fechaHora(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function fecha(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  // "YYYY-MM-DD" se interpreta como fecha local, no UTC (evita correr un día)
  const d = typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function hora(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** "hace 3 min", "hace 2 h", "hace 5 d". */
export function haceCuanto(iso: string | Date | null | undefined): string {
  if (!iso) return "sin datos";
  const seg = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seg < 60) return `hace ${seg} s`;
  if (seg < 3600) return `hace ${Math.round(seg / 60)} min`;
  if (seg < 86400) return `hace ${Math.round(seg / 3600)} h`;
  return `hace ${Math.round(seg / 86400)} d`;
}

/** Días hasta una fecha (negativo si ya pasó). */
export function diasHasta(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

/** Fecha local "YYYY-MM-DD" para inputs type=date. */
export function hoyISO(offsetDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** ISO del backend → valor de <input type="datetime-local"> en hora local. */
export function isoAInputLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
