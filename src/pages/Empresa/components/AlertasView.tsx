import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import alertasData from "../../../data/alertasData.json";

interface Evidencia {
  etiquetaZona: string;
  horarioZona: string;
  zonaPeligroInicioPct: number;
  zonaPeligroFinPct: number;
  caudalMax: number;
  velocidadMax: number;
  ticksTiempo: string[];
  puntosCaudal: number[];
  puntosVelocidad: number[];
}

interface Metricas {
  duracion: string;
  distanciaRecorrida: string;
  velocidadMedia: string;
  consumoRegistrado: string;
  consumoEsperado: string;
  altitudNeta: string;
  lecturasSensor: string;
  ignicion: string;
}

interface AlertaItem {
  id: string;
  tipo: string;
  severidad: "critica" | "alta" | "normal";
  estado: "activa" | "cerrada";
  fecha: string;
  duracion: string;
  duracionMin: number;
  camion: string;
  ventanaHoraria: string;
  metricas: Metricas;
  evidencia: Evidencia;
  descripcion: string;
}

function MiniChart({
  puntos,
  maxVal,
  strokeColor,
  fillGradId,
  zonaPeligro,
  altura = 75,
}: {
  puntos: number[];
  maxVal: number;
  strokeColor: string;
  fillGradId: string;
  zonaPeligro?: {
    inicioPct: number;
    finPct: number;
    etiqueta?: string;
    subetiqueta?: string;
  };
  altura?: number;
}) {
  const W = 600;
  const H = altura;
  const padBottom = 8;
  const padTop = 6;
  const graphH = H - padBottom - padTop;

  const coords = puntos.map((v, i) => {
    const x = (i / Math.max(puntos.length - 1, 1)) * W;
    const y = H - padBottom - (Math.min(v, maxVal) / maxVal) * graphH;
    return { x, y };
  });

  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${H - padBottom} L ${coords[0].x.toFixed(1)} ${H - padBottom} Z`
    : "";

  const dangerX1 = zonaPeligro ? (zonaPeligro.inicioPct / 100) * W : 0;
  const dangerX2 = zonaPeligro ? (zonaPeligro.finPct / 100) * W : 0;
  const dangerW = Math.max(0, dangerX2 - dangerX1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: `${H}px`, display: "block" }}>
      <defs>
        <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.28} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      <line x1="0" y1={padTop} x2={W} y2={padTop} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
      <line x1="0" y1={padTop + graphH / 2} x2={W} y2={padTop + graphH / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
      <line x1="0" y1={H - padBottom} x2={W} y2={H - padBottom} stroke="rgba(255,255,255,0.08)" />

      {/* Shaded danger region */}
      {zonaPeligro && dangerW > 0 && (
        <g>
          <rect
            x={dangerX1}
            y={padTop}
            width={dangerW}
            height={graphH}
            fill="rgba(239, 83, 80, 0.10)"
          />
          <line
            x1={dangerX1}
            y1={padTop}
            x2={dangerX1}
            y2={H - padBottom}
            stroke="#ef5350"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={dangerX2}
            y1={padTop}
            x2={dangerX2}
            y2={H - padBottom}
            stroke="#ef5350"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {zonaPeligro.etiqueta && (
            <text
              x={dangerX1 + dangerW / 2}
              y={padTop + 14}
              textAnchor="middle"
              fill="#ef5350"
              fontSize="10"
              fontWeight="600"
            >
              {zonaPeligro.etiqueta}
            </text>
          )}
          {zonaPeligro.subetiqueta && (
            <text
              x={dangerX1 + dangerW / 2}
              y={padTop + 27}
              textAnchor="middle"
              fill="#ef5350"
              fontSize="9"
              fontWeight="500"
              opacity="0.9"
            >
              {zonaPeligro.subetiqueta}
            </text>
          )}
        </g>
      )}

      {/* Area fill */}
      {areaD && <path d={areaD} fill={`url(#${fillGradId})`} />}

      {/* Main Curve */}
      {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export function AlertasView({ empresaNombre: _empresaNombre }: { empresaNombre?: string } = {}) {
  const [alertasList] = useState<AlertaItem[]>(alertasData.alertas as AlertaItem[]);
  const [selectedId, setSelectedId] = useState<string>(alertasData.alertas[0]?.id || "alt-1");
  const [reconocidas, setReconocidas] = useState<Set<string>>(new Set());
  
  // Mobile tab state: "list" or "detail"
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  const selectedAlert = alertasList.find((a) => a.id === selectedId) || alertasList[0];

  const handleReconocer = (id: string) => {
    setReconocidas((prev) => new Set([...prev, id]));
  };

  const isCritica = selectedAlert?.severidad === "critica";
  const isAlta = selectedAlert?.severidad === "alta";
  const isCerrada = selectedAlert?.estado === "cerrada";
  const yaReconocida = reconocidas.has(selectedAlert?.id || "");

  // Counting badges
  const countCriticas = alertasList.filter((a) => a.severidad === "critica" && a.estado !== "cerrada").length;
  const countAltas = alertasList.filter((a) => a.severidad === "alta" && a.estado !== "cerrada").length;

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-10 px-2 sm:px-4 font-sans">
      {/* ─── Top Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mr-1">
            Alertas
          </h2>

          {/* Badges */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
              countCriticas > 0
                ? "bg-red-500/15 border border-red-500 text-red-400"
                : "bg-white/[0.04] border border-white/10 text-slate-400"
            }`}
          >
            Críticas {countCriticas}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-white/10 text-slate-400">
            Altas {countAltas}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-white/10 text-slate-400">
            {alertasData.resumen.periodo}
          </div>
        </div>

        {/* Mobile Tab Toggle (< lg) */}
        <div className="flex lg:hidden rounded-lg p-0.5 border border-white/10 bg-[#0e1420] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mobileTab === "list"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Lista de alertas ({alertasList.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("detail")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mobileTab === "detail"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Detalle de alerta
          </button>
        </div>
      </div>

      {/* ─── Two-Column Main Layout (Desktop: Side-by-side; Mobile: Tabbed/Responsive) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-5 items-start">

        {/* ═══════ LEFT COLUMN: Lista de alertas ═══════ */}
        <div className={`flex-col gap-2.5 ${mobileTab === "list" ? "flex" : "hidden lg:flex"}`}>
          <div className="flex justify-between items-center px-1 pb-1 text-xs">
            <span className="font-semibold text-slate-200">Lista de alertas</span>
            <span className="text-slate-500 font-mono">{alertasList.length} alertas</span>
          </div>

          <div className="flex flex-col gap-2">
            {alertasList.map((a) => {
              const isSelected = selectedId === a.id;
              const cardCritica = a.severidad === "critica";
              const cardAlta = a.severidad === "alta";
              const cardCerrada = a.estado === "cerrada";

              const stripColor = cardCerrada
                ? "#484f58"
                : cardCritica
                ? "#ef5350"
                : cardAlta
                ? "#d99b42"
                : "#1a9a7a";

              return (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedId(a.id);
                    setMobileTab("detail");
                  }}
                  className={`flex rounded-lg overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#161b22] border-white/20 shadow-md"
                      : "bg-[#0d1117] border-white/[0.06] hover:border-white/10 hover:bg-[#12161f]"
                  }`}
                >
                  {/* Colored indicator strip */}
                  <div
                    className="w-1 shrink-0"
                    style={{ background: stripColor }}
                  />

                  {/* Body */}
                  <div className="p-3 sm:py-3 sm:px-3.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs sm:text-[13px] font-bold text-white truncate">
                        {a.tipo}
                      </span>

                      {/* Status Badges: CRÍTICA, ALTA, CERRADA */}
                      {cardCritica && !cardCerrada && (
                        <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#ef5350] text-[#ef5350] bg-red-500/10 shrink-0">
                          CRÍTICA
                        </span>
                      )}
                      {cardAlta && !cardCerrada && (
                        <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#d99b42] text-[#d99b42] bg-amber-500/10 shrink-0">
                          ALTA
                        </span>
                      )}
                      {cardCerrada && (
                        <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-white/15 text-slate-400 shrink-0">
                          CERRADA
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium font-mono">
                      {a.fecha} &middot; {a.duracion} &middot; {a.camion}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════ RIGHT COLUMN: Detalle de Alerta ═══════ */}
        {selectedAlert && (
          <div
            className={`rounded-xl bg-[#0d1117] p-4 sm:p-6 flex flex-col gap-5 border transition-all ${
              mobileTab === "detail" ? "flex" : "hidden lg:flex"
            } ${
              isCritica
                ? "border-[#e05252] shadow-[0_0_24px_rgba(224,82,82,0.08)]"
                : isAlta
                ? "border-[#d99b42]/40"
                : "border-white/[0.08]"
            }`}
          >
            {/* Mobile Back Button (< lg) */}
            <div className="flex lg:hidden pb-1">
              <button
                type="button"
                onClick={() => setMobileTab("list")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a la lista de alertas</span>
              </button>
            </div>

            {/* Header of the detail card */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3
                  className={`text-lg sm:text-xl font-bold tracking-tight ${
                    isCritica ? "text-[#ef5350]" : isAlta ? "text-[#d99b42]" : "text-white"
                  }`}
                >
                  {selectedAlert.tipo}
                </h3>
                <span
                  className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${
                    isCritica
                      ? "border-[#ef5350] text-[#ef5350] bg-red-500/10"
                      : isAlta
                      ? "border-[#d99b42] text-[#d99b42] bg-amber-500/10"
                      : "border-white/20 text-slate-400"
                  }`}
                >
                  {isCritica ? "CRÍTICA" : isAlta ? "ALTA" : isCerrada ? "CERRADA" : "NORMAL"}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-sm font-bold text-white font-mono">
                  {selectedAlert.camion}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {selectedAlert.ventanaHoraria}
                </div>
              </div>
            </div>

            {/* 4x2 Metric Grid (Responsive: 2-col on mobile, 4-col on tablet/desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-white/[0.08] divide-y sm:divide-y-0 divide-white/[0.08]">
              {/* Row 1, Col 1: DURACIÓN */}
              <div className="p-3 sm:p-3.5 border-r border-white/[0.08] sm:border-b">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  DURACIÓN
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.duracion.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    {selectedAlert.metricas.duracion.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 1, Col 2: DISTANCIA RECORRIDA */}
              <div className="p-3 sm:p-3.5 sm:border-r border-white/[0.08] sm:border-b">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  DISTANCIA RECORRIDA
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.distanciaRecorrida.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    {selectedAlert.metricas.distanciaRecorrida.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 1, Col 3: VELOCIDAD MEDIA */}
              <div className="p-3 sm:p-3.5 border-r border-white/[0.08] sm:border-b">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  VELOCIDAD MEDIA
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.velocidadMedia.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    {selectedAlert.metricas.velocidadMedia.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 1, Col 4: CONSUMO REGISTRADO */}
              <div className="p-3 sm:p-3.5 sm:border-b border-white/[0.08]">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  CONSUMO REGISTRADO
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.consumoRegistrado.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    {selectedAlert.metricas.consumoRegistrado.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 2, Col 1: CONSUMO ESPERADO */}
              <div className="p-3 sm:p-3.5 border-r border-white/[0.08]">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  CONSUMO ESPERADO
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.consumoEsperado.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    {selectedAlert.metricas.consumoEsperado.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 2, Col 2: ALTITUD NETA */}
              <div className="p-3 sm:p-3.5 sm:border-r border-white/[0.08]">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  ALTITUD NETA
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.altitudNeta.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    {selectedAlert.metricas.altitudNeta.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 2, Col 3: LECTURAS DEL SENSOR */}
              <div className="p-3 sm:p-3.5 border-r border-white/[0.08]">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  LECTURAS DEL SENSOR
                </div>
                <div className="text-base sm:text-lg font-bold text-white font-mono pt-1">
                  {selectedAlert.metricas.lecturasSensor}
                </div>
              </div>

              {/* Row 2, Col 4: IGNICIÓN */}
              <div className="p-3 sm:p-3.5">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  IGNICIÓN
                </div>
                <div className="text-sm sm:text-base font-bold text-white pt-1">
                  {selectedAlert.metricas.ignicion}
                </div>
              </div>
            </div>

            {/* Section: Evidencia */}
            <div className="flex flex-col gap-3.5">
              <div className="text-sm font-bold text-white">
                Evidencia
              </div>

              {/* Chart 1: Caudal de combustible */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">
                  Caudal de combustible &middot; L/h
                </div>
                <div className="flex gap-2 items-stretch overflow-x-auto">
                  {/* Y-axis labels */}
                  <div className="w-6 flex flex-col justify-between text-[9px] text-slate-500 text-right pr-1 font-mono shrink-0 select-none">
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                  </div>
                  {/* SVG Chart */}
                  <div className="flex-1 min-w-[280px]">
                    <MiniChart
                      puntos={selectedAlert.evidencia.puntosCaudal}
                      maxVal={selectedAlert.evidencia.caudalMax}
                      strokeColor="#00ebb0"
                      fillGradId="gradCaudal"
                      altura={85}
                      zonaPeligro={{
                        inicioPct: selectedAlert.evidencia.zonaPeligroInicioPct,
                        finPct: selectedAlert.evidencia.zonaPeligroFinPct,
                        etiqueta: selectedAlert.evidencia.etiquetaZona,
                        subetiqueta: selectedAlert.evidencia.horarioZona,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Chart 2: Velocidad */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">
                  Velocidad &middot; km/h
                </div>
                <div className="flex gap-2 items-stretch overflow-x-auto">
                  {/* Y-axis labels */}
                  <div className="w-6 flex flex-col justify-between text-[9px] text-slate-500 text-right pr-1 font-mono shrink-0 select-none">
                    <span>120</span>
                    <span>80</span>
                    <span>40</span>
                    <span>0</span>
                  </div>
                  {/* SVG Chart */}
                  <div className="flex-1 min-w-[280px]">
                    <MiniChart
                      puntos={selectedAlert.evidencia.puntosVelocidad}
                      maxVal={selectedAlert.evidencia.velocidadMax}
                      strokeColor="#58a6ff"
                      fillGradId="gradVelocidad"
                      altura={85}
                      zonaPeligro={{
                        inicioPct: selectedAlert.evidencia.zonaPeligroInicioPct,
                        finPct: selectedAlert.evidencia.zonaPeligroFinPct,
                      }}
                    />
                    {/* Time ticks row */}
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono select-none">
                      {selectedAlert.evidencia.ticksTiempo.map((tick, idx) => (
                        <span key={idx}>{tick}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs leading-relaxed text-slate-400 my-1">
              {selectedAlert.descripcion}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleReconocer(selectedAlert.id)}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold text-white transition-colors ${
                  yaReconocida ? "bg-[#1a9a7a]" : "bg-[#ef5350] hover:bg-[#e04845]"
                }`}
              >
                {yaReconocida ? "Reconocida ✓" : "Reconocer"}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
