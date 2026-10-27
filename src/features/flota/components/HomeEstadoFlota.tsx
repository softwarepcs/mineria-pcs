import type { Unidad } from "@/features/camiones/api";
import { ESTADOS_ORDEN, ESTADO_UNIDAD } from "@/features/flota/estado";
import { Panel, PanelTitulo } from "@/shared/ui/Panel";

/** Cuántos camiones hay en cada estado (número grande) y la barra de reparto con su %. */
export function HomeEstadoFlota({ unidades }: { unidades: Unidad[] }) {
  const total = unidades.length;
  const cuenta = Object.fromEntries(ESTADOS_ORDEN.map((e) => [e, unidades.filter((u) => u.estado === e).length])) as Record<string, number>;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const presentes = ESTADOS_ORDEN.filter((e) => cuenta[e] > 0);

  return (
    <Panel className="px-6 py-5">
      <PanelTitulo
        extra={
          <span className="text-[13.5px] text-[#8FA3B8]">
            <strong className="text-white">{total}</strong> camiones monitoreados
          </span>
        }
      >
        Estado de la flota ahora
      </PanelTitulo>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-y-3.5">
        {ESTADOS_ORDEN.map((e, i) => (
          <div key={e} className={`px-5 py-0.5 ${i > 0 ? "border-l border-[#1E3850]" : ""}`}>
            <div className="flex items-center gap-2 text-[14.5px] font-medium text-[#C9D6E3]">
              <span className="h-[11px] w-[11px] rounded-[3px]" style={{ background: ESTADO_UNIDAD[e].color }} />
              {ESTADO_UNIDAD[e].etiqueta}
            </div>
            <div className={`mt-1 font-cond text-[56px] font-bold leading-[1.05] sm:text-[68px] ${cuenta[e] ? "text-white" : "text-[#3E536A]"}`}>{cuenta[e]}</div>
            <div className="text-[13px] text-[#8FA3B8]">{pct(cuenta[e])} % de la flota</div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-[18px] flex gap-[3px]" role="img" aria-label="Distribución de la flota por estado">
          {presentes.map((e) => (
            <div key={e} className="min-w-[6px]" style={{ width: `${(cuenta[e] / total) * 100}%` }}>
              <div className="mb-1 whitespace-nowrap text-xs tabular-nums text-[#A9BBCC]">{pct(cuenta[e])} %</div>
              <div className="h-3.5 rounded-[3px]" style={{ background: ESTADO_UNIDAD[e].color }} title={`${ESTADO_UNIDAD[e].etiqueta}: ${cuenta[e]}`} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
