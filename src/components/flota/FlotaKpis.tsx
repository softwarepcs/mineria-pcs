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
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all">
      {/* Barra superior de cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-1 text-lg font-bold text-white">
            Flota {esIndividual && <span className="text-cyan-300 font-mono">· Camión {selectedMaquinaria.placa}</span>}
          </h2>

          {!esIndividual ? (
            <>
              <span className="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                {resumen.equipos} equipos
              </span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                {resumen.periodo}
              </span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                Objetivo {resumen.objetivoL100km.toFixed(1)} L/100 km
              </span>
            </>
          ) : (
            <>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  selectedMaquinaria.estado === "revisar"
                    ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border border-green-500/30 bg-green-500/10 text-green-400"
                }`}
              >
                {selectedMaquinaria.estado === "revisar" ? "EN REVISIÓN" : "EN LÍNEA"}
              </span>
              <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                Vista de camión individual
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {esIndividual ? (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-sm transition hover:bg-cyan-500/25 hover:text-white"
            >
              <span>✕</span>
              <span>Ver toda la flota</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {resumen.reportando} de {resumen.equipos} reportando
            </div>
          )}
        </div>
      </div>

      {/* Grid de 5 KPIs */}
      <div className="grid grid-cols-2 gap-6 border-t border-white/10 px-5 py-5 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Consumo total</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {esIndividual
              ? selectedMaquinaria.litros.toLocaleString("es-PE")
              : resumen.consumoTotalL.toLocaleString("es-PE")}
            <span className="ml-1 text-sm font-medium text-slate-400">L</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {esIndividual
              ? `${selectedMaquinaria.km.toLocaleString("es-PE")} km recorridos`
              : `${resumen.kmTotal.toLocaleString("es-PE")} km de flota`}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Costo</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {esIndividual
              ? Math.round(selectedMaquinaria.litros * resumen.precioUsdPorL).toLocaleString("es-PE")
              : resumen.costoUsd.toLocaleString("es-PE")}
            <span className="ml-1 text-sm font-medium text-slate-400">USD</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {esIndividual
              ? `${selectedMaquinaria.pctGasto.toFixed(1)} % del gasto de la flota`
              : `a ${resumen.precioUsdPorL.toFixed(2)} USD/L`}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rendimiento medio</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {esIndividual
              ? selectedMaquinaria.l100km.toFixed(1)
              : resumen.rendimientoMedioL100km.toFixed(1)}
            <span className="ml-1 text-sm font-medium text-slate-400">L/100km</span>
          </p>
          <p className={`mt-0.5 text-xs font-medium ${dentroDelObjetivo ? "text-green-400" : "text-amber-400"}`}>
            {esIndividual ? (
              <>
                {selectedMaquinaria.desvioPct > 0 ? "+" : ""}
                {selectedMaquinaria.desvioPct.toFixed(1)} % vs objetivo
              </>
            ) : (
              <>
                {dentroDelObjetivo ? "-" : "+"}
                {Math.abs(resumen.desvioVsObjetivoPct).toFixed(1)} % vs objetivo
              </>
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ralentí</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {esIndividual ? selectedMaquinaria.ralentiPct.toFixed(1) : resumen.ralentiFlotaPct.toFixed(1)}
            <span className="ml-1 text-sm font-medium text-slate-400">%</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {esIndividual
              ? `${selectedMaquinaria.horas} horas de motor registradas`
              : `${resumen.ralentiLitros.toLocaleString("es-PE")} L · ${resumen.ralentiUsd.toLocaleString("es-PE")} USD`}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Emisiones CO2</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {esIndividual
              ? ((selectedMaquinaria.litros * 2.68) / 1000).toFixed(1)
              : resumen.emisionesCo2Ton.toFixed(1)}
            <span className="ml-1 text-sm font-medium text-slate-400">t</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {esIndividual ? `Camión ${selectedMaquinaria.placa}` : `${resumen.horasMotor.toLocaleString("es-PE")} h de motor`}
          </p>
        </div>
      </div>
    </div>
  );
}

