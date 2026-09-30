import { ESTADO_UNIDAD, type UnidadConHoy } from "../estado";
import { haceCuanto, num } from "@/shared/utils/formato";

export function UnidadesLista({
  unidades,
  seleccionadaId,
  onSeleccionar,
  visible,
}: {
  unidades: UnidadConHoy[];
  seleccionadaId: number | null;
  onSeleccionar: (id: number) => void;
  visible: boolean;
}) {
  return (
    <aside className={`h-full w-full shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#090e18] xl:flex xl:w-[280px] ${visible ? "flex" : "hidden"}`}>
      <div className="shrink-0 border-b border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-400">Unidades ({unidades.length})</div>
      <div className="sidebar-scroll flex-1 divide-y divide-white/[0.04] overflow-y-auto">
        {unidades.length === 0 && <p className="p-4 text-center text-xs text-slate-500">Ninguna unidad coincide con los filtros.</p>}
        {unidades.map((u) => {
          const estado = ESTADO_UNIDAD[u.estado];
          const desvio = u.hoy?.desvioPct ?? null;
          const t = u.telemetria;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onSeleccionar(u.id)}
              className={`relative block w-full p-3 text-left transition ${u.id === seleccionadaId ? "border-l-4 border-[#0df5c6] bg-[#111c2e]" : "hover:bg-white/[0.03]"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: estado.color, boxShadow: `0 0 6px ${estado.color}` }} />
                  <span className="text-xs font-bold tracking-wide text-white">{u.identificador}</span>
                </div>
                {desvio !== null && u.hoy && u.hoy.km > 0 && (
                  <span className={`font-mono text-xs font-semibold ${desvio > 0 ? "text-[#fbbf24]" : "text-[#0df5c6]"}`} title="Desvío de hoy vs objetivo">
                    {desvio > 0 ? "+" : ""}{num(desvio, 1)} %
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] font-medium" style={{ color: estado.color }}>{estado.etiqueta}</div>
              <div className="truncate text-[11px] text-slate-300">{u.operadorActual?.nombre ?? "Sin operador asignado"}</div>
              <div className="mt-0.5 font-mono text-[10px] text-slate-500">
                {t ? `${num(t.velocidad)} km/h • ${num(t.flujoIn, 1)} L/h • ${haceCuanto(t.timestamp)}` : "Sin lecturas"}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
