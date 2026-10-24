import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Paginacion } from "@/shared/ui/Paginacion";
import { descargarExcel } from "@/shared/utils/excel";
import { fechaHora, num } from "@/shared/utils/formato";
import type { PeriodoReporte, ReporteEventos } from "../api";
import { ESTADO, colorAlerta, etiquetaSeveridad, nombreAlerta } from "../estilos";
import { duracion } from "../ventana";

const POR_PAGINA = 50;

interface FilaEvento {
  clave: string;
  placa: string;
  nombre: string;
  evento: string;
  color: string;
  severidad: string | null;
  inicio: string;
  fin: string | null;
  duracionMs: number | null;
  consumoGal: number | null;
  distanciaKm: number | null;
}

function aFilas(reporte: ReporteEventos): FilaEvento[] {
  return reporte.maquinarias.flatMap((m) => [
    ...m.segmentos.map((s) => ({
      clave: `${m.id}-t-${s.inicio}`,
      placa: m.placa,
      nombre: m.nombre,
      evento: ESTADO[s.estado].etiqueta,
      color: ESTADO[s.estado].color,
      severidad: null,
      inicio: s.inicio,
      fin: s.fin,
      duracionMs: new Date(s.fin).getTime() - new Date(s.inicio).getTime(),
      consumoGal: s.consumoGal,
      distanciaKm: s.distanciaKm,
    })),
    ...m.alertas.map((a) => ({
      clave: `${m.id}-a-${a.origen}-${a.id}`,
      placa: m.placa,
      nombre: m.nombre,
      evento: nombreAlerta(a),
      color: colorAlerta(a),
      severidad: etiquetaSeveridad(a),
      inicio: a.inicio,
      fin: a.fin,
      duracionMs: a.fin ? new Date(a.fin).getTime() - new Date(a.inicio).getTime() : null,
      consumoGal: null,
      distanciaKm: null,
    })),
  ]);
}

const COLUMNAS: Columna<FilaEvento>[] = [
  {
    key: "maquinaria",
    encabezado: "Maquinaria",
    render: (f) => (
      <div>
        <p className="font-semibold text-slate-200">{f.placa}</p>
        <p className="text-[11px] text-slate-500">{f.nombre}</p>
      </div>
    ),
    ordenable: true,
    valorOrden: (f) => f.placa,
  },
  {
    key: "evento",
    encabezado: "Estado / evento",
    render: (f) => (
      <span className="inline-flex items-center gap-2">
        <span className={f.severidad ? "h-2 w-2 rounded-full" : "h-2 w-3 rounded-sm"} style={{ background: f.color }} />
        {f.evento}
        {f.severidad && <span className="text-[11px] text-slate-500">· {f.severidad}</span>}
      </span>
    ),
    ordenable: true,
    valorOrden: (f) => f.evento,
  },
  { key: "inicio", encabezado: "Inicio", render: (f) => fechaHora(f.inicio), ordenable: true, valorOrden: (f) => f.inicio },
  { key: "fin", encabezado: "Fin", render: (f) => (f.fin ? fechaHora(f.fin) : "Sin registrar") },
  {
    key: "duracion",
    encabezado: "Duración",
    render: (f) => (f.duracionMs === null ? "—" : duracion(f.duracionMs)),
    alinear: "right",
    ordenable: true,
    valorOrden: (f) => f.duracionMs ?? -1,
  },
  { key: "consumo", encabezado: "Consumo (gal)", render: (f) => num(f.consumoGal, 2), alinear: "right", ordenable: true, valorOrden: (f) => f.consumoGal ?? -1 },
  { key: "distancia", encabezado: "Distancia (km)", render: (f) => num(f.distanciaKm, 2), alinear: "right", ordenable: true, valorOrden: (f) => f.distanciaKm ?? -1 },
];

export function TablaEventos({ reporte, periodo, puedeExportar }: { reporte: ReporteEventos; periodo: PeriodoReporte; puedeExportar: boolean }) {
  const filas = useMemo(() => aFilas(reporte).sort((a, b) => a.inicio.localeCompare(b.inicio)), [reporte]);
  const [pagina, setPagina] = useState(1);
  const ultimaPagina = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, ultimaPagina);
  const visibles = filas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const exportar = () =>
    descargarExcel(
      `reporte-eventos-${periodo}-${reporte.hasta.slice(0, 16).replace(/[:T]/g, "-")}.xlsx`,
      ["Placa", "Maquinaria", "Estado / evento", "Severidad", "Inicio", "Fin", "Duración (min)", "Consumo (gal)", "Distancia (km)"],
      filas.map((f) => [
        f.placa,
        f.nombre,
        f.evento,
        f.severidad ?? "",
        fechaHora(f.inicio),
        f.fin ? fechaHora(f.fin) : "",
        f.duracionMs === null ? null : Math.round(f.duracionMs / 60_000),
        f.consumoGal,
        f.distanciaKm,
      ]),
      "Eventos",
    );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">Detalle de tramos y alertas</h2>
        {puedeExportar && (
          <button
            type="button"
            onClick={exportar}
            disabled={filas.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#0df5c6]/50 hover:text-[#0df5c6] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Excel
          </button>
        )}
      </div>
      <DataTable columnas={COLUMNAS} datos={visibles} keyExtractor={(f) => f.clave} minWidth="860px" vacio="Sin tramos ni alertas en el periodo." />
      {filas.length > POR_PAGINA && (
        <Paginacion pagina={paginaActual} ultimaPagina={ultimaPagina} total={filas.length} porPagina={POR_PAGINA} onCambiar={setPagina} />
      )}
    </div>
  );
}
