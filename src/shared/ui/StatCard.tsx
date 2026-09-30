import type { ReactNode } from "react";

interface StatCardProps {
  titulo: string;
  valor: string | number;
  unidad?: string;
  /** Color del valor. Acepta clase Tailwind (`"text-amber-500"`) o variable inline. Por defecto `"text-white"`. */
  color?: string;
  /** `"card"` con fondo y borde, `"compact"` sin fondo (para grids de métricas). */
  variante?: "card" | "compact";
  icono?: ReactNode;
}

/**
 * Tarjeta de indicador / métrica reutilizable.
 *
 * Reemplaza: `IndicatorCard`, `Metrica` (AlertasView) y el grid inline de OperadoresView.
 */
export function StatCard({ titulo, valor, unidad, color = "text-white", variante = "card", icono }: StatCardProps) {
  const base = variante === "card"
    ? "rounded-lg border border-white/10 bg-white/[0.03] p-3"
    : "p-3";

  return (
    <div className={base}>
      <div className="mb-1 flex items-center gap-1.5">
        {icono && <span className="text-slate-400">{icono}</span>}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</span>
      </div>
      <div className={`font-mono text-xl font-bold ${color}`}>
        {valor}
        {unidad && String(valor) !== "—" && (
          <span className="ml-1 font-sans text-xs font-medium text-slate-400">{unidad}</span>
        )}
      </div>
    </div>
  );
}
