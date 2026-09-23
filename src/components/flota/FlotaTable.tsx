import { useState } from "react";
import type { Maquinaria } from "../../types";

type Columna = keyof Pick<Maquinaria, "km" | "litros" | "l100km" | "desvioPct" | "ralentiPct" | "horas" | "pctGasto" | "co2Ton">;

const COLUMNAS: { key: Columna; label: string }[] = [
  { key: "km", label: "KM" },
  { key: "litros", label: "Litros" },
  { key: "l100km", label: "L/100 km" },
  { key: "desvioPct", label: "Desvío" },
  { key: "ralentiPct", label: "Ralentí" },
  { key: "horas", label: "Horas" },
  { key: "pctGasto", label: "% del gasto" },
  { key: "co2Ton", label: "CO₂ (T)" },
];

function EstadoBadge({ estado }: { estado: string }) {
  let bg = "rgba(100,116,139,0.12)";
  let color = "#636e7b";
  let label = "OFFLINE";

  if (estado === "conduccion" || estado === "en_linea") {
    bg = "rgba(26,154,122,0.12)";
    color = "#1a9a7a";
    label = "EN LÍNEA";
  } else if (estado === "ralentí") {
    bg = "rgba(217,155,66,0.12)";
    color = "#d99b42";
    label = "RALENTÍ";
  } else if (estado === "ralenti") {
    bg = "rgba(217,155,66,0.12)";
    color = "#d99b42";
    label = "RALENTÍ";
  } else if (estado === "sin_datos") {
    bg = "rgba(100,116,139,0.12)";
    color = "#636e7b";
    label = "SIN DATOS";
  }

  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "4px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em",
      background: bg, color, border: `1px solid ${color}33`,
    }}>
      {label}
    </span>
  );
}

