import type { Empresa } from "../../../../types";

export function HomePeru({ empresa }: { empresa: Empresa }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Home · {empresa.nombre}</h2>
      <p className="mt-2 text-sm text-slate-400">
        Esta vista se encuentra preparada para la configuración específica de {empresa.nombre}.
      </p>
      <div className="mt-6 inline-block rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300">
        Módulo base listo para personalización de flota / maquinaria
      </div>
    </div>
  );
}
