import { type CamionUnidad, getStatusColor } from "@/data/camionesData";

interface CamionesListSideProps {
  filteredCamiones: CamionUnidad[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  vistaMovil: string;
  setVistaMovil: (v: "unidades" | "mapa" | "detalle") => void;
}

export function CamionesListSide({
  filteredCamiones,
  selectedId,
  setSelectedId,
  vistaMovil,
  setVistaMovil
}: CamionesListSideProps) {
  return (
        <aside
          className={`w-full xl:w-[280px] shrink-0 border-r border-white/10 bg-[#090e18] flex flex-col h-full overflow-hidden ${
            vistaMovil === "unidades" ? "flex" : "hidden xl:flex"
          }`}
        >
          <div className="shrink-0 px-3 py-2.5 border-b border-white/10 text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Unidades ({filteredCamiones.length})</span>
            <span className="text-[10px] text-slate-500 xl:hidden">Toca para centrar en el mapa</span>
          </div>

          <div className="flex-1 overflow-y-auto sidebar-scroll divide-y divide-white/[0.04]">
            {filteredCamiones.map((truck) => {
              const isSelected = truck.id === selectedId;
              const statusColor = getStatusColor(truck.estado);
              const isPositive = truck.desvioPct >= 0;

              return (
                <div
                  key={truck.id}
                  onClick={() => {
                    setSelectedId(truck.id);
                    setVistaMovil("mapa");
                  }}
                  className={`p-3 cursor-pointer transition relative ${
                    isSelected
                      ? "bg-[#111c2e] border-l-4 border-[#0df5c6]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Top line: Status Dot + Placa + Percentage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: statusColor,
                          boxShadow: `0 0 6px ${statusColor}`,
                        }}
                      />
                      <span className="text-xs font-bold text-white tracking-wide">
                        {truck.placa}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono font-semibold ${
                        truck.desvioPct === 0
                          ? "text-slate-500"
                          : isPositive
                          ? "text-[#fbbf24]"
                          : "text-[#0df5c6]"
                      }`}
                    >
                      {truck.desvioPct === 0
                        ? "—"
                        : `${isPositive ? "+" : ""}${truck.desvioPct.toFixed(1).replace(".", ",")} %`}
                    </span>
                  </div>

                  {/* Second line: Status Label */}
                  <div
                    className="mt-0.5 text-[11px] font-medium"
                    style={{ color: statusColor }}
                  >
                    {truck.estadoLabel}
                  </div>

                  {/* Third line: Driver Name */}
                  <div className="text-[11px] text-slate-300 truncate">
                    {truck.conductor}
                  </div>

                  {/* Fourth line: Metrics summary */}
                  <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
                    {truck.estado === "sin_senal" ? (
                      `--- km/h • --- L/h • ${Math.round(truck.ultimoDatoSec / 60)} min`
                    ) : (
                      `${truck.velocidadKmH} km/h • ${truck.caudalLh} L/h • ${truck.ultimoDatoSec} s`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
  );
}
