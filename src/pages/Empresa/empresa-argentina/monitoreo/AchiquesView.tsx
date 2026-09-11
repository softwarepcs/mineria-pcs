import { useState } from "react";
import monitoreoData from "../../../../data/monitoreoData.json";
import { Icon } from "../../../../components/Icon";

export function AchiquesView({ empresaNombre }: { empresaNombre: string }) {
  const [achiques] = useState(monitoreoData.achiques);
  const activas = achiques.filter((a) => a.bombaEstado === "activo").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Icon name="droplet" className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Monitoreo · Achiques y Sentinas</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {empresaNombre} · Control de niveles de agua en sentinas y accionamiento de bombas
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          {activas > 0 ? `${activas} Bomba(s) Operando` : "Todas en Standby"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {achiques.map((a) => {
          const alerta = a.nivelAguaCm >= a.umbralAlertaCm;
          return (
            <div
              key={a.id}
              className={`rounded-xl border p-5 backdrop-blur-sm transition ${
                a.bombaEstado === "activo"
                  ? "border-blue-500/40 bg-blue-500/10"
                  : alerta
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{a.ubicacion}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Última activación: {a.ultimaActivacion}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    a.bombaEstado === "activo"
                      ? "bg-blue-400/20 text-blue-300 animate-pulse"
                      : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {a.bombaEstado.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-white/5 bg-black/20 p-3 text-center">
                <div>
                  <p className="text-xs text-slate-400">Nivel de Agua</p>
                  <p className="mt-1 text-lg font-bold text-white">{a.nivelAguaCm} cm</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Umbral Alerta</p>
                  <p className="mt-1 text-lg font-bold text-amber-400">{a.umbralAlertaCm} cm</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Caudal</p>
                  <p className="mt-1 text-lg font-bold text-cyan-300">{a.caudalLmin} L/min</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
