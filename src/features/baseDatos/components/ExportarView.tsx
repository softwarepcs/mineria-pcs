import { useMemo, useState } from "react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { exportarLecturas } from "@/features/reportes/api";
import { ENCABEZADOS_LECTURA, conPlaca } from "@/features/reportes/columnas";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { Input, MensajeError } from "@/shared/ui/Formulario";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Panel } from "@/shared/ui/Panel";
import { descargarExcelHojas } from "@/shared/utils/excel";
import { hoyISO } from "@/shared/utils/formato";

const MAX_DIAS = 93;
const MAX_ATRAS_DIAS = 548;

const dias = (a: string, b: string) => Math.round((new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / 86_400_000) + 1;

/** Base de datos › Exportar a Excel: rango de fechas, camiones y un libro con una hoja por camión. */
export function ExportarView({ empresa }: { empresa: EmpresaDetalle }) {
  const unidades = useUnidades(empresa.id);
  const [desde, setDesde] = useState(hoyISO(-30));
  const [hasta, setHasta] = useState(hoyISO(-1));
  const [marcados, setMarcados] = useState<Set<number> | null>(null); // null = todos
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const lista = useMemo(() => unidades.data ?? [], [unidades.data]);
  const ids = marcados ?? new Set(lista.map((u) => u.id));
  const nDias = desde && hasta ? dias(desde, hasta) : 0;
  const minimo = hoyISO(-MAX_ATRAS_DIAS);

  const problema =
    !desde || !hasta ? "Elige las fechas."
    : nDias < 1 ? "La fecha inicial debe ser anterior a la final."
    : nDias > MAX_DIAS ? "El rango máximo es de 3 meses."
    : desde < minimo ? "Solo hay historial de los últimos 18 meses."
    : ids.size === 0 ? "Selecciona al menos un camión."
    : "";

  const alternar = (id: number) => {
    const n = new Set(ids);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setMarcados(n);
  };

  const exportar = async () => {
    setOcupado(true);
    setError("");
    try {
      const r = await exportarLecturas(empresa.id, desde, hasta, [...ids]);
      if (r.total === 0) {
        setError("No hay lecturas en ese rango para los camiones elegidos.");
        return;
      }
      descargarExcelHojas(
        `lecturas_${desde}_${hasta}`,
        r.maquinarias.map((m) => ({
          nombre: m.placa,
          encabezados: [...ENCABEZADOS_LECTURA],
          filas: m.filas.map((f) => conPlaca(m.placa, f)),
        })),
      );
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg ?? "No se pudo generar el archivo. Intenta con menos camiones o un rango menor.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4 sm:gap-5">
      <PageHeader titulo="Exportar a Excel" descripcion="Un archivo con una hoja por camión y una fila por lectura" />
      {unidades.isLoading ? (
        <Cargando />
      ) : unidades.isError ? (
        <ErrorCarga error={unidades.error} onReintentar={() => void unidades.refetch()} />
      ) : (
        <Panel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs text-slate-400">Desde<Input type="date" value={desde} min={minimo} max={hasta || hoyISO()} onChange={(e) => setDesde(e.target.value)} /></label>
            <label className="block text-xs text-slate-400">Hasta<Input type="date" value={hasta} min={desde} max={hoyISO()} onChange={(e) => setHasta(e.target.value)} /></label>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Hasta 3 meses por archivo y hasta 18 meses hacia atrás.</p>

          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Camiones</h2>
            <div className="flex gap-3 text-xs text-[#2BC4E8]">
              <button onClick={() => setMarcados(null)}>Todos</button>
              <button onClick={() => setMarcados(new Set())}>Ninguno</button>
            </div>
          </div>
          <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {lista.map((u) => (
              <li key={u.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-200 hover:bg-white/5">
                  <input type="checkbox" checked={ids.has(u.id)} onChange={() => alternar(u.id)} />
                  <span className="font-semibold">{u.placa}</span>
                  <span className="truncate text-xs text-slate-500">{[u.marca, u.modelo].filter(Boolean).join(" ")}</span>
                </label>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] text-slate-500">
            Cada hoja trae: Placa, Latitud, Longitud, Fecha, Odómetro (km), Gal/h, Total Gal, Caudal Ingreso, Caudal Retorno y Horómetro (h, horas de motor), de la lectura más reciente a la más antigua.
          </p>
          <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
            <span className="font-semibold text-white">Resumen:</span> {ids.size} camiones · {Math.max(nDias, 0)} días · {ids.size} hojas, una fila por lectura
          </div>
          <div className="mt-3 space-y-2">
            <MensajeError>{problema || error}</MensajeError>
            <button onClick={() => void exportar()} disabled={!!problema || ocupado} className="rounded-lg bg-[#2BC4E8] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
              {ocupado ? "Generando..." : "Descargar Excel"}
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
}
