import { Link } from "react-router-dom";
import { ChevronLeft, User, Clock, Cpu, Route } from "lucide-react";
import { ESTADO_UNIDAD, type UnidadConHoy } from "../estado";
import { useLecturasRecientes } from "@/features/telemetria/hooks";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { GraficoLinea } from "@/shared/ui/GraficoLinea";
import { haceCuanto, hora, num } from "@/shared/utils/formato";

function Dato({ titulo, valor, unidad }: { titulo: string; valor: string; unidad: string }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wider text-slate-400">{titulo}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-bold text-white">{valor}</span>
        <span className="text-[10px] text-slate-400">{unidad}</span>
      </div>
    </div>
  );
}

export function UnidadPanel({
  unidad,
  visible,
  onVolver,
  recorridoActivo,
  onRecorrido,
}: {
  unidad: UnidadConHoy;
  visible: boolean;
  onVolver: () => void;
  recorridoActivo: boolean;
  onRecorrido: () => void;
}) {
  const estado = ESTADO_UNIDAD[unidad.estado];
  const t = unidad.telemetria;
  const hoy = unidad.hoy;
  const basePath = useEmpresaPath();
  const { data: lecturas = [], isLoading } = useLecturasRecientes(unidad.dispositivo ? unidad.id : null, 4);

  return (
    <aside className={`sidebar-scroll h-full w-full shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-[#090e18] xl:flex xl:w-[340px] ${visible ? "flex" : "hidden"}`}>
      <div className="flex items-center border-b border-white/10 bg-[#0e1624] p-3 xl:hidden">
        <button type="button" onClick={onVolver} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0df5c6] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Volver al mapa
        </button>
      </div>

      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">{unidad.identificador}</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {[unidad.tipo, unidad.marca, unidad.modelo].filter(Boolean).join(" • ") || "Sin tipo ni modelo"} · {unidad.sede}
            </p>
          </div>
          <span className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: estado.color, borderColor: `${estado.color}44`, backgroundColor: `${estado.color}15` }}>
            {estado.etiqueta}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/5 bg-[#121926] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700/60 text-sm font-bold text-[#0df5c6]">
            {unidad.operadorActual ? unidad.operadorActual.nombre.charAt(0) : <User className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            {unidad.operadorActual ? (
              <Link to={`${basePath}/operadores/${unidad.operadorActual.id}`} className="block truncate text-sm font-semibold text-white hover:text-[#0df5c6]">
                {unidad.operadorActual.nombre}
              </Link>
            ) : (
              <span className="text-sm text-slate-400">Sin operador asignado</span>
            )}
            <span className="text-xs text-slate-500">Operador actual</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-b border-white/10 p-4">
        <Dato titulo="Velocidad" valor={num(t?.velocidad)} unidad="km/h" />
        <Dato titulo="Caudal" valor={num(t?.flujoIn, 1)} unidad="L/h" />
        <Dato titulo="RPM" valor={num(t?.rpm)} unidad="rpm" />
        <Dato titulo="Consumo hoy" valor={num(hoy?.litros, 1)} unidad="L" />
        <Dato titulo="Rendimiento hoy" valor={hoy && hoy.km > 0 ? num(hoy.l100km, 1) : "—"} unidad="L/100 km" />
        <Dato titulo="Ralentí hoy" valor={hoy && hoy.litros > 0 ? num(hoy.ralentiPct, 1) : "—"} unidad="%" />
      </div>

      <div className="border-b border-white/10 p-4">
        <h3 className="mb-2 text-xs font-semibold text-slate-300">Caudal de combustible (últimas 4 horas)</h3>
        {!unidad.dispositivo ? (
          <p className="text-xs text-slate-500">La unidad no tiene dispositivo instalado.</p>
        ) : isLoading ? (
          <p className="text-xs text-slate-500">Cargando…</p>
        ) : (
          <GraficoLinea alto={110} unidad="L/h" etiquetasX={lecturas.map((l) => hora(l.timestamp))} series={[{ nombre: "Caudal", color: "#0df5c6", valores: lecturas.map((l) => l.flujoIn) }]} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-4 text-center">
        <div className="rounded-lg border border-white/5 bg-[#111827] p-2">
          <Cpu className="mx-auto mb-1 h-4 w-4 text-cyan-400" />
          <span className="block text-[9px] uppercase tracking-wider text-slate-400">Dispositivo</span>
          <span className="mt-0.5 block font-mono text-xs font-bold text-white">{unidad.dispositivo?.imei ?? "Sin instalar"}</span>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111827] p-2">
          <Clock className="mx-auto mb-1 h-4 w-4 text-slate-400" />
          <span className="block text-[9px] uppercase tracking-wider text-slate-400">Último dato</span>
          <span className="mt-0.5 block text-xs font-bold text-white">{haceCuanto(unidad.ultimaConexion)}</span>
        </div>
      </div>

      <div className="mt-auto space-y-2 p-4">
        <Link
          to={`${basePath}/camiones/${unidad.id}`}
          className="flex w-full items-center justify-center rounded-lg bg-[#0df5c6] py-2.5 text-xs font-bold text-[#07131b] transition hover:bg-[#0bdba0]"
        >
          Ver ficha completa
        </Link>
        <button
          type="button"
          onClick={onRecorrido}
          disabled={!unidad.dispositivo}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-[#121926] py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-[#1a2335] disabled:opacity-40"
        >
          <Route className="h-3.5 w-3.5" />
          {recorridoActivo ? "Ocultar recorrido" : "Ver recorrido de hoy"}
        </button>
      </div>
    </aside>
  );
}
