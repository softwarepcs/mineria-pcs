import type { MaquinariaStats as Maquinaria } from "@/features/flota/api";
import { ESTADO_UNIDAD } from "@/features/flota/estado";
import { DataTable, type Columna as ColumnaTabla } from "@/shared/ui/DataTable";
import { Badge } from "@/shared/ui/Badge";

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

function EstadoBadge({ estado }: { estado: Maquinaria["estado"] }) {
  const { color, etiqueta } = ESTADO_UNIDAD[estado] ?? ESTADO_UNIDAD.offline;
  return <Badge etiqueta={etiqueta} color={color} />;
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

  // ─── ALERTS PANEL (sidebar next to map) ───
  if (mode === "alerts") {
    const alertas = [...maquinarias]
      .sort((a, b) => b.desvioPct - a.desvioPct)
      .filter((c) => c.desvioPct > 0 || (c.estado as string) === "revisar" || (c.estado as string) === "sin_datos")
      .slice(0, 5);

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
  const columnasTabla: ColumnaTabla<Maquinaria>[] = [
    { key: "placa", encabezado: "Camión", render: (c) => <span className="font-semibold text-[#e6edf3]">{c.placa}</span> },
    ...COLUMNAS.map(c => ({
      key: c.key,
      encabezado: c.label,
      ordenable: true,
      valorOrden: (fila: Maquinaria) => fila[c.key],
      alinear: "right" as const,
      render: (fila: Maquinaria) => {
        if (c.key === "km" || c.key === "litros") return fila[c.key].toLocaleString("es-PE");
        if (c.key === "l100km") return fila[c.key].toFixed(1);
        if (c.key === "desvioPct") return <span style={{ color: fila.desvioPct > 0 ? "#d99b42" : "#1a9a7a" }} className="font-semibold">{fila.desvioPct > 0 ? "+" : ""}{fila.desvioPct.toFixed(1)} %</span>;
        if (c.key === "ralentiPct" || c.key === "pctGasto") return `${fila[c.key].toFixed(c.key === "pctGasto" ? 1 : 0)} %`;
        if (c.key === "co2Ton") return fila[c.key].toFixed(2);
        return fila[c.key];
      }
    })),
    { key: "estado", encabezado: "Estado", alinear: "right" as const, render: (c) => <EstadoBadge estado={c.estado} /> }
  ];

  return (
    <div className="mp-table-container flex flex-col w-full rounded-xl border border-white/[0.06] bg-[#0d1117] overflow-hidden">
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
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable
          columnas={columnasTabla}
          datos={maquinarias}
          keyExtractor={(c) => c.id}
          onClickFila={(c) => onSelect(c.id === selectedId ? "" : c.id)}
          filaActiva={selectedId}
          ordenInicial={{ col: "desvioPct", dir: "desc" }}
        />
      </div>
    </div>
  );
}
