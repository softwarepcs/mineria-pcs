
import React from "react";
import { Maximize2, Minimize2, ChevronRight } from "lucide-react";
import { type CamionUnidad, getStatusColor } from "@/data/camionesData";

interface CamionesMapaProps {
  mapWrapperRef: React.RefObject<HTMLDivElement | null>;
  isFullscreen: boolean;
  vistaMovil: string;
  capaMapa: "mapa" | "satelite";
  setCapaMapa: (capa: "mapa" | "satelite") => void;
  toggleFullscreen: () => void;
  currentTruck: CamionUnidad | undefined;
  setVistaMovil: (v: "unidades" | "mapa" | "detalle") => void;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function CamionesMapa({
  mapWrapperRef,
  isFullscreen,
  vistaMovil,
  capaMapa,
  setCapaMapa,
  toggleFullscreen,
  currentTruck,
  setVistaMovil,
  mapContainerRef
}: CamionesMapaProps) {
  return (
    <>
        {/* ─── COLUMN 2: MIDDLE MAP ─── */}
        <div
          ref={mapWrapperRef}
          className={`flex-1 relative h-full w-full bg-[#050911] overflow-hidden ${
            isFullscreen ? "fixed inset-0 z-[99999]" : ""
          } ${
            vistaMovil === "mapa" ? "flex" : "hidden xl:flex"
          }`}
        >
          {/* Map Controls Top Right */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 z-[1000] flex items-center gap-2"
          >
            {/* Mapa | Satélite Pill */}
            <div className="flex items-center rounded-lg bg-[#0d1422]/90 border border-white/15 p-0.5 shadow-xl backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setCapaMapa("mapa")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  capaMapa === "mapa"
                    ? "bg-[#0df5c6] text-[#07131b] shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Mapa
              </button>
              <button
                type="button"
                onClick={() => setCapaMapa("satelite")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  capaMapa === "satelite"
                    ? "bg-[#0df5c6] text-[#07131b] shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Satélite
              </button>
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              className="p-1.5 rounded-lg bg-[#0d1422]/90 border border-white/15 text-slate-300 hover:text-[#0df5c6] shadow-xl backdrop-blur-sm transition"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Floating Bottom Legend (desktop only, to not overlap mobile bottom card) */}
          <div className="hidden xl:flex absolute bottom-4 left-4 z-[1000] items-center gap-4 px-3.5 py-1.5 rounded-full bg-[#0d1422]/90 border border-white/10 shadow-2xl backdrop-blur-md text-[11px] font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0df5c6] shadow-[0_0_6px_#0df5c6]" />
              En marcha
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]" />
              Ralenti
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3b82f6] shadow-[0_0_6px_#3b82f6]" />
              Operando
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#64748b]" />
              Sin señal
            </span>
          </div>

          {/* Scale Legend bottom right (desktop only) */}
          <div className="hidden xl:flex absolute bottom-4 right-4 z-[1000] items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/50 px-2 py-0.5 rounded border border-white/10">
            <span className="w-8 border-b-2 border-slate-400 inline-block mr-1" />
            10 km
          </div>

          {/* Mobile Selected Truck Bottom Floating Card (< xl) */}
          {vistaMovil === "mapa" && currentTruck && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="xl:hidden absolute bottom-3 left-3 right-3 z-[1000] rounded-xl border border-white/15 bg-[#0c121d]/95 backdrop-blur-md p-3 shadow-2xl animate-fade-in flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: getStatusColor(currentTruck.estado),
                      boxShadow: `0 0 8px ${getStatusColor(currentTruck.estado)}`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide truncate">
                        {currentTruck.placa}
                      </span>
                      <span
                        className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                        style={{
                          color: getStatusColor(currentTruck.estado),
                          backgroundColor: `${getStatusColor(currentTruck.estado)}20`,
                        }}
                      >
                        {currentTruck.estadoLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {currentTruck.conductor} • {currentTruck.modelo}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setVistaMovil("detalle")}
                  className="shrink-0 flex items-center gap-1 rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] px-3 py-1.5 text-xs font-bold text-[#07131b] transition shadow"
                >
                  <span>Ver detalle</span>
                  <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Quick Metrics Bar inside the card on mobile */}
              <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-white/10 text-center">
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Vel.</span>
                  <span className="text-[11px] font-bold text-white font-mono">{currentTruck.velocidadKmH} <span className="text-[8px] text-slate-400">km/h</span></span>
                </div>
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Caudal</span>
                  <span className="text-[11px] font-bold text-white font-mono">{currentTruck.caudalLh} <span className="text-[8px] text-slate-400">L/h</span></span>
                </div>
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Consumo</span>
                  <span className="text-[11px] font-bold text-white font-mono">{currentTruck.consumoDiaL} <span className="text-[8px] text-slate-400">L</span></span>
                </div>
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Desvío</span>
                  <span className={`text-[11px] font-bold font-mono ${currentTruck.desvioPct >= 0 ? "text-[#fbbf24]" : "text-[#0df5c6]"}`}>
                    {currentTruck.desvioPct > 0 ? `+${currentTruck.desvioPct}%` : `${currentTruck.desvioPct}%`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div ref={mapContainerRef} className="h-full w-full bg-[#050911]" />
        </div>

        {/* ─── COLUMN 3: RIGHT UNIT DETAIL PANEL ─── */}
    </>
  );
}
