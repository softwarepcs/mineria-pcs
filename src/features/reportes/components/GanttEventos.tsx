import { useState, type MouseEvent } from "react";
import { fechaHora, num } from "@/shared/utils/formato";
import type { AlertaReporte, MaquinariaReporte, PeriodoReporte, ReporteEventos, SegmentoReporte } from "../api";
import { ESTADO, ESTADOS_ORDEN, colorAlerta, etiquetaSeveridad, nombreAlerta } from "../estilos";
import { duracion, marcasDeVentana, posicion } from "../ventana";

/** Ancho de la columna de nombres y de la de métricas (la cinta y las barras se alinean con ellas). */
const COL_NOMBRE = "w-36 shrink-0";
const COL_METRICAS = "w-32 shrink-0";

type Hover = { x: number; y: number } & ({ tipo: "tramo"; maquina: string; s: SegmentoReporte } | { tipo: "alerta"; maquina: string; a: AlertaReporte });

export function GanttEventos({ reporte, periodo }: { reporte: ReporteEventos; periodo: PeriodoReporte }) {
  const desde = new Date(reporte.desde).getTime();
  const hasta = new Date(reporte.hasta).getTime();
  const marcas = marcasDeVentana(desde, hasta, periodo);
  const [hover, setHover] = useState<Hover | null>(null);

  return (
    <div className="relative">
      <Leyenda />

      {/* Cinta de horas */}
      <div className="mt-4 flex items-end text-[11px] text-slate-500">
        <div className={COL_NOMBRE} />
        <div className="relative h-5 flex-1 border-b border-white/10">
          {marcas.map((m) => (
            <span key={m.t} className="absolute bottom-1 -translate-x-1/2 whitespace-nowrap tabular-nums" style={{ left: `${posicion(m.t, desde, hasta)}%` }}>
              {m.etiqueta}
            </span>
          ))}
          <span className="absolute bottom-1 right-0 font-semibold text-slate-400">Ahora</span>
        </div>
        <div className={`${COL_METRICAS} pl-3 text-right`}>Consumo · Distancia</div>
      </div>

      {/* Filas */}
      <div className="relative">
        {/* Rejilla vertical alineada a las marcas */}
        <div className="pointer-events-none absolute inset-y-0 flex w-full">
          <div className={COL_NOMBRE} />
          <div className="relative flex-1">
            {marcas.map((m) => (
              <div key={m.t} className="absolute inset-y-0 w-px bg-white/[0.06]" style={{ left: `${posicion(m.t, desde, hasta)}%` }} />
            ))}
          </div>
          <div className={COL_METRICAS} />
        </div>

        {reporte.maquinarias.map((m) => (
          <Fila key={m.id} m={m} desde={desde} hasta={hasta} onHover={setHover} />
        ))}
      </div>

      {hover && <Tooltip hover={hover} />}
    </div>
  );
}

function Fila({ m, desde, hasta, onHover }: { m: MaquinariaReporte; desde: number; hasta: number; onHover: (h: Hover | null) => void }) {
  const total = hasta - desde;

  // Un solo manejador por barra: se busca el tramo bajo el cursor (los tramos cortos no tienen área para hover propio).
  const alMover = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = desde + ((e.clientX - r.left) / r.width) * total;
    const s = buscarTramo(m.segmentos, t);
    onHover(s ? { tipo: "tramo", maquina: m.placa, s, x: e.clientX, y: e.clientY } : null);
  };

  return (
    <div className="flex items-center py-1.5">
      <div className={`${COL_NOMBRE} truncate pr-3`} title={`${m.placa} · ${m.nombre}`}>
        <p className="truncate text-xs font-semibold text-slate-200">{m.placa}</p>
        <p className="truncate text-[11px] text-slate-500">{m.nombre}</p>
      </div>

      <div className="relative h-6 flex-1 cursor-crosshair overflow-visible rounded bg-white/[0.03]" onMouseMove={alMover} onMouseLeave={() => onHover(null)}>
        <svg className="absolute inset-0 h-full w-full rounded" viewBox="0 0 1000 1" preserveAspectRatio="none" aria-hidden="true">
          {m.segmentos.map((s) => {
            const x = (posicion(new Date(s.inicio).getTime(), desde, hasta) / 100) * 1000;
            const w = (posicion(new Date(s.fin).getTime(), desde, hasta) / 100) * 1000 - x;
            return <rect key={s.inicio} x={x} y={0} width={Math.max(w, 0.5)} height={1} fill={ESTADO[s.estado].color} />;
          })}
        </svg>

        {m.alertas.map((a) => {
          const ini = posicion(new Date(a.inicio).getTime(), desde, hasta);
          const fin = a.fin ? posicion(new Date(a.fin).getTime(), desde, hasta) : null;
          const color = colorAlerta(a);
          const mostrar = (e: MouseEvent) => {
            e.stopPropagation();
            onHover({ tipo: "alerta", maquina: m.placa, a, x: e.clientX, y: e.clientY });
          };
          return (
            <div key={`${a.origen}-${a.id}`}>
              {fin !== null && fin > ini && (
                <div className="pointer-events-none absolute top-1/2 h-0.5 -translate-y-1/2" style={{ left: `${ini}%`, width: `${fin - ini}%`, background: color }} />
              )}
              {/* Zona de hover de 16 px alrededor del punto de 10 px */}
              <div
                className="absolute top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${ini}%` }}
                onMouseMove={mostrar}
                onMouseLeave={() => onHover(null)}
              >
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-[#0d1117]" style={{ background: color }} />
              </div>
              {fin !== null && fin > ini && (
                <span className="pointer-events-none absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#0d1117]" style={{ left: `${fin}%`, background: color }} />
              )}
            </div>
          );
        })}
      </div>

      <div className={`${COL_METRICAS} pl-3 text-right text-xs tabular-nums text-slate-300`}>
        <p>{num(m.consumoGal, 1)} gal</p>
        <p className="text-slate-500">{num(m.distanciaKm, 1)} km</p>
      </div>
    </div>
  );
}

