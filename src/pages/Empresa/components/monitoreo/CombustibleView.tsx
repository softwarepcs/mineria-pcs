import { useState } from "react";
import monitoreoData from "../../../../data/monitoreoData.json";
import { Icon } from "../../../../components/Icon";

export function CombustibleView({ empresaNombre }: { empresaNombre: string }) {
  const [combustible] = useState(monitoreoData.combustible);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Icon name="fuel" className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Monitoreo · Resumen de Combustible</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {empresaNombre} · Caudalímetros másicos, consumo en tiempo real y curvas de eficiencia
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Densidad {combustible.densidadKgM3} kg/m³
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Consumo Hoy</p>
          <p className="mt-1 text-2xl font-bold text-white">{combustible.consumoHoyL} <span className="text-sm font-normal text-slate-400">L</span></p>
          <p className="mt-1 text-xs text-slate-500">{combustible.horasNavegacionHoy} h operadas</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Flujo Instantáneo</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{combustible.flujoInstantaneoLh} <span className="text-sm font-normal text-slate-400">L/h</span></p>
          <p className="mt-1 text-xs text-slate-500">Motor principal</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Eficiencia</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{combustible.eficienciaKmL} <span className="text-sm font-normal text-slate-400">km/L</span></p>
          <p className="mt-1 text-xs text-slate-500">Rendimiento en ruta</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Desvío vs Objetivo</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">+{combustible.desvioHistoricoPct}%</p>
          <p className="mt-1 text-xs text-slate-500">Acumulado semanal</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-white">Consumo Diario vs Objetivo (Últimos 7 días)</h3>
        <div className="mt-4 flex items-end gap-3 h-48 pt-4">
          {combustible.historicoSemanal.map((h, i) => {
            const max = 1200;
            const pct = (h.consumo / max) * 100;
            const objPct = (h.objetivo / max) * 100;
            return (
              <div key={i} className="flex flex-1 flex-col items-center h-full justify-end gap-2">
                <span className="text-xs text-slate-400">{h.consumo}L</span>
                <div className="relative w-full h-full max-h-32 flex items-end justify-center">
                  <div
                    className="w-8 rounded-t-sm bg-amber-400/80 transition-all hover:bg-amber-300"
                    style={{ height: `${pct}%` }}
                    title={`Consumo: ${h.consumo} L`}
                  />
                  <div
                    className="absolute w-full border-t border-dashed border-cyan-400/60"
                    style={{ bottom: `${objPct}%` }}
                    title={`Objetivo: ${h.objetivo} L`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-300">{h.dia}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
