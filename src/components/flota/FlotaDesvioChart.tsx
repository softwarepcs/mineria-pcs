import type { Maquinaria } from "../../types";

export function FlotaDesvioChart({
  maquinarias,
  objetivo: _objetivo,
  selectedId,
  onSelect,
}: {
  maquinarias: Maquinaria[];
  objetivo: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  const ordenados = [...maquinarias].sort((a, b) => b.desvioPct - a.desvioPct);
  const positivos = ordenados.filter((c) => c.desvioPct > 0);
  const negativos = ordenados.filter((c) => c.desvioPct <= 0).sort((a, b) => a.desvioPct - b.desvioPct);

  // Scales
  const maxPos = Math.max(...positivos.map((c) => c.desvioPct), 50);
  const maxNeg = Math.max(...negativos.map((c) => Math.abs(c.desvioPct)), 50);

  // Right ticks
  const rightCeil = Math.ceil(maxPos / 50) * 50 || 100;
  const rightTicks: number[] = [];
  const rightStep = rightCeil <= 200 ? 50 : 100;
  for (let t = 0; t <= rightCeil; t += rightStep) rightTicks.push(t);

  // Left ticks
  const leftCeil = Math.ceil(maxNeg / 50) * 50 || 100;
  const leftTicks: number[] = [];
  for (let t = 0; t <= leftCeil; t += 50) leftTicks.push(t);

  const barH = 20;
  const rowGap = 6;

  // Obtener los peores infractores
  const topOffenders = positivos.slice(0, 2);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-3.5 sm:p-5 md:p-6 w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-xs sm:text-sm font-semibold text-[#e6edf3] m-0">
            Desvío del rendimiento contra el objetivo
          </h3>
          {selectedId && onSelect && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="px-2.5 py-1 rounded-md cursor-pointer bg-[#1a9a7a]/10 border border-[#1a9a7a]/30 text-xs font-semibold text-[#1a9a7a] hover:bg-[#1a9a7a]/20 transition"
            >
              ✕ Ver todos
            </button>
          )}
        </div>
      </div>

      {/* ─── MOBILE VIEW (< md): Clean stacked horizontal bars ─── */}
      <div className="block md:hidden space-y-5">
        {/* Positivos (Exceso) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#d99b42] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#d99b42]" />
              Por encima del objetivo
            </span>
            <span className="text-[11px] text-[#636e7b]">{positivos.length} camiones</span>
          </div>

          <div className="flex flex-col gap-2">
            {positivos.map((c) => {
              const isSelected = selectedId === c.id;
              const barPct = Math.min((c.desvioPct / (rightCeil || 1)) * 100, 100);

              return (
                <div
                  key={c.id}
                  onClick={() => onSelect && onSelect(isSelected ? null : c.id)}
                  className={`flex items-center justify-between gap-2.5 py-1 px-2 rounded cursor-pointer transition ${
                    isSelected ? "bg-[#d99b42]/15 ring-1 ring-[#d99b42]/40" : "hover:bg-white/[0.02]"
                  }`}
                  style={{ opacity: selectedId && !isSelected ? 0.4 : 1 }}
                >
                  <span className="text-xs font-mono font-semibold text-white w-20 shrink-0">
                    {c.placa}
                  </span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 bg-white/[0.04] rounded h-3 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(barPct, 4)}%` }}
                        className="h-full bg-[#d99b42] rounded transition-all duration-300"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#d99b42] min-w-[55px] text-right shrink-0">
                      +{c.desvioPct.toFixed(1)} %
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Negativos (Dentro del objetivo) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1a9a7a] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#1a9a7a]" />
              Dentro o por debajo del objetivo
            </span>
            <span className="text-[11px] text-[#636e7b]">{negativos.length} camiones</span>
          </div>

          <div className="flex flex-col gap-2">
            {negativos.map((c) => {
              const isSelected = selectedId === c.id;
              const absVal = Math.abs(c.desvioPct);
              const barPct = Math.min((absVal / (leftCeil || 1)) * 100, 100);

              return (
                <div
                  key={c.id}
                  onClick={() => onSelect && onSelect(isSelected ? null : c.id)}
                  className={`flex items-center justify-between gap-2.5 py-1 px-2 rounded cursor-pointer transition ${
                    isSelected ? "bg-[#1a9a7a]/15 ring-1 ring-[#1a9a7a]/40" : "hover:bg-white/[0.02]"
                  }`}
                  style={{ opacity: selectedId && !isSelected ? 0.4 : 1 }}
                >
                  <span className="text-xs font-mono font-semibold text-white w-20 shrink-0">
                    {c.placa}
                  </span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 bg-white/[0.04] rounded h-3 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(barPct, 4)}%` }}
                        className="h-full bg-[#1a9a7a] rounded transition-all duration-300"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1a9a7a] min-w-[55px] text-right shrink-0">
                      -{absVal.toFixed(1)} %
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP / TABLET VIEW (>= md): Butterfly / Tornado comparison chart ─── */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin">
        <div className="min-w-[600px] grid grid-cols-2 gap-0">
          {/* ═══════ LEFT PANEL: Negative desvío (below objective) ═══════ */}
          <div style={{ borderRight: "2px solid rgba(255,255,255,0.15)", paddingRight: "16px" }}>
            {/* Axis ticks */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", paddingRight: "92px" }}>
              {[...leftTicks].reverse().map((t) => (
                <span key={t} style={{ fontSize: "10px", color: "#636e7b", minWidth: "30px", textAlign: "center" }}>
                  {t === 0 ? "" : `-${t} %`}
                </span>
              ))}
              <span style={{ fontSize: "10px", color: "#8b949e", fontWeight: 600, minWidth: "50px", textAlign: "right" }}>
                objetivo
              </span>
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: `${rowGap}px` }}>
              {negativos.map((c) => {
                const isSelected = selectedId === c.id;
                const absVal = Math.abs(c.desvioPct);
                const barPct = Math.min((absVal / (leftCeil || 1)) * 100, 95);

                return (
                  <div
                    key={c.id}
                    onClick={() => onSelect && onSelect(isSelected ? null : c.id)}
                    style={{
                      display: "flex", alignItems: "center", height: `${barH}px`, cursor: "pointer",
                      opacity: selectedId && !isSelected ? 0.3 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, marginRight: "6px", whiteSpace: "nowrap",
                        color: "#1a9a7a",
                      }}>
                        -{absVal.toFixed(1)} %
                      </span>
                      <div style={{
                        height: `${barH - 4}px`, borderRadius: "3px 0 0 3px",
                        background: "#1a9a7a",
                        width: `${barPct}%`, minWidth: "4px",
                        transition: "width 0.3s ease",
                      }} />
                    </div>

                    <span style={{
                      fontSize: "10px", fontWeight: 600, color: "#ffffff",
                      width: "84px", flexShrink: 0, fontFamily: "monospace",
                      marginLeft: "8px", textAlign: "right",
                    }}>
                      {c.placa}
                    </span>
                  </div>
                );
              })}

              {Array.from({ length: Math.max(0, positivos.length - negativos.length) }).map((_, i) => (
                <div key={`empty-left-${i}`} style={{ height: `${barH}px` }} />
              ))}
            </div>
          </div>

          {/* ═══════ RIGHT PANEL: Positive desvío (above objective) ═══════ */}
          <div style={{ paddingLeft: "16px" }}>
            {/* Axis ticks */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", paddingLeft: "92px" }}>
              {rightTicks.map((t) => (
                <span key={t} style={{ fontSize: "10px", color: "#636e7b", minWidth: "30px", textAlign: "center" }}>
                  {t === 0 ? "" : `+${t} %`}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: `${rowGap}px` }}>
              {positivos.map((c) => {
                const isSelected = selectedId === c.id;
                const barPct = Math.min((c.desvioPct / (rightCeil || 1)) * 100, 95);

                return (
                  <div
                    key={c.id}
                    onClick={() => onSelect && onSelect(isSelected ? null : c.id)}
                    style={{
                      display: "flex", alignItems: "center", height: `${barH}px`, cursor: "pointer",
                      opacity: selectedId && !isSelected ? 0.3 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <span style={{
                      fontSize: "10px", fontWeight: 600, color: "#ffffff",
                      width: "84px", flexShrink: 0, fontFamily: "monospace",
                      marginRight: "8px",
                    }}>
                      {c.placa}
                    </span>

                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                      <div style={{
                        height: `${barH - 4}px`, borderRadius: "0 3px 3px 0",
                        background: "#d99b42",
                        width: `${barPct}%`, minWidth: "4px",
                        transition: "width 0.3s ease",
                      }} />
                      <span style={{
                        fontSize: "10px", fontWeight: 700, marginLeft: "6px", whiteSpace: "nowrap",
                        color: "#d99b42",
                      }}>
                        +{c.desvioPct.toFixed(1)} %
                      </span>
                    </div>
                  </div>
                );
              })}

              {Array.from({ length: Math.max(0, negativos.length - positivos.length) }).map((_, i) => (
                <div key={`empty-right-${i}`} style={{ height: `${barH}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Legend ─── */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 sm:mt-6 pt-3 sm:pt-3.5 border-t border-white/[0.06] text-[11px] text-[#636e7b]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#d99b42] inline-block shrink-0" />
          <span>Por encima del objetivo · consume de más</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#1a9a7a] inline-block shrink-0" />
          <span>Dentro o por debajo del objetivo</span>
        </span>
      </div>

      {/* Dynamic bottom note */}
      {topOffenders.length === 2 ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-400 font-sans">
          Dos maquinarias concentran el problema: <strong className="text-slate-200">{topOffenders[0].placa}</strong> y{" "}
          <strong className="text-slate-200">{topOffenders[1].placa}</strong> están con los mayores desvíos y entre las{" "}
          dos explican el {(topOffenders[0].pctGasto + topOffenders[1].pctGasto).toFixed(1).replace(".", ",")} % del gasto de combustible de la flota. Ahí es donde hay que mirar primero, y revisar también su uso en ralentí.
        </p>
      ) : topOffenders.length === 1 ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-400 font-sans">
          Una maquinaria concentra el problema: <strong className="text-slate-200">{topOffenders[0].placa}</strong> {" "}
          explica el {topOffenders[0].pctGasto.toFixed(1).replace(".", ",")} % del gasto de combustible de la flota con el mayor desvío. Ahí es donde hay que mirar primero, y revisar también su uso en ralentí.
        </p>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-slate-400 font-sans">
          Toda la flota se encuentra dentro del objetivo. ¡Buen trabajo!
        </p>
      )}
    </div>
  );
}
