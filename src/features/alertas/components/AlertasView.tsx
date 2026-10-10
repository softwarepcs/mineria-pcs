import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Cargando, ErrorCarga, Spinner } from "@/shared/ui/Estados";
import { PageHeader } from "@/shared/ui/PageHeader";
import { avisar, useConfirmar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { useAlertasEventos, useCambiarEstadoMasivo } from "../hooks";
import { descargarCsv } from "@/shared/utils/csv";
import { fechaHora } from "@/shared/utils/formato";
import type { EstadoAlerta, FiltrosAlertas, RangoAlertas, Severidad } from "../api";
import { EST, SEV, SEVERIDADES_ORDEN } from "../estilos";
import { AlertasTabla } from "./AlertasTabla";
import { CrucesGeocerca } from "./CrucesGeocerca";
import { DetalleEvento } from "./DetalleEvento";

const FILTROS_INICIALES: FiltrosAlertas = { estado: "GENERADO", severidad: "", maquinariaId: null, rango: "todo" };
const RANGOS: { valor: RangoAlertas; etiqueta: string }[] = [
  { valor: "todo", etiqueta: "Todo el tiempo" },
  { valor: "24h", etiqueta: "Últimas 24 h" },
  { valor: "7d", etiqueta: "Últimos 7 días" },
  { valor: "30d", etiqueta: "Últimos 30 días" },
];
const ESTADOS: { valor: FiltrosAlertas["estado"]; etiqueta: string }[] = [
  { valor: "GENERADO", etiqueta: EST.GENERADO.etiqueta },
  { valor: "ATENDIDO", etiqueta: "Atendidas" },
  { valor: "CERRADO", etiqueta: "Cerradas" },
  { valor: "", etiqueta: "Todas" },
];

function Seleccion({ valor, onCambiar, etiqueta, children }: { valor: string; onCambiar: (v: string) => void; etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        aria-label={etiqueta}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border border-white/10 bg-[#0e1420] py-1.5 pl-2.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6]"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-500" />
    </div>
  );
}

function Interruptor({ activo, onCambiar, children }: { activo: boolean; onCambiar: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onCambiar}
      className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${activo ? "border-[#0df5c6]/50 bg-[#0df5c6]/10 text-[#0df5c6]" : "border-white/10 text-slate-400 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

export function AlertasView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeAtender = sesion?.permisos.atenderAlertas ?? false;
  const [pestana, setPestana] = useState<"motor" | "geocercas">("motor");
  const [filtros, setFiltros] = useState<FiltrosAlertas>(FILTROS_INICIALES);
  const [agrupar, setAgrupar] = useState(true);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [marcadas, setMarcadas] = useState<ReadonlySet<string>>(new Set());
  const [confirmar, dialogoConfirmar] = useConfirmar();
  const contenedorTabla = useRef<HTMLDivElement>(null);
  const idsPrevios = useRef<string[]>([]);

  const unidades = useUnidades(empresa.id).data;
  const q = useAlertasEventos(empresa.id, filtros);
  const masivo = useCambiarEstadoMasivo(empresa.id);

  const items = useMemo(() => q.data?.pages.flatMap((p) => p.items) ?? [], [q.data]);
  const primera = q.data?.pages[0];
  const resumen = primera?.resumen;
  const total = primera?.total ?? 0;

  const reiniciarSeleccion = () => {
    setMarcadas(new Set());
    setSeleccionadaId(null);
    setDetalleAbierto(false);
  };
  const cambiar = <K extends keyof FiltrosAlertas>(k: K, v: FiltrosAlertas[K]) => {
    setFiltros((f) => ({ ...f, [k]: v }));
    reiniciarSeleccion();
  };

  // Si la alerta mostrada sale de la lista (p. ej. se marcó como atendida) se pasa a la siguiente:
  // así se puede atender una tras otra sin volver a elegir.
  useEffect(() => {
    const ids = items.map((a) => a.id);
    if (seleccionadaId && !ids.includes(seleccionadaId)) {
      const i = Math.max(idsPrevios.current.indexOf(seleccionadaId), 0);
      const siguiente = ids[Math.min(i, ids.length - 1)] ?? null;
      setSeleccionadaId(siguiente);
      if (!siguiente) setDetalleAbierto(false);
    }
    idsPrevios.current = ids;
  }, [items, seleccionadaId]);

  // Descarta marcas de alertas que ya no están en la lista
  useEffect(() => {
    setMarcadas((prev) => {
      if (prev.size === 0) return prev;
      const vivos = new Set(items.map((a) => a.id));
      const filtradas = [...prev].filter((id) => vivos.has(id));
      return filtradas.length === prev.size ? prev : new Set(filtradas);
    });
  }, [items]);

  // Teclado: ↑ ↓ cambian de alerta, Enter abre el detalle, Esc lo cierra
  useEffect(() => {
    if (pestana !== "motor") return;
    const alPulsar = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement | null;
      if (t && (["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName) || t.isContentEditable)) return;
      if (ev.key === "Escape") return setDetalleAbierto(false);
      if (ev.key === "Enter" && seleccionadaId && t === document.body) return setDetalleAbierto(true);
      if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;
      const nodos = contenedorTabla.current?.querySelectorAll<HTMLElement>("[data-alerta]");
      const ids = Array.from(nodos ?? [], (n) => n.dataset.alerta!);
      if (ids.length === 0) return;
      ev.preventDefault();
      const i = seleccionadaId ? ids.indexOf(seleccionadaId) : -1;
      setSeleccionadaId(ids[ev.key === "ArrowDown" ? Math.min(i + 1, ids.length - 1) : Math.max(i - 1, 0)]);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [pestana, seleccionadaId]);

  // Mantiene visible la fila seleccionada
  useEffect(() => {
    if (seleccionadaId) contenedorTabla.current?.querySelector(`[data-alerta="${seleccionadaId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [seleccionadaId]);

  const marcar = (ids: string[], marcar: boolean) =>
    setMarcadas((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => (marcar ? n.add(id) : n.delete(id)));
      return n;
    });

  const aplicarLote = async (estado: EstadoAlerta) => {
    const ids = [...marcadas];
    const texto = EST[estado].etiqueta.toLowerCase();
    if (!(await confirmar(`¿Marcar ${ids.length} alerta${ids.length === 1 ? "" : "s"} como ${texto}?`))) return;
    try {
      const r = await masivo.mutateAsync({ ids, estado });
      setMarcadas(new Set());
      avisar.exito(`${r.actualizadas} alerta${r.actualizadas === 1 ? "" : "s"} marcada${r.actualizadas === 1 ? "" : "s"} como ${texto}`);
    } catch (err) {
      avisar.error(mensajeError(err));
    }
  };

  const exportarCsv = () => {
    if (items.length === 0) return;
    const columnas = ["ID", "Sede", "Unidad", "Fecha y Hora", "Severidad", "Estado", "Regla/Métrica", "Umbral", "Registrado"];
    const filas = items.map(a => [
      a.id,
      a.sede,
      a.maquinaria,
      fechaHora(a.fechaHora),
      a.severidad,
      a.estado,
      a.regla,
      a.valorUmbral,
      a.valorRegistrado
    ]);
    descargarCsv(`alertas_${filtros.estado || "todas"}_${filtros.rango}.csv`, columnas, filas);
  };

  const filtrosActivos = filtros.severidad !== "" || filtros.maquinariaId !== null || filtros.rango !== "todo" || filtros.estado !== "GENERADO";
  const todasMarcadas = items.length > 0 && marcadas.size === items.length;
  const mostrarCasillas = modoSeleccion || marcadas.size > 0;
  const drawerVisible = pestana === "motor" && detalleAbierto && seleccionadaId !== null;

  return (
    <div className={`mx-auto w-full max-w-7xl px-2 pb-6 font-sans transition-[padding] sm:px-4 ${drawerVisible ? "lg:pr-[540px]" : ""}`}>
      <PageHeader
        titulo="Alertas"
        className="mb-4"
        accion={
          <div className="flex rounded-lg border border-white/10 bg-[#0e1420] p-0.5">
            {(["motor", "geocercas"] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPestana(p)} className={`rounded-md px-4 py-1.5 text-xs font-semibold ${pestana === p ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
                {p === "motor" ? "Reglas de motor" : "Geocercas"}
              </button>
            ))}
          </div>
        }
      />

      {pestana === "geocercas" ? (
        <CrucesGeocerca empresaId={empresa.id} />
      ) : q.isLoading ? (
        <Cargando texto="Cargando alertas..." />
      ) : q.error && !q.data ? (
        <ErrorCarga error={q.error} onReintentar={() => void q.refetch()} />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Una sola barra: estado · severidad · unidad · periodo · opciones */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div role="group" aria-label="Estado" className="flex rounded-lg border border-white/10 bg-[#0e1420] p-0.5">
              {ESTADOS.map((e) => (
                <button
                  key={e.valor || "todas"}
                  type="button"
                  aria-pressed={filtros.estado === e.valor}
                  onClick={() => cambiar("estado", e.valor)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${filtros.estado === e.valor ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  {e.etiqueta}
                  {e.valor && resumen && <span className="ml-1.5 font-mono text-[10px] text-slate-500">{resumen.porEstado[e.valor]}</span>}
                </button>
              ))}
            </div>

            <div role="group" aria-label="Severidad" className="flex flex-wrap items-center gap-1.5">
              {SEVERIDADES_ORDEN.filter((s: Severidad) => s !== "BAJO" || (resumen?.porSeveridad.BAJO ?? 0) > 0 || filtros.severidad === "BAJO").map((s) => {
                const activo = filtros.severidad === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => cambiar("severidad", activo ? "" : s)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${activo ? SEV[s].clase : "border-white/10 text-slate-400 hover:text-white"}`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: SEV[s].strip }} />
                    {SEV[s].etiqueta}
                    {resumen && <span className="font-mono text-[10px] opacity-70">{resumen.porSeveridad[s]}</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <Seleccion valor={filtros.maquinariaId === null ? "" : String(filtros.maquinariaId)} onCambiar={(v) => cambiar("maquinariaId", v ? Number(v) : null)} etiqueta="Unidad">
                <option value="">Todas las unidades</option>
                {[...(unidades ?? [])].sort((a, b) => a.identificador.localeCompare(b.identificador)).map((u) => (
                  <option key={u.id} value={u.id}>{u.identificador}</option>
                ))}
              </Seleccion>
              <Seleccion valor={filtros.rango} onCambiar={(v) => cambiar("rango", v as RangoAlertas)} etiqueta="Periodo">
                {RANGOS.map((r) => (
                  <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
                ))}
              </Seleccion>
              <Interruptor activo={agrupar} onCambiar={() => setAgrupar((v) => !v)}>Agrupar</Interruptor>
              {puedeAtender && <Interruptor activo={mostrarCasillas} onCambiar={() => { setModoSeleccion((v) => !v); if (mostrarCasillas) setMarcadas(new Set()); }}>Seleccionar</Interruptor>}
              {filtrosActivos && (
                <button type="button" onClick={() => { setFiltros(FILTROS_INICIALES); reiniciarSeleccion(); }} className="px-1 text-xs font-semibold text-[#0df5c6] hover:underline">
                  Restablecer
                </button>
              )}
              <button type="button" onClick={exportarCsv} disabled={items.length === 0} className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50">
                Exportar CSV
              </button>
            </div>
          </div>

          {puedeAtender && mostrarCasillas && (
            <div role="toolbar" aria-label="Acciones sobre las alertas marcadas" className="flex flex-wrap items-center gap-2 rounded-lg border border-[#0df5c6]/30 bg-[#0df5c6]/5 px-3 py-2 text-xs">
              <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
                <input type="checkbox" checked={todasMarcadas} onChange={(e) => setMarcadas(e.target.checked ? new Set(items.map((a) => a.id)) : new Set())} className="h-3.5 w-3.5 accent-[#0df5c6]" />
                Todas las cargadas
              </label>
              <span className="mr-auto font-semibold text-white">{marcadas.size} marcada{marcadas.size === 1 ? "" : "s"}</span>
              <button type="button" disabled={masivo.isPending || marcadas.size === 0} onClick={() => void aplicarLote("ATENDIDO")} className="rounded bg-[#ef5350] px-3 py-1 font-bold text-white hover:bg-[#e04845] disabled:opacity-40">
                Marcar atendidas
              </button>
              <button type="button" disabled={masivo.isPending || marcadas.size === 0} onClick={() => void aplicarLote("CERRADO")} className="rounded border border-white/15 px-3 py-1 font-bold text-slate-200 hover:bg-white/5 disabled:opacity-40">
                Cerrar
              </button>
              <button type="button" onClick={() => { setMarcadas(new Set()); setModoSeleccion(false); }} className="px-1.5 py-1 text-slate-400 hover:text-white">
                Listo
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-white/8 bg-[#0d1117]">
            <div ref={contenedorTabla} className="max-h-[calc(100vh-290px)] min-h-[260px] overflow-auto">
              <AlertasTabla
                items={items}
                agrupar={agrupar}
                seleccionadaId={seleccionadaId}
                marcadas={marcadas}
                mostrarCasillas={mostrarCasillas}
                puedeAtender={puedeAtender}
                compacta={drawerVisible}
                onAbrir={(id) => { setSeleccionadaId(id); setDetalleAbierto(true); }}
                onMarcar={marcar}
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/8 bg-[#0b0f17] px-3 py-2 text-[11px] text-slate-500">
              <span className="font-mono">
                {items.length} de {total} alertas · ↑ ↓ para moverte, Enter abre, Esc cierra
              </span>
              {q.hasNextPage && (
                <button type="button" disabled={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()} className="inline-flex items-center gap-1.5 rounded bg-white/5 px-3 py-1 font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">
                  {q.isFetchingNextPage && <Spinner />} Cargar más
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel lateral de detalle (sin fondo bloqueante: la tabla sigue usable) */}
      {drawerVisible && seleccionadaId && (
        <aside role="dialog" aria-label="Detalle de la alerta" className="fixed inset-y-0 right-0 z-40 w-full overflow-y-auto border-l border-white/10 bg-[#0d1117] shadow-2xl sm:w-[520px]">
          <DetalleEvento key={seleccionadaId} id={seleccionadaId} empresaId={empresa.id} puedeAtender={puedeAtender} onCerrar={() => setDetalleAbierto(false)} />
        </aside>
      )}
      {dialogoConfirmar}
    </div>
  );
}
