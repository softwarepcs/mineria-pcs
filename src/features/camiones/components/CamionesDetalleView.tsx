import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, Cpu } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import type { Periodo } from "@/features/flota/api";
import { useFlotaDashboard } from "@/features/flota/hooks";
import { InstalarDispositivoModal } from "@/features/dispositivos/components/InstalarDispositivoModal";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { PeriodoSelector } from "@/shared/ui/PeriodoSelector";
import { avisar } from "@/shared/ui/Avisos";
import { fecha, haceCuanto, num } from "@/shared/utils/formato";
import { useHistorialOperadores, useUnidades } from "../hooks";
import { ESTADO_UNIDAD } from "../estado";
import { EditarUnidadModal } from "./EditarUnidadModal";
import { SistemasUnidad } from "./SistemasUnidad";

const PERIODOS: { valor: Periodo; etiqueta: string }[] = [
  { valor: 1, etiqueta: "Hoy" },
  { valor: 7, etiqueta: "7 días" },
  { valor: 30, etiqueta: "30 días" },
  { valor: 90, etiqueta: "90 días" },
];

function Kpi({ titulo, valor, unidad, detalle, color }: { titulo: string; valor: string; unidad?: string; detalle?: string; color?: string }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-[#0d1117] p-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{valor}</span>
        {unidad && <span className="text-[11px] text-slate-400">{unidad}</span>}
      </div>
      {detalle && <span className="mt-0.5 text-[10px]" style={{ color: color ?? "#64748b" }}>{detalle}</span>}
    </div>
  );
}

