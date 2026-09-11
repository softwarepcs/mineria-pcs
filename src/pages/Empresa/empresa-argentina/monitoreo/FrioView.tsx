import { useState } from "react";
import monitoreoData from "../../../../data/monitoreoData.json";
import { Icon } from "../../../../components/Icon";

export function FrioView({ empresaNombre }: { empresaNombre: string }) {
  const [frio] = useState(monitoreoData.frio);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Icon name="snowflake" className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Monitoreo · Sistema de Frío</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {empresaNombre} · Cámaras frigoríficas, compresores y presiones de refrigerante
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Refrigerante R404A Nominal
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Cámaras Frigoríficas</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {frio.camaras.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{c.nombre}</span>
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">{c.estado}</span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400">Temperatura Actual</p>
                <p className="text-3xl font-bold text-cyan-300">{c.temperaturaC} °C</p>
                <p className="mt-1 text-xs text-slate-500">Setpoint objetivo: {c.setpointC} °C</p>
              </div>
              <div className="mt-3 flex justify-between border-t border-white/5 pt-2 text-xs text-slate-400">
                <span>Humedad: {c.humedadPct}%</span>
                <span>Descongelamiento: {c.descongelamiento}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Compresores de Frío</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {frio.compresores.map((cp) => (
            <div key={cp.id} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{cp.nombre}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    cp.estado === "activo" ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {cp.estado.toUpperCase()}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-black/20 p-2">
                  <p className="text-slate-400">Succión</p>
                  <p className="mt-1 text-sm font-bold text-white">{cp.presionSuccionBar} bar</p>
                </div>
                <div className="rounded-lg bg-black/20 p-2">
                  <p className="text-slate-400">Descarga</p>
                  <p className="mt-1 text-sm font-bold text-white">{cp.presionDescargaBar} bar</p>
                </div>
                <div className="rounded-lg bg-black/20 p-2">
                  <p className="text-slate-400">Amperaje</p>
                  <p className="mt-1 text-sm font-bold text-white">{cp.amperajeA} A</p>
                </div>
              </div>
              <p className="mt-3 text-right text-xs text-slate-500">{cp.horasOperacion} h operadas</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
