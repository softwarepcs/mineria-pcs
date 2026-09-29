import { Link } from "react-router-dom";
import { ChevronLeft, X, User, Battery, Signal, Clock } from "lucide-react";
import { type CamionUnidad, getStatusColor } from "@/data/camionesData";

interface CamionesPanelDetalleProps {
  currentTruck: CamionUnidad;
  empresaId: string;
  vistaMovil: string;
  setVistaMovil: (v: "unidades" | "mapa" | "detalle") => void;
  setSelectedId: (id: string) => void;
}

export function CamionesPanelDetalle({
  currentTruck,
  empresaId,
  vistaMovil,
  setVistaMovil,
  setSelectedId
}: CamionesPanelDetalleProps) {
  return (
        <aside
          className={`w-full xl:w-[340px] shrink-0 border-l border-white/10 bg-[#090e18] flex flex-col h-full overflow-y-auto sidebar-scroll ${
            vistaMovil === "detalle" ? "flex" : "hidden xl:flex"
          }`}
        >
          {/* Mobile Back Bar (< xl) */}
          <div className="p-3 border-b border-white/10 flex xl:hidden items-center justify-between bg-[#0e1624]">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setVistaMovil("mapa")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0df5c6] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Volver al mapa</span>
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setVistaMovil("unidades")}
              className="text-xs text-slate-400 hover:text-white"
            >
              Ver todas las unidades
            </button>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-white/10 relative">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {currentTruck.placa}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentTruck.modelo} • {currentTruck.tipoCarga}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                  style={{
                    color: getStatusColor(currentTruck.estado),
                    borderColor: `${getStatusColor(currentTruck.estado)}44`,
                    backgroundColor: `${getStatusColor(currentTruck.estado)}15`,
                  }}
                >
                  {currentTruck.estadoLabel.toUpperCase()}
                </span>
                <button
                  type="button"
                  title="Cerrar detalle"
                  onClick={() => {
                    setSelectedId("");
                    setVistaMovil("mapa");
                  }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Driver Profile Card */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#121926] p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700/60 text-[#0df5c6] font-bold text-sm">
                  {currentTruck.conductor ? currentTruck.conductor.charAt(0) : <User className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                    <span>{currentTruck.conductor}</span>
                    {currentTruck.legajo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                        Leg. {currentTruck.legajo}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    <span>{currentTruck.turno}</span>
                    {currentTruck.base && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{currentTruck.base}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6 Key Metric Indicators */}
          <div className="p-4 border-b border-white/10 grid grid-cols-3 gap-3">
            {/* VELOCIDAD */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Velocidad
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {currentTruck.velocidadKmH}
                </span>
                <span className="text-[11px] text-slate-400">km/h</span>
              </div>
            </div>

            {/* CAUDAL */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Caudal
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {currentTruck.caudalLh}
                </span>
                <span className="text-[11px] text-slate-400">L/h</span>
              </div>
            </div>

            {/* CONSUMO DEL DÍA */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Consumo del día
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {currentTruck.consumoDiaL}
                </span>
                <span className="text-[11px] text-slate-400">L</span>
              </div>
            </div>

            {/* RENDIMIENTO */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Rendimiento
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {currentTruck.rendimientoL100km.toFixed(1).replace(".", ",")}
                </span>
                <span className="text-[10px] text-slate-400">L/100 km</span>
              </div>
            </div>

            {/* HORÓMETRO */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Horómetro
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {currentTruck.horometroH.toLocaleString("es-AR")}
                </span>
                <span className="text-[11px] text-slate-400">h</span>
              </div>
            </div>

            {/* RALENTÍ DEL DÍA */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Ralentí del día
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {currentTruck.ralentiPct.toFixed(1).replace(".", ",")}
                </span>
                <span className="text-[11px] text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Smooth Fuel Flow Area Chart (Caudal de combustible) */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">
              Caudal de combustible (últimas 4 horas)
            </h3>

            <div className="relative w-full h-32 mt-2">
              {/* SVG Area Chart */}
              <svg
                viewBox="0 0 300 100"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0df5c6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0df5c6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />

                {/* Y Ticks labels */}
                <text x="5" y="18" fill="#64748b" fontSize="8" fontFamily="monospace">600</text>
                <text x="5" y="48" fill="#64748b" fontSize="8" fontFamily="monospace">400</text>
                <text x="5" y="78" fill="#64748b" fontSize="8" fontFamily="monospace">200</text>
                <text x="5" y="98" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>

                {/* Path Area */}
                <path
                  d="M 25 60 Q 60 40, 95 65 T 160 55 T 225 80 T 290 55 L 290 100 L 25 100 Z"
                  fill="url(#cyanGradient)"
                />

                {/* Path Stroke Line */}
                <path
                  d="M 25 60 Q 60 40, 95 65 T 160 55 T 225 80 T 290 55"
                  fill="none"
                  stroke="#0df5c6"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              {/* X Time Labels */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
                <span>12:00</span>
                <span>13:00</span>
                <span>14:00</span>
                <span>15:00</span>
                <span>16:00</span>
              </div>
            </div>
          </div>

          {/* Equipment Status: Estado del equipo */}
          <div className="p-4 border-b border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 block mb-3">
              Estado del equipo
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Batería */}
              <div className="rounded-lg bg-[#111827] border border-white/5 p-2">
                <div className="flex justify-center text-emerald-400 mb-1">
                  <Battery className="h-4 w-4" />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Batería
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {currentTruck.bateriaPct} %
                </span>
              </div>

              {/* Señal */}
              <div className="rounded-lg bg-[#111827] border border-white/5 p-2">
                <div className="flex justify-center text-cyan-400 mb-1">
                  <Signal className="h-4 w-4" />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Señal
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {currentTruck.senalEstado}
                </span>
              </div>

              {/* Último dato */}
              <div className="rounded-lg bg-[#111827] border border-white/5 p-2">
                <div className="flex justify-center text-slate-400 mb-1">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Último dato
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {currentTruck.estado === "sin_senal"
                    ? `${Math.round(currentTruck.ultimoDatoSec / 60)} min`
                    : `${currentTruck.ultimoDatoSec} s`}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="p-4 mt-auto space-y-2">
            <Link
              to={`/empresa/${empresaId}/camiones-detalle?camionId=${encodeURIComponent(currentTruck.id)}`}
              className="flex w-full items-center justify-center rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] py-2.5 text-xs font-bold text-[#07131b] shadow-[0_0_15px_rgba(13,245,198,0.25)] transition"
            >
              Ver ficha completa
            </Link>

            <button
              type="button"
              onClick={() => alert(`Visualizando recorrido histórico para ${currentTruck.placa}...`)}
              className="flex w-full items-center justify-center rounded-lg border border-white/15 bg-[#121926] hover:bg-[#1a2335] py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              Ver recorrido
            </button>
          </div>
        </aside>
  );
}
