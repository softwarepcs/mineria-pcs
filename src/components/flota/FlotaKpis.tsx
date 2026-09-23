import type { FlotaResumen, Maquinaria } from "../../types";

export function FlotaKpis({
  resumen,
  maquinarias,
  selectedId,
  onReset,
}: {
  resumen: FlotaResumen;
  maquinarias: Maquinaria[];
  selectedId: string | null;
  onReset: () => void;
}) {
  const selectedMaquinaria = selectedId ? maquinarias.find((c) => c.id === selectedId) : null;
  const esIndividual = selectedMaquinaria !== null && selectedMaquinaria !== undefined;

  const dentroDelObjetivo = esIndividual
    ? selectedMaquinaria.desvioPct <= 0
    : resumen.rendimientoMedioL100km <= resumen.objetivoL100km;

  return (
    <div className="w-full">
      {/* ─── Top bar: Title + badges + reporting ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <h2 className="text-base sm:text-lg font-bold text-[#e6edf3] m-0 flex items-center gap-1.5 flex-wrap">
            <span>Flota</span>
            {esIndividual && (
              <span className="text-[#00ebb0] font-mono text-sm sm:text-base">
                · Camión {selectedMaquinaria.placa}
              </span>
            )}
          </h2>

          {!esIndividual ? (
            <>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1a9a7a]/15 border border-[#1a9a7a]/30 text-xs font-medium text-[#1a9a7a]">
                {resumen.equipos} equipos
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-[#8b949e]">
                {resumen.periodo}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-[#8b949e]">
                Objetivo {resumen.objetivoL100km.toFixed(1)} L/100 km
              </span>
            </>
          ) : (
            <>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  selectedMaquinaria.estado === "ralenti"
                    ? "bg-[#d99b42]/15 border border-[#d99b42]/30 text-[#d99b42]"
                    : "bg-[#1a9a7a]/15 border border-[#1a9a7a]/30 text-[#1a9a7a]"
                }`}
              >
                {selectedMaquinaria.estado === "ralenti" ? "RALENTÍ" : selectedMaquinaria.estado.toUpperCase().replace("_", " ")}
              </span>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md cursor-pointer bg-[#1a9a7a]/10 border border-[#1a9a7a]/30 text-xs font-semibold text-[#1a9a7a] hover:bg-[#1a9a7a]/20 transition"
              >
                ✕ Ver toda la flota
              </button>
            </>
          )}
        </div>

        {!esIndividual && (
          <div className="flex items-center gap-2 text-xs text-[#8b949e]">
            <span className="w-2 h-2 rounded-full bg-[#1a9a7a] inline-block shrink-0" />
            <span>{resumen.reportando} de {resumen.equipos} reportando</span>
          </div>
        )}
      </div>

      {/* ─── 5 KPI Cards (Responsive grid: 2 cols on mobile, 3 on tablet, 5 on desktop) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.06]">
        {[
          {
            label: "CONSUMO TOTAL",
            value: esIndividual
              ? selectedMaquinaria.litros.toLocaleString("es-PE")
              : resumen.consumoTotalL.toLocaleString("es-PE"),
            unit: "L",
            sub: esIndividual
              ? `${selectedMaquinaria.km.toLocaleString("es-PE")} km recorridos`
              : `${resumen.kmTotal.toLocaleString("es-PE")} km de flota`,
          },
          {
            label: "COSTO",
            value: esIndividual
              ? Math.round(selectedMaquinaria.litros * resumen.precioUsdPorL).toLocaleString("es-PE")
              : resumen.costoUsd.toLocaleString("es-PE"),
            unit: "USD",
            sub: esIndividual
              ? `${selectedMaquinaria.pctGasto.toFixed(1)} % del gasto de la flota`
              : `a ${resumen.precioUsdPorL.toFixed(2)} USD/L`,
          },
          {
            label: "RENDIMIENTO MEDIO",
            value: esIndividual
              ? selectedMaquinaria.l100km.toFixed(1)
              : resumen.rendimientoMedioL100km.toFixed(1),
            unit: "L/100 km",
            sub: esIndividual
              ? `${selectedMaquinaria.desvioPct > 0 ? "+" : ""}${selectedMaquinaria.desvioPct.toFixed(1)} % vs objetivo`
              : `${dentroDelObjetivo ? "-" : "+"}${Math.abs(resumen.desvioVsObjetivoPct).toFixed(1)} % vs objetivo`,
            subColor: dentroDelObjetivo ? "#1a9a7a" : "#d99b42",
          },
          {
            label: "RALENTÍ",
            value: esIndividual
              ? selectedMaquinaria.ralentiPct.toFixed(1)
              : resumen.ralentiFlotaPct.toFixed(1),
            unit: "%",
            sub: esIndividual
              ? `${selectedMaquinaria.horas} horas de motor`
              : `${resumen.ralentiLitros.toLocaleString("es-PE")} L · ${resumen.ralentiUsd.toLocaleString("es-PE")} USD`,
            subColor: "#d99b42",
          },
          {
            label: <>EMISIONES DE CO<sub>2</sub></>,
            value: esIndividual
              ? ((selectedMaquinaria.litros * 2.68) / 1000).toFixed(1)
              : resumen.emisionesCo2Ton.toFixed(1),
            unit: "t",
            sub: esIndividual
              ? `Camión ${selectedMaquinaria.placa}`
              : `${resumen.horasMotor.toLocaleString("es-PE")} h de motor`,
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className={`p-3.5 sm:p-4 lg:p-5 bg-[#0d1117] flex flex-col justify-between ${
              i === 4 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <p className="text-[11px] font-semibold tracking-wider text-[#636e7b] m-0 mb-1.5 truncate uppercase">
              {kpi.label}
            </p>
            <p className="text-xl sm:text-2xl lg:text-[26px] font-bold text-[#e6edf3] m-0 mb-1 leading-tight flex items-baseline flex-wrap gap-1">
              <span>{kpi.value}</span>
              <span className="text-xs sm:text-[13px] font-normal text-[#636e7b]">{kpi.unit}</span>
            </p>
            <p
              className="text-[11px] m-0 truncate"
              style={{
                color: kpi.subColor || "#636e7b",
                fontWeight: kpi.subColor ? 500 : 400,
              }}
              title={typeof kpi.sub === "string" ? kpi.sub : undefined}
            >
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
