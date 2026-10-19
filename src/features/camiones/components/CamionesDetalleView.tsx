import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit3 } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useFlotaDashboard } from "@/features/flota/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { PeriodoSelector } from "@/shared/ui/PeriodoSelector";
import { GraficoLinea, type Serie } from "@/shared/ui/GraficoLinea";
import { fecha, haceCuanto, hora, num } from "@/shared/utils/formato";
import { useHistorialOperadores, useUnidades } from "../hooks";
import { useLecturasRecientes } from "@/features/telemetria/hooks";
import type { Lectura } from "@/features/telemetria/api";
import { ESTADO_UNIDAD } from "../estado";
import { EditarUnidadModal } from "./EditarUnidadModal";

type RangoHoras = 6 | 24 | 168;

const RANGOS: { valor: RangoHoras; etiqueta: string }[] = [
  { valor: 6, etiqueta: "6 h" },
  { valor: 24, etiqueta: "24 h" },
  { valor: 168, etiqueta: "7 días" },
];

function Kpi({
  titulo,
  valor,
  unidad,
  detalle,
  color,
}: {
  titulo: string;
  valor: string;
  unidad?: string;
  detalle?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-white/6 bg-[#0d1117] p-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{valor}</span>
        {unidad && <span className="text-[11px] text-slate-400">{unidad}</span>}
      </div>
      {detalle && (
        <span className="mt-0.5 text-[10px]" style={{ color: color ?? "#64748b" }}>
          {detalle}
        </span>
      )}
    </div>
  );
}

function calcularKpisDesdeLecturas(lecturas: Lectura[]) {
  if (!lecturas || lecturas.length < 2) return null;
  let totalLitros = 0;
  let ralentiSegundos = 0;
  let totalKm = 0;

  for (let i = 1; i < lecturas.length; i++) {
    const prev = lecturas[i - 1];
    const curr = lecturas[i];
    const dtHoras = Math.max(0, (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 3600_000);
    if (dtHoras > 0 && dtHoras < 2) {
      let tasa = curr.consumoInstantaneo;
      if (tasa === null || tasa === undefined) {
        const cin = curr.caudalIngreso ?? 0;
        const cret = curr.caudalRetorno ?? 0;
        tasa = Math.max(0, cin - cret);
      }
      totalLitros += (tasa ?? 0) * dtHoras;

      const vel = curr.velocidad ?? 0;
      totalKm += vel * dtHoras;

      if (vel < 3 && (tasa ?? 0) > 0.5) {
        ralentiSegundos += dtHoras * 3600;
      }
    }
  }

  const ralentiHoras = ralentiSegundos / 3600;
  const consumoMedio = totalKm > 0 ? (totalLitros / totalKm) * 100 : null;
  const co2Ton = (totalLitros * 2.68) / 1000;
  const co2Kg = totalLitros * 2.68;

  return {
    litros: totalLitros,
    km: totalKm,
    horas: 6,
    consumoMedioL100km: consumoMedio,
    desvioPct: 0,
    ralentiLitros: ralentiHoras * 4.2,
    ralentiHoras,
    sobrecargaLitros: 0,
    sobrecargaHoras: 0,
    co2Ton,
    co2Kg,
  };
}

export function CamionesDetalleView({ empresa }: { empresa: EmpresaDetalle }) {
  const { unidadId } = useParams();
  const id = Number(unidadId);
  const basePath = useEmpresaPath();
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const [rangoHoras, setRangoHoras] = useState<RangoHoras>(24);
  const [editando, setEditando] = useState(false);

  // Consulta de flota: 7 días si rangoHoras=168, de lo contrario 1 día (Hoy / 24h)
  const diasFlota = rangoHoras === 168 ? 7 : 1;
  const unidadesQ = useUnidades(empresa.id);
  const statsQ = useFlotaDashboard(empresa.id, diasFlota);
  const lecturasQ = useLecturasRecientes(id || null, rangoHoras);
  const historial = useHistorialOperadores(id || null);

  const unidad = unidadesQ.data?.find((u) => u.id === id);
  const stats = statsQ.data?.maquinarias.find((m) => Number(m.id) === id) ?? null;
  const objetivo = statsQ.data?.resumen.objetivoL100km;
  const lecturas = lecturasQ.data ?? [];

  const kpis6h = useMemo(() => {
    if (rangoHoras === 6) {
      return calcularKpisDesdeLecturas(lecturas);
    }
    return null;
  }, [rangoHoras, lecturas]);

  // Si rango=6 y hay kpis calculados de lecturas, usamos kpis6h, si no stats del dashboard
  const datosKpi = kpis6h ?? stats;
  const hayActividad = datosKpi && datosKpi.km > 0;

  if (unidadesQ.isLoading) return <Cargando texto="Cargando unidad..." />;
  if (unidadesQ.error) return <ErrorCarga error={unidadesQ.error} onReintentar={() => void unidadesQ.refetch()} />;
  if (!unidad) {
    return (
      <SinDatos titulo="Unidad no encontrada">
        <Link to={`${basePath}/camiones`} className="underline">
          Volver a Unidades
        </Link>
      </SinDatos>
    );
  }

  const estado = ESTADO_UNIDAD[unidad.estado];
  const t = unidad.telemetria;

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
    { key: "hasta", encabezado: "Hasta", render: (a) => (a.fechaFin ? fecha(a.fechaFin) : <span className="text-emerald-400">Actual</span>) },
  ];

  const ticks = lecturas.map((l) => {
    if (rangoHoras === 168) {
      const d = new Date(l.timestamp);
      return `${d.getDate()}/${d.getMonth() + 1} ${hora(l.timestamp)}`;
    }
    return hora(l.timestamp);
  });

  const seriesCaudal: Serie[] = [
    {
      nombre: "Caudal ingreso",
      color: "#0df5c6",
      valores: lecturas.map((l) => (l.caudalIngreso != null ? Number(l.caudalIngreso) : null)),
    },
    {
      nombre: "Caudal retorno",
      color: "#58a6ff",
      valores: lecturas.map((l) => (l.caudalRetorno != null ? Number(l.caudalRetorno) : null)),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4 pb-4 font-sans text-slate-200">
      <Link to={`${basePath}/camiones`} className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-[#0df5c6] hover:underline">
        <ArrowLeft className="h-3 w-3" /> Volver a Unidades
      </Link>

      {/* Cabecera sin selector superior */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white">{unidad.identificador}</h1>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider"
            style={{ color: estado.color, borderColor: `${estado.color}66`, background: `${estado.color}15` }}
          >
            {estado.etiqueta.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">
            {[unidad.tipo, unidad.marca, unidad.modelo].filter(Boolean).join(" • ")} · {unidad.sede} · {unidad.estadoOperativo}
          </span>
        </div>
        {puedeEditar && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0e1724] px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" /> Editar
          </button>
        )}
      </div>

      {/* Última conexión e ignición */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/6 bg-[#0d1117] px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Última conexión:</span>
          <span className="font-semibold text-white">{haceCuanto(unidad.ultimaConexion)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Ignición:</span>
          <span className={`inline-flex items-center gap-1.5 font-semibold ${t?.ignicion ? "text-emerald-400" : "text-slate-400"}`}>
            <span className={`h-2 w-2 rounded-full ${t?.ignicion ? "bg-emerald-400" : "bg-slate-500"}`} />
            {t?.ignicion === null || t?.ignicion === undefined ? "—" : t.ignicion ? "Encendido" : "Apagado"}
          </span>
        </div>
      </div>

      {/* Cards de última lectura en vivo */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi titulo="Latitud" valor={t?.lat != null ? Number(t.lat).toFixed(5) : "—"} />
        <Kpi titulo="Longitud" valor={t?.lng != null ? Number(t.lng).toFixed(5) : "—"} />
        <Kpi titulo="Caudal de ingreso" valor={num(t?.caudalIngreso, 1)} unidad="L/h" />
        <Kpi titulo="Caudal de retorno" valor={num(t?.caudalRetorno, 1)} unidad="L/h" />
        <Kpi titulo="Velocidad" valor={num(t?.velocidad)} unidad="km/h" />
      </div>

      {/* Selector de rango: 6h, 24h, 7 días */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Métricas del rango</h2>
          <p className="text-[11px] text-slate-500">Acumulado y consumo medio según el período seleccionado</p>
        </div>
        <PeriodoSelector opciones={RANGOS} valor={rangoHoras} onCambiar={setRangoHoras} />
      </div>

      {/* Cards de métricas del período */}
      {statsQ.isLoading ? (
        <Cargando texto="Cargando indicadores..." />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi
            titulo="Consumo total"
            valor={num(datosKpi?.litros, 1)}
            unidad="L"
            detalle={datosKpi ? `${num(datosKpi.km)} km recorridos` : undefined}
          />
          <Kpi
            titulo="Recorrido total"
            valor={num(datosKpi?.km)}
            unidad="km"
            detalle={datosKpi ? `${num(datosKpi.horas)} h motor` : undefined}
          />
          <Kpi
            titulo="Consumo medio"
            valor={hayActividad ? num(datosKpi.consumoMedioL100km ?? (datosKpi as any).l100km, 1) : "—"}
            unidad="L/100 km"
            detalle={
              hayActividad && objetivo && datosKpi.desvioPct !== undefined
                ? `${datosKpi.desvioPct > 0 ? "+" : ""}${num(datosKpi.desvioPct, 1)} % vs obj`
                : undefined
            }
            color={hayActividad && datosKpi && datosKpi.desvioPct > 0 ? "#fbbf24" : "#0df5c6"}
          />
          <Kpi
            titulo="Ralentí"
            valor={datosKpi ? num(datosKpi.ralentiLitros, 1) : "—"}
            unidad="L"
            detalle={datosKpi ? `${num(datosKpi.ralentiHoras, 1)} h ralentí` : undefined}
            color="#d99b42"
          />
          <Kpi
            titulo="Sobrecarga"
            valor={datosKpi ? num(datosKpi.sobrecargaLitros, 1) : "—"}
            unidad="L"
            detalle={datosKpi ? `${num(datosKpi.sobrecargaHoras, 1)} h sobrecarga` : undefined}
            color={(datosKpi?.sobrecargaLitros ?? 0) > 0 ? "#f87171" : undefined}
          />
          <Kpi
            titulo="Emisiones CO₂"
            valor={num(datosKpi?.co2Ton, 2)}
            unidad="t"
            detalle={datosKpi ? `${num(datosKpi.co2Kg ?? (datosKpi.litros ?? 0) * 2.68, 0)} kg` : undefined}
          />
        </div>
      )}

      {/* Gráfico de caudal de combustible */}
      <div className="rounded-xl border border-white/6 bg-[#0d1117] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white">Caudal de combustible (L/h)</h3>
            <p className="text-[11px] text-slate-400">Curvas de caudal de ingreso y caudal de retorno en el rango seleccionado</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0df5c6]" /> Caudal ingreso
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[#58a6ff]" /> Caudal retorno
            </span>
          </div>
        </div>

        {lecturasQ.isLoading ? (
          <Cargando texto="Cargando lecturas de caudal..." />
        ) : lecturas.length < 2 ? (
          <div className="flex h-36 items-center justify-center">
            <p className="text-xs text-slate-500">Aún no hay suficientes lecturas en este período para graficar caudales.</p>
          </div>
        ) : (
          <GraficoLinea alto={160} unidad="L/h" etiquetasX={ticks} series={seriesCaudal} />
        )}
      </div>

      {/* Historial de operadores a ancho completo (sin card de dispositivo físico) */}
      <div className="rounded-xl border border-white/6 bg-[#0d1117] p-4">
        <h3 className="mb-2 text-xs font-bold text-white">Historial de operadores</h3>
        {historial.isLoading ? (
          <Cargando />
        ) : !historial.data?.length ? (
          <p className="text-xs text-slate-500">Nunca tuvo un operador asignado.</p>
        ) : (
          <DataTable columnas={columnasOperadores} datos={historial.data} keyExtractor={(a) => String(a.id)} />
        )}
      </div>

      <EditarUnidadModal unidad={unidad} abierto={editando} onCerrar={() => setEditando(false)} sedes={empresa.sedes} />
    </div>
  );
}
