import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useAuth } from "@/hooks/useAuth";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { GraficoLinea } from "@/shared/ui/GraficoLinea";
import { PageHeader } from "@/shared/ui/PageHeader";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { avisar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { fechaHora, hora, num } from "@/shared/utils/formato";
import { useAlertaDetalle, useAlertasEventos, useAlertasGeocerca, useCambiarEstadoAlerta } from "../hooks";
import type { EstadoAlerta, Severidad } from "../api";

const SEV: Record<Severidad, { strip: string; clase: string; etiqueta: string }> = {
  CRITICO: { strip: "#ef5350", clase: "border-[#ef5350] text-[#ef5350] bg-red-500/10", etiqueta: "CRÍTICO" },
  ALTO: { strip: "#d99b42", clase: "border-[#d99b42] text-[#d99b42] bg-amber-500/10", etiqueta: "ALTO" },
  MEDIO: { strip: "#60a5fa", clase: "border-blue-400 text-blue-400 bg-blue-500/10", etiqueta: "MEDIO" },
  BAJO: { strip: "#1a9a7a", clase: "border-teal-500 text-teal-400 bg-teal-500/10", etiqueta: "BAJO" },
};
const EST: Record<EstadoAlerta, { clase: string; etiqueta: string }> = {
  GENERADO: { clase: "border-blue-500/50 text-blue-400 bg-blue-500/10", etiqueta: "Sin atender" },
  ATENDIDO: { clase: "border-green-500/50 text-green-400 bg-green-500/10", etiqueta: "Atendida" },
  CERRADO: { clase: "border-white/15 text-slate-400 bg-white/5", etiqueta: "Cerrada" },
};
const sev = (s: string) => SEV[s as Severidad] ?? SEV.BAJO;
const est = (e: string) => EST[e as EstadoAlerta] ?? EST.CERRADO;

function Metrica({ titulo, valor, unidad }: { titulo: string; valor: string; unidad?: string }) {
  return (
    <div className="border-white/8 p-3">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</div>
      <div className="font-mono text-xl font-bold text-white">
        {valor} {unidad && valor !== "—" && <span className="font-sans text-xs font-medium text-slate-400">{unidad}</span>}
      </div>
    </div>
  );
}

function DetalleEvento({ id, empresaId, puedeAtender, onVolver }: { id: string; empresaId: number; puedeAtender: boolean; onVolver: () => void }) {
  const { data: a, isLoading, error } = useAlertaDetalle(id);
  const cambiar = useCambiarEstadoAlerta(empresaId);

  if (isLoading) return <Cargando texto="Cargando alerta..." />;
  if (error || !a) return <ErrorCarga error={error} />;

  const s = sev(a.severidad);
  const e = est(a.estado);
  const ticks = a.evidencia.ticksTiempo.map((t) => hora(t));
  const indiceEvento = a.evidencia.ticksTiempo.reduce(
    (mejor, t, i, arr) => (Math.abs(new Date(t).getTime() - new Date(a.fechaHora).getTime()) < Math.abs(new Date(arr[mejor]).getTime() - new Date(a.fechaHora).getTime()) ? i : mejor),
    0,
  );
  const marca = ticks.length ? { indice: indiceEvento, etiqueta: "Alerta" } : undefined;

  const mover = (estado: EstadoAlerta) =>
    cambiar.mutate({ id: a.id, estado }, { onSuccess: () => avisar.exito(`Alerta marcada como ${EST[estado].etiqueta.toLowerCase()}`), onError: (err) => avisar.error(mensajeError(err)) });

  const m = a.metricas;
  return (
    <div className={`flex flex-col gap-5 rounded-xl border bg-[#0d1117] p-4 sm:p-6 ${a.severidad === "CRITICO" ? "border-[#e05252]" : "border-white/8"}`}>
      <button type="button" onClick={onVolver} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white lg:hidden">
        <ChevronLeft className="h-4 w-4" /> Volver a la lista
      </button>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-xl font-bold tracking-tight" style={{ color: s.strip }}>{a.regla.toUpperCase()}</h3>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider ${s.clase}`}>{s.etiqueta}</span>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider ${e.clase}`}>{e.etiqueta}</span>
        </div>
        <div className="sm:text-right">
          <Link to={`/empresa/${empresaId}/camiones/${a.maquinariaId}`} className="font-mono text-sm font-bold text-white hover:text-[#0df5c6]">{a.maquinaria}</Link>
          <div className="mt-0.5 font-mono text-[11px] text-slate-400">{fechaHora(a.fechaHora)}</div>
        </div>
      </div>

      <p className="text-sm text-slate-300">
        Valor registrado <strong className="text-white">{num(a.valorRegistrado, 2)}</strong> {a.condicion} umbral <strong className="text-white">{num(a.valorUmbral, 2)}</strong>.
      </p>

      <div className="grid grid-cols-2 divide-y divide-white/8 border-y border-white/8 sm:grid-cols-3 sm:divide-y-0">
        <Metrica titulo="Duración de la ventana" valor={num(m.duracionMin)} unidad="min" />
        <Metrica titulo="Distancia" valor={num(m.distanciaKm, 1)} unidad="km" />
        <Metrica titulo="Velocidad media" valor={num(m.velocidadMediaKmH, 1)} unidad="km/h" />
        <Metrica titulo="Consumo" valor={num(m.consumoGal, 1)} unidad="gal" />
        <Metrica titulo="Lecturas" valor={String(m.lecturasSensor)} />
        <Metrica titulo="Ignición" valor={m.ignicion === null ? "—" : m.ignicion ? "Encendido" : "Apagado"} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-white">Evidencia <span className="text-xs font-normal text-slate-500">(±3 min alrededor de la alerta)</span></div>
        <div>
          <div className="mb-1.5 text-[11px] font-medium text-slate-400">Caudal de combustible · L/h</div>
          <GraficoLinea alto={95} etiquetasX={ticks} marcaX={marca} series={[{ nombre: "Caudal", color: "#00ebb0", valores: a.evidencia.puntosCaudal }]} />
        </div>
        <div>
          <div className="mb-1.5 text-[11px] font-medium text-slate-400">Velocidad · km/h</div>
          <GraficoLinea alto={95} etiquetasX={ticks} marcaX={marca} series={[{ nombre: "Velocidad", color: "#58a6ff", valores: a.evidencia.puntosVelocidad }]} />
        </div>
      </div>

      {puedeAtender && (
        <div className="flex flex-wrap gap-3">
          {a.estado === "GENERADO" && (
            <button type="button" disabled={cambiar.isPending} onClick={() => mover("ATENDIDO")} className="rounded-lg bg-[#ef5350] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#e04845] disabled:opacity-50">
              Marcar como atendida
            </button>
          )}
          {a.estado !== "CERRADO" && (
            <button type="button" disabled={cambiar.isPending} onClick={() => mover("CERRADO")} className="rounded-lg border border-white/15 px-6 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/5 disabled:opacity-50">
              Cerrar alerta
            </button>
          )}
          {a.estado === "CERRADO" && (
            <button type="button" disabled={cambiar.isPending} onClick={() => mover("GENERADO")} className="rounded-lg border border-white/15 px-6 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/5 disabled:opacity-50">
              Reabrir
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CrucesGeocerca({ empresaId }: { empresaId: number }) {
  const { data = [], isLoading, error } = useAlertasGeocerca(empresaId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tipo inferido del hook
  const columnas: Columna<any>[] = [
    { key: "fecha", encabezado: "Fecha", render: (c) => <span className="font-mono text-xs">{fechaHora(c.fechaHora)}</span> },
    { key: "evento", encabezado: "Evento", render: (c) => <span className={`text-xs font-bold ${c.tipoEvento === "ENTRADA" ? "text-emerald-400" : "text-amber-400"}`}>{c.tipoEvento}</span> },
    { key: "geocerca", encabezado: "Geocerca", render: (c) => c.geocerca },
    { key: "unidad", encabezado: "Unidad", render: (c) => <Link to={`/empresa/${empresaId}/camiones/${c.maquinariaId}`} className="font-mono text-cyan-300 hover:underline">{c.maquinaria}</Link> },
  ];

  if (isLoading) return <Cargando />;
  if (error) return <ErrorCarga error={error} />;

  return (
    <DataTable
      columnas={columnas}
      datos={data}
      keyExtractor={(c) => c.id}
      vacio={<SinDatos titulo="Sin entradas ni salidas de geocercas registradas" />}
      minWidth="600px"
    />
  );
}

export function AlertasView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeAtender = sesion?.permisos.atenderAlertas ?? false;
  const [pestana, setPestana] = useState<"motor" | "geocercas">("motor");
  const [filtroEstado, setFiltroEstado] = useState<"" | EstadoAlerta>("GENERADO");
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [verDetalleMovil, setVerDetalleMovil] = useState(false);
  const { data: alertas = [], isLoading, error, refetch } = useAlertasEventos(empresa.id);

  const filtradas = useMemo(() => alertas.filter((a) => !filtroEstado || a.estado === filtroEstado), [alertas, filtroEstado]);
  useEffect(() => {
    if (!filtradas.some((a) => a.id === seleccionadaId)) setSeleccionadaId(filtradas[0]?.id ?? null);
  }, [filtradas, seleccionadaId]);

  const abiertas = alertas.filter((a) => a.estado === "GENERADO");
  const criticas = abiertas.filter((a) => a.severidad === "CRITICO").length;
  const altas = abiertas.filter((a) => a.severidad === "ALTO").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-2 pb-10 font-sans sm:px-4">
      <PageHeader
        titulo="Alertas"
        className="mb-5"
        accion={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-3 py-1 text-xs font-semibold ${criticas ? "border-red-500 bg-red-500/15 text-red-400" : "border-white/10 text-slate-400"}`}>Críticas sin atender {criticas}</span>
              <span className="rounded-md border border-white/10 px-3 py-1 text-xs text-slate-400">Altas sin atender {altas}</span>
              <span className="rounded-md border border-white/10 px-3 py-1 text-xs text-slate-400">Últimas 100</span>
            </div>
            <div className="flex rounded-lg border border-white/10 bg-[#0e1420] p-0.5">
              {(["motor", "geocercas"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPestana(p)} className={`rounded-md px-4 py-1.5 text-xs font-semibold ${pestana === p ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
                  {p === "motor" ? "Reglas de motor" : "Geocercas"}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {pestana === "geocercas" ? (
        <CrucesGeocerca empresaId={empresa.id} />
      ) : isLoading ? (
        <Cargando texto="Cargando alertas..." />
      ) : error ? (
        <ErrorCarga error={error} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[310px_1fr]">
          <div className={`flex-col gap-2.5 lg:flex ${verDetalleMovil ? "hidden" : "flex"}`}>
            <div className="flex items-center justify-between px-1 text-xs">
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as EstadoAlerta | "")} className="rounded border border-white/10 bg-[#0e1420] px-2 py-1 text-xs text-slate-300">
                <option value="GENERADO">Sin atender</option>
                <option value="ATENDIDO">Atendidas</option>
                <option value="CERRADO">Cerradas</option>
                <option value="">Todas</option>
              </select>
              <span className="font-mono text-slate-500">{filtradas.length} alertas</span>
            </div>
            {filtradas.length === 0 && <SinDatos titulo="No hay alertas en este estado" />}
            {filtradas.map((a) => {
              const s = sev(a.severidad);
              const e = est(a.estado);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { setSeleccionadaId(a.id); setVerDetalleMovil(true); }}
                  className={`flex overflow-hidden rounded-lg border text-left transition-all ${seleccionadaId === a.id ? "border-white/20 bg-[#161b22]" : "border-white/6 bg-[#0d1117] hover:bg-[#12161f]"}`}
                >
                  <div className="w-1 shrink-0" style={{ background: s.strip }} />
                  <div className="min-w-0 flex-1 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold text-white">{a.regla.toUpperCase()}</span>
                      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold ${e.clase}`}>{e.etiqueta}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${s.clase}`}>{s.etiqueta}</span>
                      <span className="font-mono text-[10px] text-slate-400">{fechaHora(a.fechaHora)} · {a.maquinaria}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`lg:block ${verDetalleMovil ? "block" : "hidden"}`}>
            {seleccionadaId ? (
              <DetalleEvento id={seleccionadaId} empresaId={empresa.id} puedeAtender={puedeAtender} onVolver={() => setVerDetalleMovil(false)} />
            ) : (
              <SinDatos titulo="Selecciona una alerta para ver el detalle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
