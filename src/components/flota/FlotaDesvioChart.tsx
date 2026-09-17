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


  return (
    <div style={{
      borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)",
      background: "#0d1117", padding: "24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#e6edf3", margin: 0 }}>
            Desvío del rendimiento contra el objetivo
          </h3>
          {selectedId && onSelect && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              style={{
                padding: "3px 10px", borderRadius: "6px", cursor: "pointer",
                background: "rgba(26,154,122,0.1)", border: "1px solid rgba(26,154,122,0.3)",
                fontSize: "11px", fontWeight: 600, color: "#1a9a7a"
              }}
            >
              ✕ Ver todos
            </button>
          )}
        </div>
      </div>

      {/* ─── Two-panel layout ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>

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

          {/* Rows — each negative truck gets a number + bar + name at the center */}
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
                  {/* Number at the side of the bar + Bar growing right to left */}
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

                  {/* Truck name in the center (touching the central divider) in plain white letters */}
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

            {/* Fill empty rows if positivos has more trucks */}
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

          {/* Rows — each positive truck gets a named label + bar growing to the right */}
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
                  {/* Truck name in white letters */}
                  <span style={{
                    fontSize: "10px", fontWeight: 600, color: "#ffffff",
                    width: "84px", flexShrink: 0, fontFamily: "monospace",
                    marginRight: "8px",
                  }}>
                    {c.placa}
                  </span>

                  {/* Bar + label */}
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

            {/* Fill empty rows if negativos has more trucks */}
            {Array.from({ length: Math.max(0, negativos.length - positivos.length) }).map((_, i) => (
              <div key={`empty-right-${i}`} style={{ height: `${barH}px` }} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Legend ─── */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px",
        marginTop: "24px", paddingTop: "14px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontSize: "11px", color: "#636e7b"
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#d99b42", display: "inline-block" }} />
          Por encima del objetivo · consume de más
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#1a9a7a", display: "inline-block" }} />
          Dentro o por debajo del objetivo
        </span>
      </div>
    </div>
  );
}
