import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { getAlertasEventos, getAlertaEventoById } from "@/services/alertasService";

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

// ─── Enums del dominio (deben coincidir exactamente con el backend) ───────────
type NivelSeveridad = "CRITICO" | "ALTO" | "MEDIO" | "BAJO";
type EstadoAlerta   = "GENERADO" | "ATENDIDO" | "CERRADO";

interface AlertaItem {
  id: string;
  tipo: string;
  severidad: NivelSeveridad;
  estado: EstadoAlerta;
  fecha: string;
  duracion: string;
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

// ─── Helpers de mapeo (normalizan cualquier valor que llegue del API) ─────────
function mapSeveridad(raw: string): NivelSeveridad {
  const v = (raw || "").toUpperCase();
  if (v === "CRITICO" || v === "CRITICA") return "CRITICO";
  if (v === "ALTO"    || v === "ALTA")    return "ALTO";
  if (v === "MEDIO"   || v === "MEDIA")   return "MEDIO";
  return "BAJO";
}
function mapEstado(raw: string): EstadoAlerta {
  const v = (raw || "").toUpperCase();
  if (v === "GENERADO" || v === "GENERADA") return "GENERADO";
  if (v === "ATENDIDO" || v === "ATENDIDA") return "ATENDIDO";
  return "CERRADO";
}

// ─── Paletas de color por enum ────────────────────────────────────────────────
const SEV_STYLES: Record<NivelSeveridad, { strip: string; border: string; text: string; bg: string; label: string }> = {
  CRITICO: { strip: "#ef5350", border: "border-[#ef5350]", text: "text-[#ef5350]", bg: "bg-red-500/10",    label: "CRÍTICO" },
  ALTO:    { strip: "#d99b42", border: "border-[#d99b42]", text: "text-[#d99b42]", bg: "bg-amber-500/10",  label: "ALTO"   },
  MEDIO:   { strip: "#60a5fa", border: "border-blue-400",  text: "text-blue-400",  bg: "bg-blue-500/10",   label: "MEDIO"  },
  BAJO:    { strip: "#1a9a7a", border: "border-teal-500",  text: "text-teal-400",  bg: "bg-teal-500/10",   label: "BAJO"   },
};
const EST_STYLES: Record<EstadoAlerta, { border: string; text: string; bg: string }> = {
  GENERADO: { border: "border-blue-500/50",  text: "text-blue-400",  bg: "bg-blue-500/10"  },
  ATENDIDO: { border: "border-green-500/50", text: "text-green-400", bg: "bg-green-500/10" },
  CERRADO:  { border: "border-white/15",     text: "text-slate-400", bg: "bg-white/5"       },
};

export function AlertasView({ empresaNombre: _empresaNombre }: { empresaNombre?: string } = {}) {
  const [alertasList, setAlertasList] = useState<AlertaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedAlertDetail, setSelectedAlertDetail] = useState<AlertaItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [reconocidas, setReconocidas] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlertasEventos();
        const mapped = data.map((b: any): AlertaItem => ({
          id:             String(b.id),
          tipo:           b.regla.toUpperCase(),
          severidad:      mapSeveridad(b.severidad),
          estado:         mapEstado(b.estado),
          fecha:          new Date(b.fechaHora).toLocaleDateString(),
          duracion:       "—",
          camion:         b.placa || b.maquinaria,
          ventanaHoraria: new Date(b.fechaHora).toLocaleTimeString(),
          metricas:  { duracion: "", distanciaRecorrida: "", velocidadMedia: "", consumoRegistrado: "", consumoEsperado: "", altitudNeta: "", lecturasSensor: "", ignicion: "" },
          evidencia: { etiquetaZona: "", horarioZona: "", zonaPeligroInicioPct: 0, zonaPeligroFinPct: 0, caudalMax: 0, velocidadMax: 0, ticksTiempo: [], puntosCaudal: [], puntosVelocidad: [] },
          descripcion: `Alerta de ${b.regla} detectada (${Number(b.valorRegistrado).toFixed(2)})`,
        }));
        setAlertasList(mapped);
        if (mapped.length > 0) setSelectedId(mapped[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setIsLoadingDetail(true);
    async function loadDetail() {
      try {
        const b = await getAlertaEventoById(selectedId);
        setSelectedAlertDetail({
          id:             String(b.id),
          tipo:           b.regla.toUpperCase(),
          severidad:      mapSeveridad(b.severidad),
          estado:         mapEstado(b.estado),
          fecha:          new Date(b.fechaHora).toLocaleDateString(),
          duracion:       b.metricas?.duracion || "—",
          camion:         b.placa || b.maquinaria,
          ventanaHoraria: new Date(b.fechaHora).toLocaleTimeString(),
          metricas:  b.metricas || { duracion: "0 min", distanciaRecorrida: "0 km", velocidadMedia: "0 km/h", consumoRegistrado: "0 L", consumoEsperado: "0 L", altitudNeta: "0 m", lecturasSensor: "0", ignicion: "Off" },
          evidencia: {
            ...b.evidencia,
            horarioZona: b.evidencia?.horarioZona ? new Date(b.evidencia.horarioZona).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : "",
          },
          descripcion: `Alerta de ${b.regla} detectada (${Number(b.valorRegistrado).toFixed(2)})`,
        });
      } catch (err) {
        console.error("Error al cargar detalle", err);
      } finally {
        setIsLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedId]);

  const selectedAlert = selectedAlertDetail;
  const handleReconocer = (id: string) => setReconocidas((prev) => new Set([...prev, id]));

  const sevStyle = selectedAlert ? SEV_STYLES[selectedAlert.severidad] : null;
  const estStyle = selectedAlert ? EST_STYLES[selectedAlert.estado]    : null;
  const yaReconocida = reconocidas.has(selectedAlert?.id || "");

  const countCriticos = alertasList.filter((a) => a.severidad === "CRITICO" && a.estado !== "CERRADO").length;
  const countAltos    = alertasList.filter((a) => a.severidad === "ALTO"    && a.estado !== "CERRADO").length;

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 px-2 sm:px-4 font-sans">
      {/* ─── Top Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mr-1">
            Alertas
          </h2>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
            countCriticos > 0
              ? "bg-red-500/15 border border-red-500 text-red-400"
              : "bg-white/4 border border-white/10 text-slate-400"
          }`}>
            Críticos {countCriticos}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-white/10 text-slate-400">
            Altos {countAltos}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-white/10 text-slate-400">
            Últimos 30 días
          </div>
        </div>

        {/* Mobile Tab Toggle */}
        <div className="flex lg:hidden rounded-lg p-0.5 border border-white/10 bg-[#0e1420] w-full sm:w-auto">
          <button type="button" onClick={() => setMobileTab("list")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${mobileTab === "list" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}>
            Lista de alertas ({alertasList.length})
          </button>
          <button type="button" onClick={() => setMobileTab("detail")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${mobileTab === "detail" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}>
            Detalle de alerta
          </button>
        </div>
      </div>

      {/* ─── Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-5 items-start">

        {/* LEFT COLUMN: Lista */}
        <div className={`flex-col gap-2.5 ${mobileTab === "list" ? "flex" : "hidden lg:flex"}`}>
          <div className="flex justify-between items-center px-1 pb-1 text-xs">
            <span className="font-semibold text-slate-200">Lista de alertas</span>
            <span className="text-slate-500 font-mono">{alertasList.length} alertas</span>
          </div>

          <div className="flex flex-col gap-2">
            {alertasList.map((a) => {
              const isSelected = selectedId === a.id;
              const ss = SEV_STYLES[a.severidad];
              const es = EST_STYLES[a.estado];

              return (
                <div
                  key={a.id}
                  onClick={() => { setSelectedId(a.id); setMobileTab("detail"); }}
                  className={`flex rounded-lg overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#161b22] border-white/20 shadow-md"
                      : "bg-[#0d1117] border-white/6 hover:border-white/10 hover:bg-[#12161f]"
                  }`}
                >
                  {/* Franja de color por severidad */}
                  <div className="w-1 shrink-0" style={{ background: ss.strip }} />

                  {/* Body */}
                  <div className="p-3 sm:py-3 sm:px-3.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs sm:text-[13px] font-bold text-white truncate">
                        {a.tipo}
                      </span>
                      {/* Badge de ESTADO */}
                      <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${es.border} ${es.text} ${es.bg}`}>
                        {a.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Badge de SEVERIDAD */}
                      <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${ss.border} ${ss.text} ${ss.bg}`}>
                        {ss.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">
                        {a.fecha} &middot; {a.camion}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skeleton */}
        {isLoadingDetail && !selectedAlertDetail && (
          <div className={`rounded-xl bg-[#0d1117] p-4 sm:p-6 border border-white/8 ${mobileTab === "detail" ? "flex" : "hidden lg:flex"} flex-col gap-5 animate-pulse`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-2.5">
                <div className="h-6 w-32 rounded bg-white/10" />
                <div className="h-5 w-16 rounded bg-white/10" />
                <div className="h-5 w-16 rounded bg-white/10" />
              </div>
              <div className="h-5 w-20 rounded bg-white/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-3 border border-white/8 rounded">
                  <div className="h-2.5 w-16 rounded bg-white/10" />
                  <div className="h-7 w-12 rounded bg-white/10" />
                </div>
              ))}
            </div>
            <div className="h-32 w-full rounded bg-white/5" />
            <div className="h-32 w-full rounded bg-white/5" />
          </div>
        )}

        {/* Panel de detalle */}
        {(selectedAlert || (!isLoadingDetail && selectedAlert)) && sevStyle && estStyle && (
          <div className={`rounded-xl bg-[#0d1117] p-4 sm:p-6 flex flex-col gap-5 border transition-all ${
            isLoadingDetail ? "opacity-60" : "opacity-100"
          } ${
            mobileTab === "detail" ? "flex" : "hidden lg:flex"
          } ${
            selectedAlert.severidad === "CRITICO"
              ? "border-[#e05252] shadow-[0_0_24px_rgba(224,82,82,0.08)]"
              : selectedAlert.severidad === "ALTO"
              ? "border-[#d99b42]/40"
              : "border-white/8"
          }`}>
            {/* Mobile Back */}
            <div className="flex lg:hidden pb-1">
              <button type="button" onClick={() => setMobileTab("list")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a la lista de alertas</span>
              </button>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${sevStyle.text}`}>
                  {selectedAlert.tipo}
                </h3>
                {/* Badge NIVEL DE SEVERIDAD */}
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${sevStyle.border} ${sevStyle.text} ${sevStyle.bg}`}>
                  {sevStyle.label}
                </span>
                {/* Badge ESTADO */}
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${estStyle.border} ${estStyle.text} ${estStyle.bg}`}>
                  {selectedAlert.estado}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-sm font-bold text-white font-mono">{selectedAlert.camion}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedAlert.ventanaHoraria}</div>
              </div>
            </div>

            {/* Grid de métricas 4x2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-white/8 divide-y sm:divide-y-0 divide-white/8">
              <div className="p-3 sm:p-3.5 border-r border-white/8 sm:border-b">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">DURACIÓN</div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.duracion.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">{selectedAlert.metricas.duracion.split(" ").slice(1).join(" ")}</span>
                </div>
              </div>
              <div className="p-3 sm:p-3.5 sm:border-r border-white/8 sm:border-b">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">DISTANCIA RECORRIDA</div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.distanciaRecorrida.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">{selectedAlert.metricas.distanciaRecorrida.split(" ").slice(1).join(" ")}</span>
                </div>
              </div>
              <div className="p-3 sm:p-3.5 border-r border-white/8 sm:border-b">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">VELOCIDAD MEDIA</div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.velocidadMedia.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">{selectedAlert.metricas.velocidadMedia.split(" ").slice(1).join(" ")}</span>
                </div>
              </div>
              <div className="p-3 sm:p-3.5 sm:border-b border-white/8">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">CONSUMO REGISTRADO</div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.consumoRegistrado.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">{selectedAlert.metricas.consumoRegistrado.split(" ").slice(1).join(" ")}</span>
                </div>
              </div>
              <div className="p-3 sm:p-3.5 border-r border-white/8">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">CONSUMO ESPERADO</div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.consumoEsperado.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">{selectedAlert.metricas.consumoEsperado.split(" ").slice(1).join(" ")}</span>
                </div>
              </div>
              <div className="p-3 sm:p-3.5 sm:border-r border-white/8">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">ALTITUD NETA</div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {selectedAlert.metricas.altitudNeta.split(" ")[0]}{" "}
                  <span className="text-xs font-medium text-slate-400 font-sans">{selectedAlert.metricas.altitudNeta.split(" ").slice(1).join(" ")}</span>
                </div>
              </div>
              <div className="p-3 sm:p-3.5 border-r border-white/8">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">LECTURAS DEL SENSOR</div>
                <div className="text-base sm:text-lg font-bold text-white font-mono pt-1">{selectedAlert.metricas.lecturasSensor}</div>
              </div>
              <div className="p-3 sm:p-3.5">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">IGNICIÓN</div>
                <div className="text-sm sm:text-base font-bold text-white pt-1">{selectedAlert.metricas.ignicion}</div>
              </div>
            </div>

            {/* Evidencia / Gráficas */}
            <div className="flex flex-col gap-3.5">
              <div className="text-sm font-bold text-white">Evidencia</div>

              {/* Chart 1: Caudal */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Caudal de combustible &middot; L/h</div>
                <div className="flex gap-2 items-stretch overflow-x-auto">
                  <div className="w-6 flex flex-col justify-between text-[9px] text-slate-500 text-right pr-1 font-mono shrink-0 select-none">
                    <span>{Math.round(selectedAlert.evidencia.caudalMax)}</span><span>{Math.round(selectedAlert.evidencia.caudalMax * 0.66)}</span><span>{Math.round(selectedAlert.evidencia.caudalMax * 0.33)}</span><span>0</span>
                  </div>
                  <div className="flex-1 min-w-70">
                    <MiniChart puntos={selectedAlert.evidencia.puntosCaudal} maxVal={selectedAlert.evidencia.caudalMax}
                      strokeColor="#00ebb0" fillGradId="gradCaudal" altura={85}
                      zonaPeligro={{ inicioPct: selectedAlert.evidencia.zonaPeligroInicioPct, finPct: selectedAlert.evidencia.zonaPeligroFinPct, etiqueta: selectedAlert.evidencia.etiquetaZona, subetiqueta: selectedAlert.evidencia.horarioZona }} />
                  </div>
                </div>
              </div>

              {/* Chart 2: Velocidad */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Velocidad &middot; km/h</div>
                <div className="flex gap-2 items-stretch overflow-x-auto">
                  <div className="w-6 flex flex-col justify-between text-[9px] text-slate-500 text-right pr-1 font-mono shrink-0 select-none">
                    <span>{Math.round(selectedAlert.evidencia.velocidadMax)}</span><span>{Math.round(selectedAlert.evidencia.velocidadMax * 0.66)}</span><span>{Math.round(selectedAlert.evidencia.velocidadMax * 0.33)}</span><span>0</span>
                  </div>
                  <div className="flex-1 min-w-70">
                    <MiniChart puntos={selectedAlert.evidencia.puntosVelocidad} maxVal={selectedAlert.evidencia.velocidadMax}
                      strokeColor="#58a6ff" fillGradId="gradVelocidad" altura={85}
                      zonaPeligro={{ inicioPct: selectedAlert.evidencia.zonaPeligroInicioPct, finPct: selectedAlert.evidencia.zonaPeligroFinPct }} />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono select-none overflow-hidden">
                      {selectedAlert.evidencia.ticksTiempo.map((tick, idx) => {
                          const date = new Date(tick);
                          const formatted = isNaN(date.getTime()) ? tick : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                          return <span key={idx}>{formatted}</span>;
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400 my-1">{selectedAlert.descripcion}</p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button type="button" onClick={() => handleReconocer(selectedAlert.id)}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold text-white transition-colors ${
                  yaReconocida ? "bg-[#1a9a7a]" : "bg-[#ef5350] hover:bg-[#e04845]"
                }`}>
                {yaReconocida ? "Reconocida ✓" : "Reconocer"}
              </button>
            </div>
          </div>
        )}

        {!isLoadingDetail && !selectedAlert && (
          <div className={`rounded-xl bg-[#0d1117] p-6 border border-white/8 ${mobileTab === "detail" ? "flex" : "hidden lg:flex"} items-center justify-center text-slate-500 text-sm`}>
            Selecciona una alerta para ver los detalles.
          </div>
        )}
      </div>
    </div>
  );
}

