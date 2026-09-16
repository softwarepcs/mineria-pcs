import { useState, useEffect } from "react";
import monitoreoData from "../../../../data/monitoreoData.json";
import { Icon } from "../../../../components/Icon";

export function BnwasView({ empresaNombre }: { empresaNombre: string }) {
  const [bnwas] = useState(monitoreoData.bnwas);
  const [segundos, setSegundos] = useState(bnwas.segundosRestantes);

  useEffect(() => {
    const timer = setInterval(() => {
      setSegundos((s) => (s > 1 ? s - 1 : 180));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Monitoreo · Sistema BNWAS</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {empresaNombre} · Bridge Navigational Watch Alarm System (Alarma de Guardia del Puente)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Sistema Operativo
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Cuenta Regresiva de Guardia</p>
          <div className="my-4 text-5xl font-mono font-extrabold text-emerald-400">
            {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {bnwas.etapaActual}
          </span>
          <button
            type="button"
            onClick={() => setSegundos(180)}
            className="mt-5 rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
          >
            Pulsador de Confirmación (Reset)
          </button>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white">Oficial en Guardia</h3>
            <p className="mt-1 text-lg font-bold text-slate-200">{bnwas.oficialDeGuardia}</p>
            <p className="mt-0.5 text-xs text-slate-400">Modo: {bnwas.modo}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white">Sensores de Movimiento en Puente</h3>
            <div className="mt-3 space-y-2">
              {bnwas.sensoresMovimiento.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                  <span className="text-slate-300">{s.ubicacion}</span>
                  <span className="text-slate-400">Detectado hace {s.detectadoHaceSeg}s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
