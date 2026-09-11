import type { Empresa } from "../../../types";

export function HomeChile({ empresa }: { empresa: Empresa }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Home · {empresa.nombre}</h2>
      <p className="mt-2 text-sm text-slate-400">
        Panel principal de {empresa.nombre}. Listo para personalizar indicadores y flota.
      </p>
    </div>
  );
}

export function MonitoreoChile({ empresaNombre }: { empresaNombre: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Monitoreo · {empresaNombre}</h2>
      <p className="mt-2 text-sm text-slate-400">Módulos de monitoreo específicos para {empresaNombre}.</p>
    </div>
  );
}

export function DataChile({ empresaNombre }: { empresaNombre: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Data Base · {empresaNombre}</h2>
      <p className="mt-2 text-sm text-slate-400">Base de datos específica para {empresaNombre}.</p>
    </div>
  );
}

export function AsistentesChile({ empresaNombre }: { empresaNombre: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Asistentes · {empresaNombre}</h2>
      <p className="mt-2 text-sm text-slate-400">Personal asignado a {empresaNombre}.</p>
    </div>
  );
}
