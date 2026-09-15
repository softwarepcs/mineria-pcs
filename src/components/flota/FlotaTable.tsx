import { useState } from "react";
import type { Maquinaria } from "../../types";

type Columna = keyof Pick<Maquinaria, "km" | "litros" | "l100km" | "desvioPct" | "ralentiPct" | "horas" | "pctGasto">;

const COLUMNAS: { key: Columna; label: string }[] = [
  { key: "km", label: "KM" },
  { key: "litros", label: "Litros" },
  { key: "l100km", label: "L/100 km" },
  { key: "desvioPct", label: "Desvío" },
  { key: "ralentiPct", label: "Ralentí" },
  { key: "horas", label: "Horas" },
  { key: "pctGasto", label: "% del gasto" },
];

export function FlotaTable({
  maquinarias,
  selectedId,
  onSelect,
}: {
  maquinarias: Maquinaria[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [orden, setOrden] = useState<{ col: Columna; dir: "asc" | "desc" }>({ col: "desvioPct", dir: "desc" });

  const ordenados = [...maquinarias].sort((a, b) =>
    orden.dir === "desc" ? b[orden.col] - a[orden.col] : a[orden.col] - b[orden.col]
  );

  function alClicColumna(col: Columna) {
    setOrden((prev) => (prev.col === col ? { col, dir: prev.dir === "desc" ? "asc" : "desc" } : { col, dir: "desc" }));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Comparativa por camión</h3>
          {selectedId && (
            <button
              type="button"
              onClick={() => onSelect("")}
              className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300 hover:bg-cyan-500/20"
            >
              ✕ Ver todos
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          ordenada por {COLUMNAS.find((c) => c.key === orden.col)?.label.toLowerCase()} · clic en fila para filtrar y hacer zoom
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-2.5 font-medium">Camión</th>
              {COLUMNAS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => alClicColumna(c.key)}
                  className="cursor-pointer select-none px-4 py-2.5 text-right font-medium transition hover:text-white"
                >
                  {c.label}
                </th>
              ))}
              <th className="px-5 py-2.5 text-right font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ordenados.map((c) => {
              const activo = c.id === selectedId;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(activo ? "" : c.id)}
                  className={`cursor-pointer transition ${
                    activo
                      ? "bg-blue-500/20 ring-1 ring-blue-400/50"
                      : "hover:bg-white/5"
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-white">{c.placa}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{c.km.toLocaleString("es-PE")}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{c.litros.toLocaleString("es-PE")}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{c.l100km.toFixed(1)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${c.desvioPct > 0 ? "text-amber-400" : "text-green-400"}`}>
                    {c.desvioPct > 0 ? "+" : ""}
                    {c.desvioPct.toFixed(1)} %
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{c.ralentiPct} %</td>
                  <td className="px-4 py-3 text-right text-slate-300">{c.horas}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{c.pctGasto.toFixed(1)} %</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
                        c.estado === "revisar" ? "bg-amber-500/10 text-amber-400" : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {c.estado === "revisar" ? "REVISAR" : "EN LÍNEA"}
                    </span>
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

