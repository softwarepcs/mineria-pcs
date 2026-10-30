import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { ESTADO_UNIDAD, ESTADOS_ORDEN } from "@/features/flota/estado";
import { useLecturas, useRecorrido } from "@/features/reportes/hooks";
import { ENCABEZADOS_LECTURA, conPlaca } from "@/features/reportes/columnas";
import type { FilaLectura } from "@/features/reportes/api";
import { Paginacion } from "@/shared/ui/Paginacion";
import { ajustarVista, useLeafletMap } from "@/shared/map/useLeafletMap";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { Input, MensajeError, Select } from "@/shared/ui/Formulario";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Panel } from "@/shared/ui/Panel";
import { hoyISO, num, sumarMesesISO } from "@/shared/utils/formato";

const MAX_MESES_ATRAS = 1;
/** Opciones del selector "Filas por página" (el backend admite hasta 200). */
const OPCIONES_FILAS = [25, 50, 100, 200] as const;

/** Base de datos › Consulta y mapa: recorrido de un camión coloreado por estado y tabla de lecturas (máximo 1 mes hacia atrás). */
export function ConsultaView({ empresa }: { empresa: EmpresaDetalle }) {
  const hoy = hoyISO(0, empresa.zonaHoraria);
  const minimo = sumarMesesISO(hoy, -MAX_MESES_ATRAS);
  const unidades = useUnidades(empresa.id);
  const [camion, setCamion] = useState("");
  const [desde, setDesde] = useState(() => hoyISO(-1, empresa.zonaHoraria));
  const [hasta, setHasta] = useState(() => hoyISO(0, empresa.zonaHoraria));
  const [buscar, setBuscar] = useState<{ maquinariaId: number; desde: string; hasta: string } | null>(null);
  const [aviso, setAviso] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState<number>(50);
  const q = useRecorrido(empresa.id, buscar);
  const tabla = useLecturas(empresa.id, buscar, pagina, porPagina);

  const lanzar = () => {
    if (!camion) return setAviso("Elige un camión.");
    if (!desde || !hasta) return setAviso("Elige las fechas.");
    if (desde > hasta) return setAviso("La fecha inicial debe ser anterior a la final.");
    if (hasta > hoy) return setAviso("La fecha final no puede ser futura.");
    if (desde < minimo) return setAviso("Solo se puede consultar información de hasta 1 mes atrás. Para periodos anteriores usa Exportar a Excel.");
    setAviso("");
    setPagina(1);
    setBuscar({ maquinariaId: Number(camion), desde, hasta });
  };

  const dec = [0, 6, 6, 0, 1, 2, 2, 2, 2, 2]; // decimales por columna de la tabla (0 = texto)
  const columnas: Columna<(string | number | null)[]>[] = ENCABEZADOS_LECTURA.map((enc, i) => ({
    key: enc,
    encabezado: enc,
    alinear: i === 0 || i === 3 ? "left" : "right",
    render: (f) => (i === 0 || i === 3 ? String(f[i]) : f[i] === null ? "—" : num(f[i] as number, dec[i])),
  }));

  return (
    <div className="flex w-full max-w-full flex-col gap-4 sm:gap-5">
      <PageHeader titulo="Consulta y mapa" descripcion="Recorrido y lecturas de un camión en el periodo elegido" />
      <Panel>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="block text-xs text-slate-400">Camión
            <Select value={camion} onChange={(e) => setCamion(e.target.value)}>
              <option value="">Selecciona…</option>
              {(unidades.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.placa} · {[u.marca, u.modelo].filter(Boolean).join(" ")}</option>)}
            </Select>
          </label>
          <label className="block text-xs text-slate-400">Desde<Input type="date" value={desde} min={minimo} max={hasta && hasta < hoy ? hasta : hoy} onChange={(e) => setDesde(e.target.value)} /></label>
          <label className="block text-xs text-slate-400">Hasta<Input type="date" value={hasta} min={desde && desde > minimo ? desde : minimo} max={hoy} onChange={(e) => setHasta(e.target.value)} /></label>
          <button onClick={lanzar} className="rounded-lg bg-[#2BC4E8] px-5 py-2 text-sm font-semibold text-slate-900">Buscar</button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">Consulta disponible para lecturas de hasta 1 mes hacia atrás. Para periodos anteriores usa Exportar a Excel.</p>
        <div className="mt-2"><MensajeError>{aviso}</MensajeError></div>
      </Panel>

      {!buscar ? (
        <SinDatos titulo="Elige un camión y un rango de fechas">Pulsa Buscar para ver el recorrido y la tabla de lecturas.</SinDatos>
      ) : q.isLoading ? (
        <Cargando texto="Cargando recorrido..." />
      ) : q.isError || !q.data ? (
        <ErrorCarga error={q.error} onReintentar={() => void q.refetch()} />
      ) : (
        <>
          <Panel padding="sm">
            <MapaRecorrido puntos={q.data.puntos} />
            {q.data.totalPuntos > q.data.puntos.length && (
              <p className="mt-2 px-1 text-[11px] text-slate-500">Se muestran {q.data.puntos.length} de {q.data.totalPuntos} puntos (simplificado para el mapa).</p>
            )}
          </Panel>
          <Panel padding="sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <h2 className="text-sm font-semibold text-white">Lecturas · {q.data.maquinaria.placa}</h2>
                <p className="text-[11px] text-slate-500">De la más reciente a la más antigua</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                Filas por página
                <Select
                  value={porPagina}
                  onChange={(e) => {
                    setPorPagina(Number(e.target.value));
                    setPagina(1);
                  }}
                  className="!w-auto"
                >
                  {OPCIONES_FILAS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </label>
            </div>
            {tabla.isLoading ? (
              <Cargando texto="Cargando lecturas..." />
            ) : tabla.isError || !tabla.data ? (
              <ErrorCarga error={tabla.error} onReintentar={() => void tabla.refetch()} />
            ) : (
              <>
                <DataTable
                  columnas={columnas}
                  datos={tabla.data.filas.map((f: FilaLectura) => conPlaca(tabla.data.placa, f))}
                  keyExtractor={(f) => `${f[0]}|${f[3]}`}
                  minWidth="980px"
                  vacio={<SinDatos titulo="Sin lecturas en este rango" />}
                />
                <Paginacion pagina={tabla.data.pagina} ultimaPagina={tabla.data.totalPaginas} total={tabla.data.total} porPagina={porPagina} onCambiar={setPagina} />
              </>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

function MapaRecorrido({ puntos }: { puntos: { lat: number; lng: number; estado: keyof typeof ESTADO_UNIDAD }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { mapa } = useLeafletMap(ref);

  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    // Un tramo de polilínea por cada cambio de estado, para colorear el recorrido
    let ini = 0;
    for (let i = 1; i <= puntos.length; i++) {
      if (i === puntos.length || puntos[i].estado !== puntos[ini].estado) {
        const fin = Math.min(i, puntos.length - 1);
        const seg = puntos.slice(ini, fin + 1).map((p) => [p.lat, p.lng] as [number, number]);
        if (seg.length >= 2) L.polyline(seg, { color: ESTADO_UNIDAD[puntos[ini].estado].color, weight: 4, opacity: 0.9 }).addTo(grupo);
        ini = i;
      }
    }
    if (puntos.length) {
      const a = puntos[0], b = puntos[puntos.length - 1];
      L.circleMarker([a.lat, a.lng], { radius: 6, color: "#fff", fillColor: "#2BC4E8", fillOpacity: 1 }).bindTooltip("Inicio").addTo(grupo);
      L.circleMarker([b.lat, b.lng], { radius: 6, color: "#fff", fillColor: "#f43f5e", fillOpacity: 1 }).bindTooltip("Fin").addTo(grupo);
      ajustarVista(mapa, puntos.map((p) => [p.lat, p.lng] as [number, number]));
    }
    return () => { grupo.remove(); };
  }, [mapa, puntos]);

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A1C2B] sm:h-[460px]">
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-x-3 gap-y-1 rounded-md bg-[#041725]/85 px-2.5 py-1.5 text-[11px] text-slate-300">
        {ESTADOS_ORDEN.map((e) => (
          <span key={e} className="inline-flex items-center gap-1.5"><span className="h-1 w-4 rounded" style={{ background: ESTADO_UNIDAD[e].color }} />{ESTADO_UNIDAD[e].etiqueta}</span>
        ))}
      </div>
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