/** Búsqueda binaria del tramo que contiene `t` (los tramos vienen ordenados y no se solapan). */
function buscarTramo(tramos: SegmentoReporte[], t: number): SegmentoReporte | null {
  let lo = 0;
  let hi = tramos.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = tramos[mid];
    if (t < new Date(s.inicio).getTime()) hi = mid - 1;
    else if (t >= new Date(s.fin).getTime()) lo = mid + 1;
    else return s;
  }
  return null;
}

function Leyenda() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
      {ESTADOS_ORDEN.map((e) => (
        <span key={e} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm" style={{ background: ESTADO[e].color }} />
          {ESTADO[e].etiqueta}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ef5350]" />
        Alerta de regla
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#60a5fa]" />
        Geocerca
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-5 bg-slate-400" />
        Duración de la alerta
      </span>
    </div>
  );
}

function Tooltip({ hover }: { hover: Hover }) {
  const izquierda = hover.x > window.innerWidth - 260;
  const estilo = { top: hover.y + 14, left: izquierda ? undefined : hover.x + 14, right: izquierda ? window.innerWidth - hover.x + 14 : undefined };

  return (
    <div className="pointer-events-none fixed z-50 w-60 rounded-lg border border-white/10 bg-[#0e1420]/95 p-3 text-xs text-slate-300 shadow-xl" style={estilo} role="tooltip">
      <p className="mb-1.5 font-semibold text-white">{hover.maquina}</p>
      {hover.tipo === "tramo" ? (
        <>
          <p className="mb-1 inline-flex items-center gap-1.5 font-semibold">
            <span className="h-2 w-3 rounded-sm" style={{ background: ESTADO[hover.s.estado].color }} />
            {ESTADO[hover.s.estado].etiqueta}
          </p>
          <Dato k="Inicio" v={fechaHora(hover.s.inicio)} />
          <Dato k="Fin" v={fechaHora(hover.s.fin)} />
          <Dato k="Duración" v={duracion(new Date(hover.s.fin).getTime() - new Date(hover.s.inicio).getTime())} />
          {hover.s.consumoGal > 0 && <Dato k="Consumo" v={`${num(hover.s.consumoGal, 2)} gal`} />}
          {hover.s.distanciaKm > 0 && <Dato k="Distancia" v={`${num(hover.s.distanciaKm, 2)} km`} />}
        </>
      ) : (
        <>
          <p className="mb-1 inline-flex items-center gap-1.5 font-semibold">
            <span className="h-2 w-2 rounded-full" style={{ background: colorAlerta(hover.a) }} />
            {nombreAlerta(hover.a)}
          </p>
          <Dato k="Severidad" v={etiquetaSeveridad(hover.a)} />
          <Dato k="Inicio" v={fechaHora(hover.a.inicio)} />
          <Dato k="Fin" v={hover.a.fin ? fechaHora(hover.a.fin) : "Sin registrar"} />
          {hover.a.fin && <Dato k="Duración" v={duracion(new Date(hover.a.fin).getTime() - new Date(hover.a.inicio).getTime())} />}
        </>
      )}
    </div>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <p className="flex justify-between gap-3">
      <span className="text-slate-500">{k}</span>
      <span className="tabular-nums">{v}</span>
    </p>
  );
}
