const LOCALE = "es-PE";

/** Número con separadores locales; "—" si no hay dato. */
export function num(valor: number | null | undefined, decimales = 0): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return valor.toLocaleString(LOCALE, { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

/** `zonaHoraria` (opcional): la de la empresa; sin ella se usa la del navegador. */
export function fechaHora(iso: string | Date | null | undefined, zonaHoraria?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString(LOCALE, { timeZone: zonaHoraria, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
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

/**
 * Fecha local "YYYY-MM-DD" para inputs `type="date"`.
 * Si se indica `zonaHoraria` (IANA), toma el día actual en esa zona antes de sumar `offsetDias`.
 */
export function hoyISO(offsetDias = 0, zonaHoraria?: string): string {
  if (zonaHoraria) {
    try {
      const base = new Intl.DateTimeFormat("en-CA", { timeZone: zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      if (/^\d{4}-\d{2}-\d{2}$/.test(base)) {
        const [y, m, d] = base.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d + offsetDias)).toISOString().slice(0, 10);
      }
    } catch {
      // Zona inválida: cae al reloj local del navegador
    }
  }
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Suma (o resta) meses calendario a una fecha `YYYY-MM-DD`, ajustando el día al último día válido
 * del mes destino (p. ej. `2026-03-31` − 1 mes → `2026-02-28`). Devuelve `""` si el formato es inválido.
 */
export function sumarMesesISO(iso: string, meses: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const totalMeses = y * 12 + (m - 1) + meses;
  const anio = Math.floor(totalMeses / 12);
  const mes0 = ((totalMeses % 12) + 12) % 12;
  const ultimoDia = new Date(Date.UTC(anio, mes0 + 1, 0)).getUTCDate();
  const dia = Math.min(d, ultimoDia);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(anio, 4)}-${p(mes0 + 1)}-${p(dia)}`;
}

/** ISO del backend → valor de <input type="datetime-local"> en hora local. */
export function isoAInputLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
