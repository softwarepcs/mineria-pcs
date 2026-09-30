interface Opcion<T> { valor: T; etiqueta: string }

export function PeriodoSelector<T extends string | number>({ opciones, valor, onCambiar }: { opciones: Opcion<T>[]; valor: T; onCambiar: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-800 bg-[#0e1724] p-0.5" role="group" aria-label="Período">
      {opciones.map((o) => (
        <button
          key={String(o.valor)}
          type="button"
          onClick={() => onCambiar(o.valor)}
          aria-pressed={valor === o.valor}
          className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-all ${
            valor === o.valor ? "border-[#0df5c6] bg-[#0df5c6]/10 text-[#0df5c6]" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
