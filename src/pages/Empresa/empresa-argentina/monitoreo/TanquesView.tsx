import { useState } from "react";
import monitoreoData from "../../../../data/monitoreoData.json";
import { Icon } from "../../../../components/Icon";

export function TanquesView({ empresaNombre }: { empresaNombre: string }) {
  const [tanques] = useState(monitoreoData.tanques);
  const capacidadTotal = tanques.reduce((sum, t) => sum + t.capacidadL, 0);
  const volumenTotal = tanques.reduce((sum, t) => sum + t.nivelActualL, 0);
  const promedioNivel = ((volumenTotal / capacidadTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Icon name="droplet" className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Monitoreo · Nivel de Tanques</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {empresaNombre} · Telemetría de niveles, volumen y temperatura en tiempo real
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          Sensores Ultrasónicos Activos
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Volumen Total Almacenado</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {volumenTotal.toLocaleString("es-PE")} <span className="text-sm font-normal text-slate-400">L</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">De {capacidadTotal.toLocaleString("es-PE")} L de capacidad</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Nivel Promedio General</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{promedioNivel} %</p>
          <p className="mt-1 text-xs text-slate-500">5 tanques monitoreados en línea</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Estado de Alarmas</p>
          <p className="mt-1 text-2xl font-bold text-green-400">Sin Alertas</p>
          <p className="mt-1 text-xs text-slate-500">Niveles dentro de rangos seguros</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tanques.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">{t.nombre}</h3>
                <span className="mt-0.5 inline-block rounded bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                  {t.tipo}
                </span>
              </div>
              <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                {t.estado}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Nivel</span>
                <span className="font-semibold text-cyan-300">{t.porcentaje}%</span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    t.porcentaje > 75
                      ? "bg-cyan-400"
                      : t.porcentaje > 30
                      ? "bg-blue-500"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${t.porcentaje}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
              <div>
                <span className="text-slate-500">Volumen actual:</span>
                <p className="font-semibold text-slate-200">{t.nivelActualL.toLocaleString("es-PE")} L</p>
              </div>
              <div>
                <span className="text-slate-500">Temperatura:</span>
                <p className="font-semibold text-slate-200">{t.temperaturaC} °C</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