export function FlotaTable({
  maquinarias,
  selectedId,
  onSelect,
  mode = "full",
}: {
  maquinarias: Maquinaria[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mode?: "full" | "alerts";
}) {
  const [orden, setOrden] = useState<{ col: Columna; dir: "asc" | "desc" }>({ col: "desvioPct", dir: "desc" });

  const ordenados = [...maquinarias].sort((a, b) =>
    orden.dir === "desc" ? b[orden.col] - a[orden.col] : a[orden.col] - b[orden.col]
  );

  function alClicColumna(col: Columna) {
    setOrden((prev) => (prev.col === col ? { col, dir: prev.dir === "desc" ? "asc" : "desc" } : { col, dir: "desc" }));
  }

  // ─── ALERTS PANEL (sidebar next to map) ───
  if (mode === "alerts") {
    const alertas = ordenados.filter((c) => c.desvioPct > 0 || (c.estado as string) === "revisar" || (c.estado as string) === "sin_datos").slice(0, 5);

    return (
      <div className="h-full flex flex-col justify-start p-3.5 sm:p-4 md:p-5 rounded-xl border border-white/[0.06] bg-[#0d1117] overflow-hidden">
        <h3 className="text-xs sm:text-sm font-bold text-[#e6edf3] m-0 mb-3 sm:mb-4">
          Requieren atención
        </h3>
        <div className="flex flex-col gap-2 sm:gap-2.5 flex-1 overflow-y-auto max-h-[380px] lg:max-h-none">
          {alertas.map((c) => {
            const razon = c.desvioPct > 100
              ? "Consumo fuera de objetivo"
              : c.ralentiPct > 40
              ? `Ralentí alto · ${c.horas} h`
              : (c.estado as string) === "sin_datos"
              ? "Sin transmisión reciente"
              : c.desvioPct > 50
              ? "Paradas extensas no planificadas"
              : "Desvío de ruta detectado";

            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer transition ${
                  selectedId === c.id
                    ? "bg-[#1a9a7a]/15 border border-[#1a9a7a]/30"
                    : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ background: c.desvioPct > 100 ? "#d99b42" : "#d99b42" }}
                    />
                    <span className="text-xs sm:text-[13px] font-semibold text-[#e6edf3] truncate">
                      {c.placa}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#636e7b] pl-4 block truncate">
                    {razon}
                  </span>
                </div>
                <span
                  className="text-xs sm:text-[13px] font-bold whitespace-nowrap shrink-0"
                  style={{ color: c.desvioPct > 0 ? "#d99b42" : "#1a9a7a" }}
                >
                  +{c.desvioPct.toFixed(1)} %
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── FULL TABLE ───
  return (
    <div className="mp-table-container w-full rounded-xl border border-white/[0.06] bg-[#0d1117] overflow-hidden">
      <div className="mp-table-toolbar flex flex-wrap items-center justify-between gap-2.5 px-3.5 sm:px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-xs sm:text-sm font-semibold text-[#e6edf3] m-0">
            Comparativa por camión
          </h3>
          {selectedId && (
            <button
              type="button"
              onClick={() => onSelect("")}
              className="px-2.5 py-1 rounded-md cursor-pointer bg-[#1a9a7a]/10 border border-[#1a9a7a]/30 text-xs font-semibold text-[#1a9a7a] hover:bg-[#1a9a7a]/20 transition"
            >
              ✕ Ver todos
            </button>
          )}
        </div>
        <span className="text-[11px] text-[#636e7b]">
          ordenada por {COLUMNAS.find((c) => c.key === orden.col)?.label.toLowerCase()}
        </span>
      </div>

      <div className="mp-table-wrapper w-full overflow-x-auto scrollbar-thin">
        <table className="mp-table w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="py-2.5 px-3.5 sm:px-5 text-[11px] font-semibold uppercase tracking-wider text-[#636e7b] whitespace-nowrap">
                Camión
              </th>
              {COLUMNAS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => alClicColumna(c.key)}
                  className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#636e7b] whitespace-nowrap cursor-pointer text-right select-none hover:text-[#e6edf3] transition"
                >
                  {c.label}
                </th>
              ))}
              <th className="py-2.5 px-3.5 sm:px-5 text-[11px] font-semibold uppercase tracking-wider text-[#636e7b] whitespace-nowrap text-right">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((c) => {
              const activo = c.id === selectedId;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(activo ? "" : c.id)}
                  style={{
                    cursor: "pointer",
                    background: activo ? "rgba(26,154,122,0.06)" : undefined,
                    borderLeft: activo ? "3px solid #1a9a7a" : "3px solid transparent",
                  }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.025] transition"
                >
                  <td className="py-2 px-3.5 sm:px-5 font-semibold text-[#e6edf3] whitespace-nowrap">
                    {c.placa}
                  </td>
                  <td className="py-2 px-3 text-right text-[#c9d1d9] whitespace-nowrap">{c.km.toLocaleString("es-PE")}</td>
                  <td className="py-2 px-3 text-right text-[#c9d1d9] whitespace-nowrap">{c.litros.toLocaleString("es-PE")}</td>
                  <td className="py-2 px-3 text-right text-[#c9d1d9] whitespace-nowrap">{c.l100km.toFixed(1)}</td>
                  <td
                    className="py-2 px-3 text-right font-semibold whitespace-nowrap"
                    style={{ color: c.desvioPct > 0 ? "#d99b42" : "#1a9a7a" }}
                  >
                    {c.desvioPct > 0 ? "+" : ""}{c.desvioPct.toFixed(1)} %
                  </td>
                  <td className="py-2 px-3 text-right text-[#c9d1d9] whitespace-nowrap">{c.ralentiPct} %</td>
                  <td className="py-2 px-3 text-right text-[#c9d1d9] whitespace-nowrap">{c.horas}</td>
                  <td className="py-2 px-3 text-right text-[#c9d1d9] whitespace-nowrap">{c.pctGasto.toFixed(1)} %</td>
                  <td className="py-2 px-3 text-right text-[#c9d1d9] whitespace-nowrap">{c.co2Ton.toFixed(2)}</td>
                  <td className="py-2 px-3.5 sm:px-5 text-right whitespace-nowrap">
                    <EstadoBadge estado={c.estado} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
