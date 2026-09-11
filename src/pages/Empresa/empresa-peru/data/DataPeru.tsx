export function DataPeru({ empresaNombre }: { empresaNombre: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Data Base · {empresaNombre}</h2>
      <p className="mt-2 text-sm text-slate-400">
        Estructura de Base de Datos para {empresaNombre}. Lista para conectar tablas específicas.
      </p>
    </div>
  );
}
