import { ESTADO_UNIDAD } from "@/features/flota/estado";
import type { FlotaResumen, MaquinariaStats as Maquinaria } from "@/features/flota/api";

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

  const consumoMedioActual = esIndividual
    ? selectedMaquinaria.consumoMedioL100km ?? selectedMaquinaria.l100km
    : resumen.consumoMedioL100km ?? 0;

  const desvioActual = esIndividual
    ? selectedMaquinaria.desvioPct
    : resumen.desvioVsObjetivoPct;

  const dentroDelObjetivo = desvioActual <= 0;

  const kpis = [
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
      label: "RECORRIDO TOTAL",
      value: esIndividual
        ? selectedMaquinaria.km.toLocaleString("es-PE")
        : resumen.kmTotal.toLocaleString("es-PE"),
      unit: "km",
      sub: esIndividual
        ? `${selectedMaquinaria.horas.toLocaleString("es-PE")} h de motor`
        : `${resumen.horasMotor.toLocaleString("es-PE")} h de motor`,
    },
    {
      label: "CONSUMO MEDIO",
      value: consumoMedioActual.toFixed(1),
      unit: "L/100 km",
      sub: `${desvioActual > 0 ? "+" : ""}${desvioActual.toFixed(1)} % vs obj (${resumen.objetivoL100km.toFixed(1)})`,
      subColor: dentroDelObjetivo ? "#1a9a7a" : "#d99b42",
    },
    {
      label: "RALENTÍ",
      value: esIndividual
        ? (selectedMaquinaria.ralentiLitros ?? 0).toLocaleString("es-PE")
        : (resumen.ralentiLitros ?? 0).toLocaleString("es-PE"),
      unit: "L",
      sub: esIndividual
        ? `${(selectedMaquinaria.ralentiHoras ?? 0).toFixed(1)} h en ralentí`
        : `${(resumen.ralentiHoras ?? 0).toFixed(1)} h en ralentí`,
      subColor: "#d99b42",
    },
    {
      label: "SOBRECARGA",
      value: esIndividual
        ? (selectedMaquinaria.sobrecargaLitros ?? 0).toLocaleString("es-PE")
        : (resumen.sobrecargaLitros ?? 0).toLocaleString("es-PE"),
      unit: "L",
      sub: esIndividual
        ? `${(selectedMaquinaria.sobrecargaHoras ?? 0).toFixed(1)} h sobrecarga`
        : `${(resumen.sobrecargaHoras ?? 0).toFixed(1)} h sobrecarga`,
      subColor: ((esIndividual ? selectedMaquinaria.sobrecargaLitros : resumen.sobrecargaLitros) ?? 0) > 0 ? "#f87171" : "#636e7b",
    },
    {
      label: <>EMISIONES CO<sub>2</sub></>,
      value: esIndividual
        ? (selectedMaquinaria.co2Ton ?? 0).toFixed(2)
        : (resumen.emisionesCo2Ton ?? 0).toFixed(2),
      unit: "t",
      sub: esIndividual
        ? `${(selectedMaquinaria.co2Kg ?? selectedMaquinaria.litros * 2.68).toLocaleString("es-PE")} kg`
        : `${(resumen.emisionesCo2Kg ?? resumen.consumoTotalL * 2.68).toLocaleString("es-PE")} kg`,
    },
  ];

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
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/4 border border-white/8 text-xs text-[#8b949e]">
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
                {ESTADO_UNIDAD[selectedMaquinaria.estado].etiqueta.toUpperCase()}
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

      {/* ─── 6 KPI Cards (Grid adaptativo: 2 cols móvil, 3 en tablet, 6 en desktop) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px rounded-xl overflow-hidden border border-white/6 bg-white/6">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="p-3.5 sm:p-4 lg:p-4.5 bg-[#0d1117] flex flex-col justify-between"
          >
            <p className="text-[11px] font-semibold tracking-wider text-[#636e7b] m-0 mb-1.5 truncate uppercase">
              {kpi.label}
            </p>
            <p className="text-xl sm:text-2xl lg:text-[23px] font-bold text-[#e6edf3] m-0 mb-1 leading-tight flex items-baseline flex-wrap gap-1">
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
