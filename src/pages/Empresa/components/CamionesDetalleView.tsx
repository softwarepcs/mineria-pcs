import { useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { Empresa } from "../../../types";
import { DEFAULT_CAMIONES } from "./CamionesListaView";
import operadoresData from "../../../data/operadores.json";

export function CamionesDetalleView({ empresa }: { empresa?: Empresa }) {
  const { id } = useParams();
  const empresaId = id || (empresa ? String(empresa.id) : "1");
  const [searchParams] = useSearchParams();

  // Selected Truck ID from query param
  const camionIdParam = searchParams.get("camionId");

  const [periodo, setPeriodo] = useState<"hoy" | "7dias" | "30dias">("30dias");

  // Find the selected truck from empresa.flota.maquinarias or DEFAULT_CAMIONES
  const truck = useMemo(() => {
    const rawMaquinarias: any[] =
      empresa?.flota?.maquinarias && empresa.flota.maquinarias.length > 0
        ? empresa.flota.maquinarias
        : (empresa?.flota as any)?.camiones && (empresa?.flota as any).camiones.length > 0
        ? (empresa?.flota as any).camiones
        : [];

    let target: any = null;
    let targetIdx = 0;

    const truckModels = [
      "Iveco S-Way",
      "Volvo FH 540",
      "Mercedes-Benz Actros",
      "Scania R500",
      "Volvo FMX 460",
      "Kenworth T800",
      "Scania G440",
      "MAN TGX 26.480",
    ];

    const cargoTypes = [
      "Cisterna 6x4",
      "Tolva Minera",
      "Tolva Granelera",
      "Sideral 28t",
      "Cisterna Criogénica",
      "Plataforma Forestal",
      "Semirremolque B-Double",
    ];

    if (rawMaquinarias.length > 0) {
      if (camionIdParam) {
        const foundIdx = rawMaquinarias.findIndex(
          (m) =>
            String(m.id) === camionIdParam ||
            String(m.placa) === camionIdParam ||
            (m.placa && m.placa.toLowerCase() === camionIdParam.toLowerCase())
        );
        if (foundIdx !== -1) {
          target = rawMaquinarias[foundIdx];
          targetIdx = foundIdx;
        }
      }
      if (!target) {
        target = rawMaquinarias[0];
        targetIdx = 0;
      }
    } else {
      const defIdx = DEFAULT_CAMIONES.findIndex(
        (c) =>
          c.id === camionIdParam ||
          c.placa === camionIdParam ||
          c.placa.toLowerCase() === camionIdParam?.toLowerCase()
      );
      targetIdx = defIdx !== -1 ? defIdx : 0;
      target = DEFAULT_CAMIONES[targetIdx];
    }

    const idStr = String(target.id || `TRK-${targetIdx + 1}`);
    const placaStr = String(target.placa || idStr);

    // Operator matching
    const op =
      operadoresData.find(
        (o) =>
          o.maquinariaId === idStr ||
          o.maquinariaId === placaStr ||
          (o.maquinariaId && idStr.includes(o.maquinariaId)) ||
          (o.maquinariaId && placaStr.includes(o.maquinariaId))
      ) || operadoresData[targetIdx % operadoresData.length];

    const modelo = target.modelo || truckModels[targetIdx % truckModels.length];
    const tipoCarga = target.tipoCarga || cargoTypes[targetIdx % cargoTypes.length];
    
    // Patent formatting: if placa already is a standard plate like "AD 733 PQ", use it or format
    const patente = target.patente || (placaStr.length >= 7 && placaStr.length <= 9 ? placaStr : `AC 8${targetIdx + 4}7 TR`);

    const estadoRaw = target.estado || "en_marcha";
    const estadoLabel =
      estadoRaw === "ralenti" || estadoRaw === "revisar"
        ? "RALENTÍ"
        : estadoRaw === "offline" || estadoRaw === "sin_senal" || estadoRaw === "sin_datos"
        ? "SIN SEÑAL"
        : estadoRaw === "operando"
        ? "OPERANDO"
        : "EN MARCHA";

    const desvioPct = typeof target.desvioPct === "number" ? target.desvioPct : 12.8;
    const rendimientoL100km = typeof target.l100km === "number" ? target.l100km : (target.rendimientoL100km ?? 34.8);
    const horometroH = typeof target.horas === "number" ? target.horas : (target.horometroH ?? 8426);
    const ralentiPct = typeof target.ralentiPct === "number" ? target.ralentiPct : 14.7;
    const consumoDiaL = typeof target.litros === "number" ? Math.round(target.litros / 10) : (target.consumoDiaL ?? 245);
    const caudalInstantaneo = target.caudalLh || (estadoRaw === "ralenti" ? 18 : 128);

    const consumoAcumulado = (consumoDiaL * 8.4).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const ralentiL = Math.round(consumoDiaL * (ralentiPct / 100) * 7.5);
    const co2Ton = (consumoDiaL * 0.0225).toFixed(1).replace(".", ",");
    const consumoPorViaje = (consumoDiaL * 0.55).toFixed(1).replace(".", ",");

    return {
      id: idStr,
      placa: placaStr,
      modelo,
      tipoCarga,
      patente,
      estado: estadoRaw,
      estadoLabel,
      conductor: op?.nombre || "Carlos Méndez",
      legajo: op?.legajo || `001${23 + targetIdx}`,
      base: op?.base || "EZEIZA",
      consumoAcumulado,
      rendimientoL100km,
      desvioPct,
      horometroH,
      ralentiL,
      ralentiPct,
      co2Ton,
      consumoPorViaje,
      caudalInstantaneo,
      bateriaPct: target.bateriaPct || 87,
      ultimoDatoSec: target.ultimoDatoSec || 4,
    };
  }, [camionIdParam, empresa]);

  // Dynamic trips list for this specific truck & conductor
  const viajes = useMemo(() => {
    return [
      { id: "V-201", recorrido: "Buenos Aires · La Plata", km: 112, litros: 152, l100km: 135.7, horas: 2.1, conductor: truck.conductor },
      { id: "V-202", recorrido: "La Plata · Campana", km: 198, litros: 298, l100km: 150.5, horas: 3.4, conductor: "Ana Torres" },
      { id: "V-203", recorrido: "Campana · Buenos Aires", km: 176, litros: 204, l100km: 115.9, horas: 2.8, conductor: "Luis Ramírez" },
      { id: "V-204", recorrido: "Buenos Aires · Zárate", km: 220, litros: 321, l100km: 145.9, horas: 3.6, conductor: "Jorge Fernández" },
      { id: "V-205", recorrido: "Zárate · Buenos Aires", km: 164, litros: 227, l100km: 138.4, horas: 2.9, conductor: "Sofía Castro" },
    ];
  }, [truck.conductor]);

  // Needle position for the gauge bar (0 to 200 L/h)
  const needlePct = Math.min(Math.max((truck.caudalInstantaneo / 200) * 100, 4), 96);

  return (
    <div className="w-full text-slate-200 font-sans flex flex-col gap-1.5 sm:gap-2 pb-2 select-none">
      {/* ─── TOP BREADCRUMB & TITLE (COMPACT ONE-SCREEN HEADER) ─── */}
      <div className="flex flex-col gap-0.5">
        <Link
          to={`/empresa/${empresaId}/camiones`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0df5c6] hover:underline w-fit transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver a Transporte
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              {truck.placa}
            </h1>
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-[#0df5c6] tracking-wider">
              {truck.estadoLabel}
            </span>
            <span className="text-xs text-slate-400">
              {truck.modelo} • {truck.tipoCarga} • {truck.patente}
            </span>
          </div>

          {/* Time Period Filter Tabs */}
          <div className="flex items-center rounded-lg border border-white/10 bg-[#0d1422] p-0.5">
            <button
              type="button"
              onClick={() => setPeriodo("hoy")}
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition ${
                periodo === "hoy"
                  ? "bg-[#0df5c6] text-[#07131b] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setPeriodo("7dias")}
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition ${
                periodo === "7dias"
                  ? "bg-[#0df5c6] text-[#07131b] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7 días
            </button>
            <button
              type="button"
              onClick={() => setPeriodo("30dias")}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition ${
                periodo === "30dias"
                  ? "bg-[#0df5c6] text-[#07131b] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              30 días
            </button>
          </div>
        </div>
      </div>

      {/* ─── 6 TOP KPI CARDS (ULTRA COMPACT ROW) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
        {/* CONSUMO ACUMULADO */}
        <div className="rounded-lg border border-white/10 bg-[#0c121d] px-2.5 py-1.5 flex flex-col justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Consumo acumulado
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
              {truck.consumoAcumulado}
            </span>
            <span className="text-xs font-semibold text-slate-400">L</span>
          </div>
        </div>

        {/* RENDIMIENTO */}
        <div className="rounded-lg border border-white/10 bg-[#0c121d] px-2.5 py-1.5 flex flex-col justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Rendimiento
          </span>
          <div className="mt-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
                {truck.rendimientoL100km.toFixed(1).replace(".", ",")}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">L/100 km</span>
            </div>
            <span className="text-[9px] font-semibold text-[#fbbf24] block leading-tight">
              {truck.desvioPct >= 0 ? "+" : ""}{truck.desvioPct.toFixed(1).replace(".", ",")}% vs objetivo
            </span>
          </div>
        </div>

        {/* HORÓMETRO */}
        <div className="rounded-lg border border-white/10 bg-[#0c121d] px-2.5 py-1.5 flex flex-col justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Horómetro
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
              {truck.horometroH.toLocaleString("es-AR")}
            </span>
            <span className="text-xs font-semibold text-slate-400">h</span>
          </div>
        </div>

        {/* RALENTÍ */}
        <div className="rounded-lg border border-white/10 bg-[#0c121d] px-2.5 py-1.5 flex flex-col justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Ralentí
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
              {truck.ralentiL}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 font-mono">
              L · {truck.ralentiPct.toFixed(1).replace(".", ",")}%
            </span>
          </div>
        </div>

        {/* EMISIONES DE CO2 */}
        <div className="rounded-lg border border-white/10 bg-[#0c121d] px-2.5 py-1.5 flex flex-col justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Emisiones de CO₂
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
              {truck.co2Ton}
            </span>
            <span className="text-xs font-semibold text-slate-400">t</span>
          </div>
        </div>

        {/* CONSUMO POR VIAJE */}
        <div className="rounded-lg border border-white/10 bg-[#0c121d] px-2.5 py-1.5 flex flex-col justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Consumo por viaje
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
              {truck.consumoPorViaje}
            </span>
            <span className="text-xs font-semibold text-slate-400">L</span>
          </div>
        </div>
      </div>

      {/* ─── CAUDAL INSTANTÁNEO & GAUGE BAR ─── */}
      <div className="rounded-lg border border-white/10 bg-[#0c121d] px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Instant Value */}
        <div className="shrink-0 min-w-[200px]">
          <span className="text-[10px] font-semibold text-slate-300 block">
            Caudal instantáneo de combustible
          </span>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono leading-none">
              {truck.caudalInstantaneo}
            </span>
            <span className="text-base font-bold text-slate-400">L/h</span>
          </div>
          <span className="mt-0.5 inline-block text-[9px] font-bold tracking-wider text-[#0df5c6]">
            MODO MOTOR • CARGA CONSTANTE
          </span>
        </div>

        {/* Right Gauge Progress Bar */}
        <div className="flex-1 max-w-xl flex flex-col gap-1 w-full">
          {/* Indicator Value Badge over needle */}
          <div className="relative w-full h-3.5">
            <span
              className="absolute -translate-x-1/2 text-[10px] font-mono font-bold text-white bg-[#141d2c] border border-white/20 px-1.5 py-0 rounded shadow"
              style={{ left: `${needlePct}%` }}
            >
              {truck.caudalInstantaneo} L/h
            </span>
          </div>

          {/* Tri-color range bar */}
          <div className="relative w-full h-5 sm:h-6 rounded-md overflow-hidden flex border border-white/15 bg-black/40">
            {/* Green / Eficiente (0 - 80 L/h = 40%) */}
            <div className="w-[40%] bg-[#065f46]/90 border-r border-black/30" />
            {/* Amber / Moderado (80 - 140 L/h = 30%) */}
            <div className="w-[30%] bg-[#b45309]/90 border-r border-black/30" />
            {/* Red / Alto consumo (140 - 200 L/h = 30%) */}
            <div className="w-[30%] bg-[#991b1b]/90" />

            {/* Needle line indicator */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff]"
              style={{ left: `${needlePct}%` }}
            />
          </div>

          {/* Ticks 0, 50, 100, 150, 200 */}
          <div className="flex justify-between text-[9px] font-mono text-slate-400 px-0.5">
            <span>0</span>
            <span className="pl-3">50</span>
            <span>100</span>
            <span className="pr-3">150</span>
            <span>200</span>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-3 text-[9px] font-medium text-slate-300">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0df5c6]" />
              Rango eficiente
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]" />
              Rango moderado
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
              Alto consumo
            </span>
          </div>
        </div>
      </div>

      {/* ─── SYNCHRONIZED 24H CHARTS (COMPACT HEIGHT) ─── */}
      <div className="rounded-lg border border-white/10 bg-[#0c121d] px-3 py-2 flex flex-col gap-1.5">
        {/* Chart 1: Caudal de combustible */}
        <div>
          <span className="text-[10px] font-semibold text-slate-300 block mb-0.5">
            Caudal de combustible • L/h
          </span>

          <div className="relative w-full h-14 sm:h-16">
            <svg
              viewBox="0 0 1000 80"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="caudalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0df5c6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0df5c6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="30" y1="8" x2="1000" y2="8" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="30" y1="30" x2="1000" y2="30" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="30" y1="52" x2="1000" y2="52" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="30" y1="75" x2="1000" y2="75" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />

              {/* Y Ticks labels */}
              <text x="5" y="11" fill="#64748b" fontSize="8" fontFamily="monospace">300</text>
              <text x="5" y="33" fill="#64748b" fontSize="8" fontFamily="monospace">200</text>
              <text x="5" y="55" fill="#64748b" fontSize="8" fontFamily="monospace">100</text>
              <text x="15" y="77" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>

              {/* Shaded Red Vertical Band (13:40 to 15:00 anomaly) */}
              <rect x="580" y="4" width="45" height="72" fill="#ef4444" fillOpacity="0.18" />

              {/* Curve Area */}
              <path
                d="M 30 32 Q 80 22, 120 28 T 200 34 T 280 38 T 360 32 T 440 28 T 520 25 T 570 27 L 585 60 L 620 62 L 635 38 T 720 34 T 800 38 T 880 32 T 960 41 L 1000 34 L 1000 75 L 30 75 Z"
                fill="url(#caudalGradient)"
              />

              {/* Curve Line */}
              <path
                d="M 30 32 Q 80 22, 120 28 T 200 34 T 280 38 T 360 32 T 440 28 T 520 25 T 570 27 L 585 60 L 620 62 L 635 38 T 720 34 T 800 38 T 880 32 T 960 41 L 1000 34"
                fill="none"
                stroke="#0df5c6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Chart 2: Velocidad */}
        <div>
          <span className="text-[10px] font-semibold text-slate-300 block mb-0.5">
            Velocidad • km/h
          </span>

          <div className="relative w-full h-14 sm:h-16">
            <svg
              viewBox="0 0 1000 80"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="30" y1="8" x2="1000" y2="8" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="30" y1="30" x2="1000" y2="30" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="30" y1="52" x2="1000" y2="52" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="30" y1="75" x2="1000" y2="75" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />

              {/* Y Ticks labels */}
              <text x="5" y="11" fill="#64748b" fontSize="8" fontFamily="monospace">120</text>
              <text x="10" y="33" fill="#64748b" fontSize="8" fontFamily="monospace">80</text>
              <text x="10" y="55" fill="#64748b" fontSize="8" fontFamily="monospace">40</text>
              <text x="15" y="77" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>

              {/* Shaded Red Vertical Band (13:40 to 15:00 anomaly) */}
              <rect x="580" y="4" width="45" height="72" fill="#ef4444" fillOpacity="0.18" />

              {/* Curve Area */}
              <path
                d="M 30 54 Q 80 48, 120 51 T 200 42 T 280 45 T 360 40 T 440 35 T 520 38 T 570 32 L 585 62 L 620 64 L 635 44 T 720 42 T 800 45 T 880 42 T 960 40 L 1000 45 L 1000 75 L 30 75 Z"
                fill="url(#speedGradient)"
              />

              {/* Curve Line */}
              <path
                d="M 30 54 Q 80 48, 120 51 T 200 42 T 280 45 T 360 40 T 440 35 T 520 38 T 570 32 L 585 62 L 620 64 L 635 44 T 720 42 T 800 45 T 880 42 T 960 40 L 1000 45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Shared 24h Time Ticks */}
          <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5 pl-6 pr-1">
            <span>00:00</span>
            <span>02:00</span>
            <span>04:00</span>
            <span>06:00</span>
            <span>08:00</span>
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
            <span>16:00</span>
            <span>18:00</span>
            <span>20:00</span>
            <span>22:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      {/* ─── MIDDLE ROW: VIAJES DEL PERÍODO + EQUIPAMIENTO Y SALUD ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-2">
        {/* Left: Viajes del período (7 of 12 cols = ~58%) */}
        <div className="lg:col-span-7 rounded-lg border border-white/10 bg-[#0c121d] p-2 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white mb-1">
            Viajes del período
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-1">Viaje</th>
                  <th className="pb-1">Recorrido</th>
                  <th className="pb-1">km</th>
                  <th className="pb-1">Litros</th>
                  <th className="pb-1">L/100 km</th>
                  <th className="pb-1">Horas</th>
                  <th className="pb-1">Conductor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {viajes.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-0.5 font-bold text-white">{v.id}</td>
                    <td className="py-0.5 font-sans text-slate-200">{v.recorrido}</td>
                    <td className="py-0.5">{v.km}</td>
                    <td className="py-0.5">{v.litros}</td>
                    <td className="py-0.5">{v.l100km.toFixed(1).replace(".", ",")}</td>
                    <td className="py-0.5">{v.horas.toFixed(1).replace(".", ",")}</td>
                    <td className="py-0.5 font-sans text-slate-300">{v.conductor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Equipamiento y salud (5 of 12 cols = ~42%) */}
        <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#0c121d] p-2 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white mb-1">
            Equipamiento y salud
          </h3>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Flujómetro</span>
              <span className="font-mono text-white font-semibold">DFM 250D</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">MAC</span>
              <span className="font-mono text-white text-[10px]">84:3A:48:90:2F:{truck.id.slice(-2) || '11'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Gateway / IMEI</span>
              <span className="font-mono text-white text-[10px]">
                GW-TRK-{truck.id.replace(/\D/g, '') || '08'} • 868739050184221
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Fecha de verificación</span>
              <span className="font-mono text-white text-[10px]">2026-09-12</span>
            </div>

            {/* Batería del flujómetro */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 shrink-0 text-[10px]">Batería del flujómetro</span>
              <div className="flex items-center gap-1.5 flex-1 justify-end max-w-[120px]">
                <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/15">
                  <div className="h-full bg-[#0df5c6] rounded-full" style={{ width: `${truck.bateriaPct}%` }} />
                </div>
                <span className="font-mono text-white font-bold text-[10px]">{truck.bateriaPct} %</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Último dato recibido</span>
              <span className="font-mono text-slate-200 text-[10px]">hace {truck.ultimoDatoSec} s</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ROW: HISTORIAL DE CONDUCTORES ─── */}
      <div className="rounded-lg border border-white/10 bg-[#0c121d] p-2">
        <h3 className="text-xs font-bold text-white mb-1">
          Historial de conductores
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-1">Conductor</th>
                <th className="pb-1">Desde</th>
                <th className="pb-1">Hasta</th>
                <th className="pb-1">km conducidos</th>
                <th className="pb-1">Rendimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <tr className="hover:bg-white/[0.02] transition">
                <td className="py-0.5 font-sans font-medium text-white">
                  {truck.conductor} (Asignado)
                </td>
                <td className="py-0.5 text-slate-300">2025-04-01 08:00</td>
                <td className="py-0.5 text-slate-300">2025-04-10 18:00</td>
                <td className="py-0.5 text-slate-200">1.245</td>
                <td className="py-0.5 font-bold text-[#0df5c6]">56,8 L/100 km</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition">
                <td className="py-0.5 font-sans font-medium text-slate-300">
                  Ana Torres
                </td>
                <td className="py-0.5 text-slate-300">2025-04-10 18:00</td>
                <td className="py-0.5 text-slate-400">2025-04-20 06:00</td>
                <td className="py-0.5 text-slate-200">1.083</td>
                <td className="py-0.5 font-bold text-[#0df5c6]">59,1 L/100 km</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition">
                <td className="py-0.5 font-sans font-medium text-slate-300">
                  Jorge Fernández
                </td>
                <td className="py-0.5 text-slate-300">2025-04-20 06:00</td>
                <td className="py-0.5 text-slate-400">—</td>
                <td className="py-0.5 text-slate-200">892</td>
                <td className="py-0.5 font-bold text-[#0df5c6]">57,5 L/100 km</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
