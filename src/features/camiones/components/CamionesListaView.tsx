import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useAuth } from "@/hooks/useAuth";
import { useUnidades } from "../hooks";
import { useFlotaDashboard } from "@/features/flota/hooks";
import { useGeocercas } from "@/features/geocercas/hooks";
import { useLecturas } from "@/features/telemetria/hooks";
import { InstalarDispositivoModal } from "@/features/dispositivos/components/InstalarDispositivoModal";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { avisar } from "@/shared/ui/Avisos";
import type { EstadoUnidad } from "../api";
import { ESTADO_UNIDAD, unirConHoy } from "../estado";
import { SearchInput } from "@/shared/ui/SearchInput";
import { UnidadesLista } from "./UnidadesLista";
import { UnidadesMapa } from "./UnidadesMapa";
import { UnidadPanel } from "./UnidadPanel";
import { CrearUnidadModal } from "./CrearUnidadModal";

type Vista = "unidades" | "mapa" | "detalle";

function Filtro({ valor, onCambiar, children }: { valor: string; onCambiar: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={valor} onChange={(e) => onCambiar(e.target.value)} className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6]">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
    </div>
  );
}

export function CamionesListaView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const unidadesQ = useUnidades(empresa.id);
  const hoyQ = useFlotaDashboard(empresa.id, 1);
  const { data: geocercas = [] } = useGeocercas(empresa.id);

  const unidades = useMemo(() => unirConHoy(unidadesQ.data ?? [], hoyQ.data?.maquinarias), [unidadesQ.data, hoyQ.data]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"" | EstadoUnidad>("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
  const [vista, setVista] = useState<Vista>("unidades");
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [instalarPara, setInstalarPara] = useState<number | null>(null);
  const [recorridoDe, setRecorridoDe] = useState<number | null>(null);

  const tipos = useMemo(() => [...new Set(unidades.map((u) => u.tipo).filter((t): t is string => !!t))].sort(), [unidades]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return unidades.filter(
      (u) =>
        (!q || [u.identificador, u.marca, u.modelo, u.operadorActual?.nombre].some((c) => c?.toLowerCase().includes(q))) &&
        (!filtroEstado || u.estado === filtroEstado) &&
        (!filtroSede || u.sedeId === Number(filtroSede)) &&
        (!filtroTipo || u.tipo === filtroTipo),
    );
  }, [unidades, busqueda, filtroEstado, filtroSede, filtroTipo]);

  useEffect(() => {
    if (seleccionadaId !== null && !unidades.some((u) => u.id === seleccionadaId)) setSeleccionadaId(null);
  }, [unidades, seleccionadaId]);

  const seleccionada = unidades.find((u) => u.id === seleccionadaId) ?? null;

  // Recorrido de hoy (desde las 00:00 locales) de la unidad seleccionada
  const paramsRecorrido = useMemo(() => {
    if (!recorridoDe) return null;
    const desde = new Date();
    desde.setHours(0, 0, 0, 0);
    return { maquinariaId: recorridoDe, desde: desde.toISOString(), hasta: new Date().toISOString() };
  }, [recorridoDe]);
  const recorridoQ = useLecturas(paramsRecorrido);
  useEffect(() => {
    if (recorridoDe && recorridoQ.data && recorridoQ.data.filter((l) => l.lat !== null).length < 2) {
      avisar.error("La unidad no registra recorrido hoy.");
      setRecorridoDe(null);
    }
  }, [recorridoDe, recorridoQ.data]);

  const onSeleccionar = useCallback((id: number) => {
    setSeleccionadaId(id);
    setRecorridoDe((r) => (r === id ? r : null));
    setVista("detalle");
  }, []);

  if (unidadesQ.isLoading) return <Cargando texto="Cargando unidades..." />;
  if (unidadesQ.error) return <ErrorCarga error={unidadesQ.error} onReintentar={() => void unidadesQ.refetch()} />;

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[500px] w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#070b12] font-sans text-slate-200 shadow-2xl">
      <header className="flex shrink-0 flex-col justify-between gap-2.5 border-b border-white/10 bg-[#0c121d] px-3 py-2 sm:px-4 sm:py-2.5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Unidades</h1>
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-[#0df5c6]">{filtradas.length}</span>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 md:max-w-2xl">
          <SearchInput
            valor={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar placa, marca, operador..."
            className="flex-1"
          />
          <Filtro valor={filtroEstado} onCambiar={(v) => setFiltroEstado(v as EstadoUnidad | "")}>
            <option value="">Estado</option>
            {(Object.keys(ESTADO_UNIDAD) as EstadoUnidad[]).map((e) => <option key={e} value={e}>{ESTADO_UNIDAD[e].etiqueta}</option>)}
          </Filtro>
          {empresa.sedes.length > 1 && (
            <Filtro valor={filtroSede} onCambiar={setFiltroSede}>
              <option value="">Sede</option>
              {empresa.sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </Filtro>
          )}
          {tipos.length > 1 && (
            <Filtro valor={filtroTipo} onCambiar={setFiltroTipo}>
              <option value="">Tipo</option>
              {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
            </Filtro>
          )}
        </div>

        {puedeEditar && (
          <button type="button" onClick={() => setCrearAbierto(true)} className="flex items-center gap-1.5 self-start rounded-lg bg-[#0df5c6] px-3.5 py-1.5 text-xs font-bold text-[#07131b] transition hover:bg-[#0bdba0] md:self-auto">
            <Plus className="h-4 w-4 stroke-[2.5]" /> Registrar unidad
          </button>
        )}
      </header>

      <div className="z-30 flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#0a0f19] p-2 xl:hidden">
        {(["unidades", "mapa", "detalle"] as const).map((v) => (
          <button
            key={v}
            type="button"
            disabled={v === "detalle" && !seleccionada}
            onClick={() => setVista(v)}
            className={`flex-1 rounded-lg px-1 py-2 text-xs font-bold capitalize transition disabled:opacity-40 ${vista === v ? "bg-[#0df5c6] text-[#07131b]" : "bg-[#141b29] text-slate-300"}`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <UnidadesLista unidades={filtradas} seleccionadaId={seleccionadaId} onSeleccionar={onSeleccionar} visible={vista === "unidades"} />
        <UnidadesMapa
          unidades={filtradas}
          seleccionadaId={seleccionadaId}
          onSeleccionar={onSeleccionar}
          geocercas={geocercas}
          recorrido={recorridoDe === seleccionadaId ? recorridoQ.data ?? null : null}
          visible={vista === "mapa"}
        />
        {seleccionada ? (
          <UnidadPanel
            unidad={seleccionada}
            visible={vista === "detalle"}
            onVolver={() => setVista("mapa")}
            recorridoActivo={recorridoDe === seleccionada.id}
            onRecorrido={() => {
              setRecorridoDe((r) => (r === seleccionada.id ? null : seleccionada.id));
              setVista("mapa");
            }}
          />
        ) : (
          <aside className="hidden w-[340px] shrink-0 items-center justify-center border-l border-white/10 bg-[#090e18] p-6 text-center text-xs text-slate-500 xl:flex">
            Selecciona una unidad para ver su detalle.
          </aside>
        )}
      </div>

      <CrearUnidadModal
        abierto={crearAbierto}
        onCerrar={() => setCrearAbierto(false)}
        sedes={empresa.sedes}
        onCreada={(id) => {
          setCrearAbierto(false);
          avisar.exito("Unidad registrada");
          setInstalarPara(id);
        }}
      />
      <InstalarDispositivoModal
        abierto={instalarPara !== null}
        onCerrar={() => setInstalarPara(null)}
        unidades={unidadesQ.data ?? []}
        unidadInicialId={instalarPara}
        onInstalado={() => {
          setInstalarPara(null);
          avisar.exito("Dispositivo instalado");
        }}
      />
    </div>
  );
}
