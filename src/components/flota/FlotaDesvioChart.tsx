import type { Maquinaria } from "../../types";

export function FlotaDesvioChart({
  maquinarias,
  objetivo,
  selectedId,
  onSelect,
}: {
  maquinarias: Maquinaria[];
  objetivo: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  // Ordenar de mayor desvío a menor desvío como en la imagen de referencia
  const ordenados = [...maquinarias].sort((a, b) => b.desvioPct - a.desvioPct);
  const positivos = ordenados.filter((c) => c.desvioPct >= 0);
  const negativos = ordenados.filter((c) => c.desvioPct < 0);

  // Escala fija a 12% para que el 10% quede alineado como en la imagen
  const maxRange = 12.5;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0e1626] p-6 backdrop-blur-sm">
      {/* Header del gráfico */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">
            Desvío del rendimiento contra el objetivo de flota
          </h3>
          {selectedId && onSelect && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300 hover:bg-cyan-500/20"
            >
              ✕ Ver todos
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400">
          objetivo {objetivo.toFixed(1).replace(".", ",")} L/100 km
        </p>
      </div>

      {/* Contenedor central del gráfico divergente */}
      <div className="relative mx-auto max-w-2xl py-2">
        {/* Líneas guía verticales del grid */}
        <div className="pointer-events-none absolute inset-0 flex justify-between px-16">
          {/* -10% */}
          <div className="flex flex-col items-center" style={{ left: "10%", position: "absolute" }}>
            <div className="h-full w-px border-l border-dashed border-white/10" />
          </div>
          {/* -5% */}
          <div className="flex flex-col items-center" style={{ left: "30%", position: "absolute" }}>
            <div className="h-full w-px border-l border-dashed border-white/10" />
          </div>
          {/* 0% Objetivo */}
          <div className="flex flex-col items-center" style={{ left: "50%", position: "absolute" }}>
            <div className="h-full w-px border-l border-white/20" />
          </div>
          {/* +5% */}
          <div className="flex flex-col items-center" style={{ left: "70%", position: "absolute" }}>
            <div className="h-full w-px border-l border-dashed border-white/10" />
          </div>
          {/* +10% */}
          <div className="flex flex-col items-center" style={{ left: "90%", position: "absolute" }}>
            <div className="h-full w-px border-l border-dashed border-white/10" />
          </div>
        </div>

        {/* Filas de maquinarias */}
        <div className="relative z-10 space-y-3.5">
          {/* Positivos: Placa a la izquierda del centro, barra hacia la derecha */}
          {positivos.map((c) => {
            const barWidthPct = Math.min((c.desvioPct / maxRange) * 50, 48);
            // Si supera el 5% o estado revisar se muestra en amarillo/ámbar, si está dentro del objetivo en verde/teal
            const esAmbar = c.desvioPct >= 5 || c.estado === "revisar";
            const isSelected = selectedId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => onSelect && onSelect(isSelected ? null : c.id)}
                className={`group flex items-center h-7 cursor-pointer rounded-md transition-all ${
                  isSelected
                    ? "bg-white/10 ring-1 ring-cyan-400/40"
                    : selectedId
                    ? "opacity-40 hover:opacity-100 hover:bg-white/5"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Lado izquierdo: Placa alineada a la derecha contra el eje central */}
                <div className="w-1/2 flex items-center justify-end pr-3">
                  <span className="font-mono text-xs font-bold text-slate-200 tracking-wider group-hover:text-white">
                    {c.placa}
                  </span>
                </div>

                {/* Lado derecho: Barra que nace en el centro y crece hacia la derecha */}
                <div className="w-1/2 flex items-center pl-0">
                  <div
                    className={`h-4.5 rounded-r transition-all duration-300 ${
                      esAmbar ? "bg-[#d99b42]" : "bg-[#5eead4]"
                    }`}
                    style={{ width: `${barWidthPct * 2}%`, minWidth: "4px" }}
                  />
                  <span
                    className={`ml-2 text-xs font-semibold ${
                      esAmbar ? "text-[#d99b42]" : "text-[#5eead4]"
                    }`}
                  >
                    +{c.desvioPct.toFixed(1).replace(".", ",")} %
                  </span>
                </div>
              </div>
            );
          })}

          {/* Espaciador sutil entre positivos y negativos */}
          <div className="h-1" />

          {/* Negativos: Barra nace en el centro hacia la izquierda, Placa a la derecha del centro */}
          {negativos.map((c) => {
            const absVal = Math.abs(c.desvioPct);
            const barWidthPct = Math.min((absVal / maxRange) * 50, 48);
            const isSelected = selectedId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => onSelect && onSelect(isSelected ? null : c.id)}
                className={`group flex items-center h-7 cursor-pointer rounded-md transition-all ${
                  isSelected
                    ? "bg-white/10 ring-1 ring-cyan-400/40"
                    : selectedId
                    ? "opacity-40 hover:opacity-100 hover:bg-white/5"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Lado izquierdo: Etiqueta y barra que crece hacia la izquierda */}
                <div className="w-1/2 flex items-center justify-end pr-0">
                  <span className="mr-2 text-xs font-semibold text-[#5eead4]">
                    -{absVal.toFixed(1).replace(".", ",")} %
                  </span>
                  <div
                    className="h-4.5 rounded-l bg-[#5eead4] transition-all duration-300"
                    style={{ width: `${barWidthPct * 2}%`, minWidth: "4px" }}
                  />
                </div>

                {/* Lado derecho: Placa alineada a la izquierda contra el eje central */}
                <div className="w-1/2 flex items-center pl-3">
                  <span className="font-mono text-xs font-bold text-slate-200 tracking-wider group-hover:text-white">
                    {c.placa}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Escala horizontal con ticks inferiores */}
        <div className="relative mt-7 flex justify-between text-[11px] text-slate-500 font-medium">
          <div style={{ left: "10%", position: "absolute", transform: "translateX(-50%)" }}>
            -10 %
          </div>
          <div style={{ left: "30%", position: "absolute", transform: "translateX(-50%)" }}>
            -5 %
          </div>
          <div style={{ left: "50%", position: "absolute", transform: "translateX(-50%)" }} className="text-slate-400 font-semibold">
            objetivo
          </div>
          <div style={{ left: "70%", position: "absolute", transform: "translateX(-50%)" }}>
            +5 %
          </div>
          <div style={{ left: "90%", position: "absolute", transform: "translateX(-50%)" }}>
            +10 %
          </div>
        </div>
      </div>

      {/* Leyenda idéntica a la imagen */}
      <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-xs bg-[#d99b42]" />
          <span>Por encima del objetivo · consume de más</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-xs bg-[#5eead4]" />
          <span>Dentro o por debajo del objetivo</span>
        </span>
      </div>

      {/* Nota descriptiva inferior idéntica a la imagen */}
      <p className="mt-3 text-xs leading-relaxed text-slate-400 font-sans">
        Dos maquinarias concentran el problema: <strong className="text-slate-200">AD 733 PQ</strong> y{" "}
        <strong className="text-slate-200">AG 201 XN</strong> están diez por ciento arriba del objetivo y entre los
        dos explican el 38,7 % del gasto de combustible de la flota. Ahí es donde hay que mirar primero, y los dos
        tienen además el ralentí más alto.
      </p>
    </div>
  );
}