export function CamionesDetalleView({ empresa }: { empresa: EmpresaDetalle }) {
  const { unidadId } = useParams();
  const id = Number(unidadId);
  const basePath = useEmpresaPath();
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const [dias, setDias] = useState<Periodo>(30);
  const [editando, setEditando] = useState(false);
  const [instalando, setInstalando] = useState(false);

  const unidadesQ = useUnidades(empresa.id);
  const statsQ = useFlotaDashboard(empresa.id, dias);
  const unidad = unidadesQ.data?.find((u) => u.id === id);
  const stats = statsQ.data?.maquinarias.find((m) => Number(m.id) === id) ?? null;
  const objetivo = statsQ.data?.resumen.objetivoL100km;
  const historial = useHistorialOperadores(unidad ? id : null);

  if (unidadesQ.isLoading) return <Cargando texto="Cargando unidad..." />;
  if (unidadesQ.error) return <ErrorCarga error={unidadesQ.error} onReintentar={() => void unidadesQ.refetch()} />;
  if (!unidad) return <SinDatos titulo="Unidad no encontrada"><Link to={`${basePath}/camiones`} className="underline">Volver a Unidades</Link></SinDatos>;

  const estado = ESTADO_UNIDAD[unidad.estado];
  const t = unidad.telemetria;
  const hayActividad = stats && stats.km > 0;

  const columnasOperadores: Columna<any>[] = [
    {
      key: "operador",
      encabezado: "Operador",
      render: (a) => (
        <>
          <Link to={`${basePath}/operadores/${a.usuario.id}`} className="text-white hover:text-[#0df5c6]">
            {`${a.usuario.nombres} ${a.usuario.apellidos}`.trim()}
          </Link>
          {a.usuario.legajo && <span className="ml-1.5 font-mono text-[10px] text-slate-500">{a.usuario.legajo}</span>}
        </>
      ),
    },
    { key: "desde", encabezado: "Desde", render: (a) => fecha(a.fechaInicio) },
    { key: "hasta", encabezado: "Hasta", render: (a) => a.fechaFin ? fecha(a.fechaFin) : <span className="text-emerald-400">Actual</span> },
    { key: "atribucion", encabezado: "Atribución", render: (a) => a.atribucion ?? "—" },
  ];

  return (
    <div className="flex w-full flex-col gap-3 pb-2 font-sans text-slate-200">
      <Link to={`${basePath}/camiones`} className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-[#0df5c6] hover:underline">
        <ArrowLeft className="h-3 w-3" /> Volver a Unidades
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white">{unidad.identificador}</h1>
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider" style={{ color: estado.color, borderColor: `${estado.color}66`, background: `${estado.color}15` }}>
            {estado.etiqueta.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">
            {[unidad.tipo, unidad.marca, unidad.modelo].filter(Boolean).join(" • ")} · {unidad.sede} · {unidad.estadoOperativo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PeriodoSelector opciones={PERIODOS} valor={dias} onCambiar={setDias} />
          {puedeEditar && (
            <button type="button" onClick={() => setEditando(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0e1724] px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
              <Edit3 className="h-3.5 w-3.5" /> Editar
            </button>
          )}
        </div>
      </div>

      {statsQ.isLoading ? (
        <Cargando texto="Cargando indicadores..." />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi titulo="Consumo" valor={num(stats?.litros, 1)} unidad="L" detalle={stats ? `${num(stats.pctGasto, 1)} % del gasto de la flota` : undefined} />
          <Kpi titulo="Recorrido" valor={num(stats?.km)} unidad="km" />
          <Kpi
            titulo="Rendimiento"
            valor={hayActividad ? num(stats.l100km, 1) : "—"}
            unidad="L/100 km"
            detalle={hayActividad && objetivo ? `${stats.desvioPct > 0 ? "+" : ""}${num(stats.desvioPct, 1)} % vs objetivo ${num(objetivo, 1)}` : undefined}
            color={hayActividad && stats.desvioPct > 0 ? "#fbbf24" : "#0df5c6"}
          />
          <Kpi titulo="Horas de motor" valor={num(stats?.horas, 1)} unidad="h" />
          <Kpi titulo="Ralentí" valor={stats && stats.litros > 0 ? num(stats.ralentiPct, 1) : "—"} unidad="%" detalle="estimado" />
          <Kpi titulo="Emisiones CO₂" valor={num(stats?.co2Ton, 2)} unidad="t" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/[0.06] bg-[#0d1117] px-4 py-2.5 text-xs">
        <span className="text-slate-400">Última conexión: <span className="font-semibold text-white">{haceCuanto(unidad.ultimaConexion)}</span></span>
        {t && <span className="text-slate-400">Ignición: <span className="font-semibold text-white">{t.ignicion === null ? "—" : t.ignicion ? "Encendido" : "Apagado"}</span></span>}
      </div>

      <SistemasUnidad maquinariaId={id} />

      <div className="grid gap-3 lg:grid-cols-[1fr_2fr] min-w-0">
        <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4 min-w-0 flex flex-col">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-white"><Cpu className="h-4 w-4 text-cyan-400" /> Dispositivo</h3>
          {unidad.dispositivo ? (
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between"><dt className="text-slate-400">IMEI</dt><dd className="font-mono text-white">{unidad.dispositivo.imei}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Modelo</dt><dd className="text-white">{unidad.dispositivo.modelo ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Instalado</dt><dd className="text-white">{fecha(unidad.dispositivo.instaladoEn)}</dd></div>
            </dl>
          ) : (
            <p className="text-xs text-slate-500">La unidad no tiene un FMC125 instalado: no recibe telemetría.</p>
          )}
          {puedeEditar && (
            <button type="button" onClick={() => setInstalando(true)} className="mt-3 w-full rounded-lg border border-white/15 bg-[#121926] py-2 text-xs font-semibold text-slate-200 hover:bg-[#1a2335]">
              {unidad.dispositivo ? "Reemplazar dispositivo" : "Instalar dispositivo"}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4 min-w-0 flex flex-col">
          <h3 className="mb-2 text-xs font-bold text-white">Historial de operadores</h3>
          {historial.isLoading ? (
            <Cargando />
          ) : !historial.data?.length ? (
            <p className="text-xs text-slate-500">Nunca tuvo un operador asignado.</p>
          ) : (
            <DataTable columnas={columnasOperadores} datos={historial.data} keyExtractor={(a) => String(a.id)} />
          )}
        </div>
      </div>

      <EditarUnidadModal unidad={unidad} abierto={editando} onCerrar={() => setEditando(false)} sedes={empresa.sedes} />
      <InstalarDispositivoModal
        abierto={instalando}
        onCerrar={() => setInstalando(false)}
        unidades={unidadesQ.data ?? []}
        unidadInicialId={unidad.id}
        onInstalado={() => {
          setInstalando(false);
          avisar.exito("Dispositivo instalado");
        }}
      />
    </div>
  );
}
