import { useState } from "react";
import asistentesData from "../../../../data/asistentesData.json";
import { Icon } from "../../../../components/Icon";

export function AsistentesView({ empresaNombre }: { empresaNombre: string }) {
  const [asistentes] = useState(asistentesData);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Icon name="anchor" className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Asistentes y Operadores de Guardia</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {empresaNombre} · Personal técnico a cargo del monitoreo, tripulación y asistencia
          </p>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
          Modo JSON
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {asistentes.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{a.nombre}</h3>
                <p className="text-xs text-slate-400">{a.cargo}</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                {a.estado}
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Turno de trabajo:</span>
                <span className="font-medium text-slate-200">{a.turno}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono / Radio:</span>
                <span className="font-mono text-cyan-300">{a.telefono}</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-slate-500">Equipos y sistemas asignados:</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {a.asignaciones.map((asig, i) => (
                  <span key={i} className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">
                    {asig}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
