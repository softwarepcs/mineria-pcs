import type { Unidad } from "@/features/camiones/api";
import { ESTADOS_ORDEN, ESTADO_UNIDAD } from "@/features/flota/estado";

/**
 * Estado de la flota, compacto, sobre el mapa (arriba a la izquierda): cuántos camiones hay en
 * cada estado y la barra de reparto. Hace también de leyenda de colores del mapa.
 */
export function HomeEstadoFlota({ unidades }: { unidades: Unidad[] }) {
  const total = unidades.length;
  const cuenta = Object.fromEntries(ESTADOS_ORDEN.map((e) => [e, unidades.filter((u) => u.estado === e).length])) as Record<string, number>;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <section
      aria-label="Estado de la flota ahora"
      className="absolute left-3 top-3 z-[1000] w-[calc(100%-24px)] max-w-[440px] rounded-[10px] border border-[#1E3850] bg-[#02111C]/90 px-3.5 py-2.5 shadow-[0_10px_24px_-12px_#000] sm:left-4 sm:top-4"
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h2 className="font-cond text-[15px] font-semibold tracking-wide text-[#F2F6FA]">Estado de la flota ahora</h2>
        <span className="text-xs text-[#8FA3B8]">
          <strong className="text-white">{total}</strong> camiones
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {ESTADOS_ORDEN.map((e, i) => (
          <div key={e} className={`min-w-0 px-2 ${i > 0 ? "border-l border-[#1E3850]" : "pl-0"}`} title={`${ESTADO_UNIDAD[e].etiqueta}: ${cuenta[e]} (${pct(cuenta[e])} %)`}>
            <div className={`font-cond text-[28px] font-bold leading-none ${cuenta[e] ? "text-white" : "text-[#3E536A]"}`}>{cuenta[e]}</div>
            <div className="mt-1 flex items-center gap-1.5 truncate text-[11.5px] text-[#C9D6E3]">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ESTADO_UNIDAD[e].color }} />
              <span className="truncate">{ESTADO_UNIDAD[e].corta}</span>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-2 flex h-1.5 gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Distribución de la flota por estado">
          {ESTADOS_ORDEN.filter((e) => cuenta[e] > 0).map((e) => (
            <div key={e} style={{ width: `${(cuenta[e] / total) * 100}%`, background: ESTADO_UNIDAD[e].color }} />
          ))}
        </div>
      )}
    </section>
  );
}
