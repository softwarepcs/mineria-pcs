import React, { useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { 
  ChevronLeft, 
  Edit3, 
  X, 
  Check 
} from "lucide-react";
import operadoresData from "../../../data/operadores.json";

interface AssignmentHistory {
  camion: string;
  desde: string;
  hasta: string;
  viajes: number;
  km: number;
  indice: number;
}

interface AttributedAlert {
  id: string;
  tipo: string;
  fecha: string;
  camion: string;
  severidad: "danger" | "warning" | "info";
}

interface ScatterPoint {
  id: number;
  fecha: string;
  valor: number;
  camion: string;
}

// Fixed scatter points matching the timeline in the screenshot
const DEFAULT_SCATTER_POINTS: ScatterPoint[] = [
  { id: 1, fecha: "01 ago", valor: 0.94, camion: "TC-TRUCK-08" },
  { id: 2, fecha: "03 ago", valor: 0.88, camion: "TC-TRUCK-08" },
  { id: 3, fecha: "05 ago", valor: 0.92, camion: "TC-TRUCK-08" },
  { id: 4, fecha: "06 ago", valor: 0.93, camion: "TC-TRUCK-08" },
  { id: 5, fecha: "08 ago", valor: 1.07, camion: "TC-TRUCK-08" },
  { id: 6, fecha: "10 ago", valor: 1.01, camion: "TC-TRUCK-08" },
  { id: 7, fecha: "12 ago", valor: 0.95, camion: "TC-TRUCK-08" },
  { id: 8, fecha: "14 ago", valor: 1.04, camion: "TC-TRUCK-08" },
  { id: 9, fecha: "16 ago", valor: 0.96, camion: "TC-TRUCK-08" },
  { id: 10, fecha: "17 ago", valor: 0.91, camion: "TC-TRUCK-08" },
  { id: 11, fecha: "19 ago", valor: 1.04, camion: "TC-TRUCK-08" },
  { id: 12, fecha: "20 ago", valor: 1.07, camion: "TC-TRUCK-08" },
  { id: 13, fecha: "21 ago", valor: 0.97, camion: "TC-TRUCK-08" },
  { id: 14, fecha: "23 ago", valor: 0.93, camion: "TC-TRUCK-08" },
  { id: 15, fecha: "24 ago", valor: 0.89, camion: "TC-TRUCK-08" },
  { id: 16, fecha: "26 ago", valor: 0.94, camion: "TC-TRUCK-08" },
  { id: 17, fecha: "28 ago", valor: 0.95, camion: "TC-TRUCK-08" },
  { id: 18, fecha: "29 ago", valor: 1.02, camion: "TC-TRUCK-08" },
  { id: 19, fecha: "31 ago", valor: 1.01, camion: "TC-TRUCK-08" },
  { id: 20, fecha: "02 sep", valor: 0.91, camion: "TC-TRUCK-08" },
  { id: 21, fecha: "03 sep", valor: 0.89, camion: "TC-TRUCK-08" },
  { id: 22, fecha: "05 sep", valor: 0.91, camion: "TC-TRUCK-08" },
  { id: 23, fecha: "07 sep", valor: 0.87, camion: "TC-TRUCK-08" },
  { id: 24, fecha: "08 sep", valor: 1.05, camion: "TC-TRUCK-08" },
  { id: 25, fecha: "10 sep", valor: 0.94, camion: "TC-TRUCK-08" },
  { id: 26, fecha: "13 sep", valor: 1.04, camion: "TC-TRUCK-08" },
  { id: 27, fecha: "14 sep", valor: 1.04, camion: "TC-TRUCK-08" },
  { id: 28, fecha: "16 sep", valor: 0.95, camion: "TC-TRUCK-08" },
  { id: 29, fecha: "18 sep", valor: 0.90, camion: "TC-TRUCK-08" },
  { id: 30, fecha: "19 sep", valor: 0.92, camion: "TC-TRUCK-08" },
  { id: 31, fecha: "22 sep", valor: 1.07, camion: "TC-TRUCK-08" },
  { id: 32, fecha: "24 sep", valor: 0.91, camion: "TC-TRUCK-08" },
  { id: 33, fecha: "26 sep", valor: 0.96, camion: "TC-TRUCK-08" },
  { id: 34, fecha: "28 sep", valor: 0.93, camion: "TC-TRUCK-08" },
];

export function OperadorDetalleView() {
  const { id } = useParams(); // empresa id
  const [searchParams] = useSearchParams();
  const operadorParamId = searchParams.get("operadorId") || "op-1";

  // Selected period state: '30dias' | '90dias' | 'ano'
  const [periodo, setPeriodo] = useState<"30dias" | "90dias" | "ano">("30dias");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Active scatter point tooltip
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  // Find operator from json or fallback to Carlos Méndez (op-1)
  const initialOp = useMemo(() => {
    const found = operadoresData.find((o) => o.id === operadorParamId);
    return found || operadoresData[0];
  }, [operadorParamId]);

  // Local state for operator so editing works dynamically
  const [operador, setOperador] = useState(initialOp);
  const [editFormData, setEditFormData] = useState({
    nombre: initialOp.nombre,
    estado: initialOp.estado,
    base: initialOp.base || "EZEIZA",
    legajo: initialOp.legajo,
  });

  // Calculate dynamic stats based on period
  const stats = useMemo(() => {
    const mult = periodo === "30dias" ? 1 : periodo === "90dias" ? 2.8 : 11.2;
    const kmConducidos = Math.round((operador.kmPeriodo || 8426) * (periodo === "30dias" ? 1 : mult * 0.95));
    const horasVolante = Math.round((operador.horas || 180) * (periodo === "30dias" ? 1 : mult * 0.92));
    const viajesCount = Math.round((operador.viajes || 42) * (periodo === "30dias" ? 1 : mult * 0.94));
    const rendBruto = operador.rendimientoBruto || 33.8;
    const ralenti = operador.ralentiImproductivo || 11.4;
    const conduccionBrusca = operador.conduccionBrusca || 2.1;
    const indice = operador.indice !== null && operador.indice !== undefined ? operador.indice : 0.94;

    return {
      kmConducidos: new Intl.NumberFormat("es-AR").format(kmConducidos),
      horasVolante,
      viajesCount,
      rendBruto: rendBruto.toFixed(1).replace(".", ","),
      ralenti: ralenti.toFixed(1).replace(".", ","),
      conduccionBrusca: conduccionBrusca.toFixed(1).replace(".", ","),
      indice: indice.toFixed(2).replace(".", ","),
    };
  }, [operador, periodo]);

  // Documentations matching image
  const documentaciones = [
    {
      titulo: "Licencia profesional",
      codigo: operador.id === "op-1" ? "LNC-AR-284771" : `LNC-AR-${operador.legajo}84`,
      vence: operador.vencimientoLicencia || "2027-03-18",
      estado: "VIGENTE",
      colorType: "teal",
    },
    {
      titulo: "ART / cobertura",
      codigo: operador.id === "op-1" ? "ART-551938" : `ART-55${operador.legajo}`,
      vence: operador.vencimientoArt || "2026-12-09",
      estado: "VIGENTE",
      colorType: "teal",
    },
    {
      titulo: "Psicofísico",
      codigo: operador.id === "op-1" ? "PSI-882014" : `PSI-88${operador.legajo}`,
      vence: operador.vencimientoPsicofisico || "2026-10-11",
      estado: "VENCE EN 24 DÍAS",
      colorType: "amber",
    },
    {
      titulo: "Curso merc. peligrosas",
      codigo: operador.id === "op-1" ? "HAZ-190774" : `HAZ-19${operador.legajo}`,
      vence: operador.vencimientoPeligrosos || "2026-08-20",
      estado: "VENCIDA",
      colorType: "red",
    },
  ];

  // Historial de asignaciones matching image
  const asignaciones: AssignmentHistory[] = [
    {
      camion: operador.maquinariaId || "TC-TRUCK-08",
      desde: "2026-08-01",
      hasta: "Actual",
      viajes: 18,
      km: 3245,
      indice: 0.93,
    },
    {
      camion: "TC-TRUCK-11",
      desde: "2026-06-12",
      hasta: "2026-07-31",
      viajes: 11,
      km: 2118,
      indice: 1.02,
    },
    {
      camion: "TC-TRUCK-05",
      desde: "2026-04-08",
      hasta: "2026-06-11",
      viajes: 9,
      km: 1846,
      indice: 0.97,
    },
    {
      camion: "TC-TRUCK-03",
      desde: "2026-01-20",
      hasta: "2026-04-07",
      viajes: 7,
      km: 1217,
      indice: 0.99,
    },
  ];

  // Alertas atribuidas matching image
  const alertas: AttributedAlert[] = [
    {
      id: "alt-1",
      tipo: "Velocidad sin consumo",
      fecha: "2026-09-08 16:04",
      camion: operador.maquinariaId || "TC-TRUCK-08",
      severidad: "danger",
    },
    {
      id: "alt-2",
      tipo: "Ralentí prolongado",
      fecha: "2026-09-03 09:22",
      camion: "TC-TRUCK-11",
      severidad: "warning",
    },
    {
      id: "alt-3",
      tipo: "Desvío cerrado",
      fecha: "2026-08-27 18:10",
      camion: "TC-TRUCK-05",
      severidad: "info",
    },
  ];

  // Chart coordinate calculations
  // ViewBox: 0 0 1000 240
  // X: 70 to 930
  // Y: 25 (value 1.15) to 195 (value 0.85). Value 1.00 is at y = 110.
  const chartWidth = 1000;
  const chartHeight = 240;
  const paddingLeft = 70;
  const paddingRight = 70;
  const paddingTop = 25;
  const paddingBottom = 45;
  const innerWidth = chartWidth - paddingLeft - paddingRight; // 860
  const innerHeight = chartHeight - paddingTop - paddingBottom; // 170

  const getYCoord = (val: number) => {
    // val from 0.85 to 1.15
    const clamped = Math.max(0.85, Math.min(1.15, val));
    const ratio = (clamped - 0.85) / (1.15 - 0.85); // 0 at 0.85, 1 at 1.15
    return paddingTop + innerHeight * (1 - ratio);
  };

  const getXCoord = (index: number, total: number) => {
    return paddingLeft + (index / (total - 1)) * innerWidth;
  };

  const xDateTicks = [
    { label: "01 ago", pct: 0 },
    { label: "08 ago", pct: 0.125 },
    { label: "15 ago", pct: 0.25 },
    { label: "22 ago", pct: 0.375 },
    { label: "29 ago", pct: 0.5 },
    { label: "05 sep", pct: 0.625 },
    { label: "12 sep", pct: 0.75 },
    { label: "19 sep", pct: 0.875 },
    { label: "26 sep", pct: 1.0 },
  ];

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setOperador((prev) => ({
      ...prev,
      nombre: editFormData.nombre,
      estado: editFormData.estado as any,
      base: editFormData.base,
      legajo: editFormData.legajo,
    }));
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060a11] text-slate-200 pb-12 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-5">
        
        {/* ─── Back Button ─── */}
        <div>
          <Link
            to={`/empresa/${id}/operadores`}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-[#0df5c6] transition-colors py-1 px-2 rounded-lg hover:bg-white/[0.04]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a Operadores</span>
          </Link>
        </div>

        {/* ─── Top Header Section ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-2">
          {/* Operator Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#172332] border border-white/10 flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
              <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
              </svg>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {operador.nombre}
                </h1>
                <span className="rounded-md border border-[#0df5c6]/40 bg-[#042f2e]/60 px-2.5 py-0.5 text-xs font-bold text-[#0df5c6] uppercase tracking-wider">
                  {operador.estado}
                </span>
              </div>
              <div className="text-xs sm:text-[13px] text-slate-400 font-mono tracking-wider">
                LEGAJO {operador.legajo}&nbsp;&nbsp;·&nbsp;&nbsp;BASE {operador.base || "EZEIZA"}&nbsp;&nbsp;·&nbsp;&nbsp;INGRESO {operador.ingreso || "2023-04-12"}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Period Selector */}
            <div className="inline-flex rounded-lg p-0.5 border border-slate-800 bg-[#0e1724]">
              <button
                type="button"
                onClick={() => setPeriodo("30dias")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  periodo === "30dias"
                    ? "border border-[#0df5c6] text-[#0df5c6] bg-[#0df5c6]/10 shadow-sm"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                30 días
              </button>
              <button
                type="button"
                onClick={() => setPeriodo("90dias")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  periodo === "90dias"
                    ? "border border-[#0df5c6] text-[#0df5c6] bg-[#0df5c6]/10 shadow-sm"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                90 días
              </button>
              <button
                type="button"
                onClick={() => setPeriodo("ano")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  periodo === "ano"
                    ? "border border-[#0df5c6] text-[#0df5c6] bg-[#0df5c6]/10 shadow-sm"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                Año
              </button>
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => {
                setEditFormData({
                  nombre: operador.nombre,
                  estado: operador.estado,
                  base: operador.base || "EZEIZA",
                  legajo: operador.legajo,
                });
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0e1724] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 hover:border-slate-500"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-300" />
              <span>Editar</span>
            </button>
          </div>
        </div>

        {/* ─── Top Grid: Documentación & Rendimiento del período ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Card 1: DOCUMENTACIÓN */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1421] p-5 shadow-xl flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="text-white text-xs">DOCUMENTACIÓN</span>
                <div className="flex items-center gap-10 pr-2">
                  <span>VENCE EL</span>
                  <span className="w-20 text-center">ESTADO</span>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/[0.04]">
                {documentaciones.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3.5">
                    {/* Left: Indicator bar & Title/Code */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-1.5 h-8 rounded-full shrink-0 ${
                          doc.colorType === "teal"
                            ? "bg-[#0df5c6]"
                            : doc.colorType === "amber"
                            ? "bg-[#f59e0b]"
                            : "bg-[#ef4444]"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {doc.titulo}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 uppercase">
                          {doc.codigo}
                        </div>
                      </div>
                    </div>

                    {/* Right: Date & Status Badge */}
                    <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                      <span className="text-sm font-mono text-slate-300">
                        {doc.vence}
                      </span>
                      <div className="w-32 flex justify-end">
                        <span
                          className={`inline-block text-[11px] font-bold px-3 py-1 rounded text-center tracking-wide border ${
                            doc.colorType === "teal"
                              ? "border-[#0df5c6]/40 bg-[#0df5c6]/10 text-[#0df5c6]"
                              : doc.colorType === "amber"
                              ? "border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b]"
                              : "border-[#ef4444]/50 bg-[#ef4444]/10 text-[#ef4444]"
                          }`}
                        >
                          {doc.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: RENDIMIENTO DEL PERÍODO */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1421] p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                RENDIMIENTO DEL PERÍODO
              </div>

              {/* Big hero number & comparison */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl sm:text-6xl font-black text-[#0df5c6] tracking-tight leading-none">
                  {stats.indice}
                </span>
                <span className="text-sm text-slate-300 font-normal">
                  mejor que el promedio de flota
                </span>
              </div>

              {/* 3x2 Metrics Grid */}
              <div className="grid grid-cols-3 gap-y-5 gap-x-4">
                {/* Row 1 */}
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    KM CONDUCIDOS
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                    {stats.kmConducidos} km
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    HORAS AL VOLANTE
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                    {stats.horasVolante} h
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    VIAJES
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                    {stats.viajesCount}
                  </div>
                </div>

                {/* Row 2 */}
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    RENDIMIENTO BRUTO
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                    {stats.rendBruto} L/100 km
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    RALENTÍ IMPRODUCTIVO
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                    {stats.ralenti} %
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    CONDUCCIÓN BRUSCA
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                    {stats.conduccionBrusca} %
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom footnote */}
            <div className="pt-4 mt-6 border-t border-white/[0.05] text-[11px] text-slate-400">
              Atribución declarada&nbsp;&nbsp;·&nbsp;&nbsp;92 % de las horas del período
            </div>
          </div>
        </div>

        {/* ─── Middle Full-Width Card: ÍNDICE POR VIAJE COMPARABLE ─── */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1421] p-5 shadow-xl relative">
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            ÍNDICE POR VIAJE COMPARABLE
          </div>

          <div className="w-full relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[700px] select-none"
              style={{ overflow: "visible" }}
            >
              {/* Y Axis Guide Lines & Labels */}
              {/* 1.15 */}
              <text
                x="35"
                y={getYCoord(1.15) + 4}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="end"
              >
                1,15
              </text>
              <line
                x1={paddingLeft}
                y1={getYCoord(1.15)}
                x2={chartWidth - paddingRight}
                y2={getYCoord(1.15)}
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* 1.00 (Baseline) */}
              <text
                x="35"
                y={getYCoord(1.00) + 4}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="end"
              >
                1,00
              </text>
              <line
                x1={paddingLeft}
                y1={getYCoord(1.00)}
                x2={chartWidth - paddingRight}
                y2={getYCoord(1.00)}
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={chartWidth - paddingRight + 8}
                y={getYCoord(1.00) + 4}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="sans-serif"
              >
                promedio de flota
              </text>

              {/* 0.85 */}
              <text
                x="35"
                y={getYCoord(0.85) + 4}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="end"
              >
                0,85
              </text>
              <line
                x1={paddingLeft}
                y1={getYCoord(0.85)}
                x2={chartWidth - paddingRight}
                y2={getYCoord(0.85)}
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* X Axis ticks and labels */}
              {xDateTicks.map((tick, i) => {
                const xPos = paddingLeft + tick.pct * innerWidth;
                return (
                  <g key={i}>
                    <text
                      x={xPos}
                      y={chartHeight - 12}
                      fill="#94a3b8"
                      fontSize="11"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}

              {/* Data points */}
              {DEFAULT_SCATTER_POINTS.map((pt, i) => {
                const cx = getXCoord(i, DEFAULT_SCATTER_POINTS.length);
                const cy = getYCoord(pt.valor);
                const isOver = pt.valor > 1.0;
                const dotColor = isOver ? "#f59e0b" : "#0df5c6";
                const isHovered = hoveredPoint?.id === pt.id;

                return (
                  <g
                    key={pt.id}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredPoint(pt);
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Hover Pulse Ring */}
                    {isHovered && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="9"
                        fill="none"
                        stroke={dotColor}
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    )}
                    {/* Main Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5.5 : 3.8}
                      fill={dotColor}
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating tooltip on hover */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur-md"
                style={{
                  top: 15,
                  right: 25,
                }}
              >
                <div className="font-semibold text-slate-300">
                  {hoveredPoint.fecha} 2026 · {hoveredPoint.camion}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-slate-400">Índice comparable:</span>
                  <span
                    className={`font-bold font-mono ${
                      hoveredPoint.valor > 1.0 ? "text-[#f59e0b]" : "text-[#0df5c6]"
                    }`}
                  >
                    {hoveredPoint.valor.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {hoveredPoint.valor > 1.0
                    ? "Por encima del promedio"
                    : "Por debajo del promedio (Eficiente)"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom Grid: Historial de Asignaciones & Alertas Atribuidas ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Card 4: HISTORIAL DE ASIGNACIONES */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1421] p-5 shadow-xl">
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              HISTORIAL DE ASIGNACIONES
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4 font-semibold">CAMIÓN</th>
                    <th className="pb-3 px-3 font-semibold">DESDE</th>
                    <th className="pb-3 px-3 font-semibold">HASTA</th>
                    <th className="pb-3 px-3 text-right font-semibold">VIAJES</th>
                    <th className="pb-3 px-3 text-right font-semibold">KM</th>
                    <th className="pb-3 pl-3 text-right font-semibold">ÍNDICE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {asignaciones.map((asig, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-mono font-medium text-white">
                        {asig.camion}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {asig.desde}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {asig.hasta}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white">
                        {asig.viajes}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white">
                        {new Intl.NumberFormat("es-AR").format(asig.km)}
                      </td>
                      <td
                        className={`py-3 pl-3 text-right font-mono font-bold ${
                          asig.indice > 1.0 ? "text-[#f59e0b]" : "text-[#0df5c6]"
                        }`}
                      >
                        {asig.indice.toFixed(2).replace(".", ",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 5: ALERTAS ATRIBUIDAS */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1421] p-5 shadow-xl">
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              ALERTAS ATRIBUIDAS
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4 font-semibold">ALERTA</th>
                    <th className="pb-3 px-4 font-semibold">FECHA</th>
                    <th className="pb-3 pl-4 font-semibold">CAMIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {alertas.map((alt) => (
                    <tr key={alt.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-1.5 h-6 rounded-full shrink-0 ${
                              alt.severidad === "danger"
                                ? "bg-[#ef4444]"
                                : alt.severidad === "warning"
                                ? "bg-[#f59e0b]"
                                : "bg-[#0df5c6]"
                            }`}
                          />
                          <span className="font-medium text-white">
                            {alt.tipo}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {alt.fecha}
                      </td>
                      <td className="py-3.5 pl-4 font-mono text-slate-300 font-medium">
                        {alt.camion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* ─── Edit Operator Modal ─── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1522] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Editar Operador</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.nombre}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-800/80 px-3 py-2 text-sm text-white ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0df5c6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Legajo
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.legajo}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, legajo: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-800/80 px-3 py-2 text-sm text-white ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0df5c6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Base Operativa
                </label>
                <input
                  type="text"
                  value={editFormData.base}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, base: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-800/80 px-3 py-2 text-sm text-white ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0df5c6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Estado
                </label>
                <select
                  value={editFormData.estado}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, estado: e.target.value as any }))
                  }
                  className="w-full rounded-lg bg-slate-800/80 px-3 py-2 text-sm text-white ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0df5c6]"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="DE LICENCIA">DE LICENCIA</option>
                  <option value="SIN ASIGNAR">SIN ASIGNAR</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-[#0df5c6] hover:bg-[#0be0b5] rounded-lg transition"
                >
                  <Check className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
