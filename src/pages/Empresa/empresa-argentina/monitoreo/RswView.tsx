import { useState } from "react";
import monitoreoData from "../../../../data/monitoreoData.json";
import { Icon } from "../../../../components/Icon";

export function RswView({ empresaNombre }: { empresaNombre: string }) {
  const [rsw] = useState(monitoreoData.rsw);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
              <Icon name="wind" className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Monitoreo · Resumen RSW</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {empresaNombre} · Refrigerated Sea Water (Enfriamiento de Agua de Mar para Bodegas)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Enfriamiento Activo
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Temp. Ingreso Mar</p>
          <p className="mt-1 text-2xl font-bold text-slate-300">{rsw.tempAguaMarIngresoC} °C</p>
          <p className="mt-1 text-xs text-slate-500">Agua de mar exterior</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Temp. Salida a Bodega</p>
          <p className="mt-1 text-2xl font-bold text-teal-300">{rsw.tempAguaSalidaC} °C</p>
          <p className="mt-1 text-xs text-slate-500">Setpoint: {rsw.setpointC} °C</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Presión Circulación</p>
          <p className="mt-1 text-2xl font-bold text-white">{rsw.presionCirculacionBar} bar</p>
          <p className="mt-1 text-xs text-slate-500">Línea de bombeo</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase text-slate-400">Caudal RSW</p>
          <p className="mt-1 text-2xl font-bold text-cyan-300">{rsw.flujoM3h} m³/h</p>
          <p className="mt-1 text-xs text-slate-500">Circulación continua</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-white">Bombas de Circulación RSW</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rsw.bombas.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4">
              <div>
                <p className="font-semibold text-white">{b.nombre}</p>
                <p className="text-xs text-slate-400">Potencia: {b.potenciaKw} kW · RPM: {b.rpm}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  b.estado === "activo" ? "bg-teal-500/20 text-teal-300" : "bg-slate-500/10 text-slate-400"
                }`}
              >
                {b.estado.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
