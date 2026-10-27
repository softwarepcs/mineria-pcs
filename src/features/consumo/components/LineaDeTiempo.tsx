import { useState, type MouseEvent } from "react";
import { num } from "@/shared/utils/formato";
import type { AlertaReporte, MaquinariaReporte, ReporteEventos, SegmentoReporte } from "@/features/reportes/api";
import { ESTADO, ESTADOS_ORDEN } from "@/features/reportes/estilos";
import { COLOR_CONSUMO } from "@/features/alertas/estilos";
import { duracion, horaEn, medianoches, posicion } from "@/features/reportes/ventana";

/** Columnas fijas a los lados de la barra (px): nombre + separación, y métricas + separación. */
const ANCHO_NOMBRE = 150;
const ANCHO_METRICAS = 180;
const SEP = 14;

/** Lo que muestra el recuadro de detalle (arriba a la derecha). */
interface Detalle {
  titulo: string;
  l1: string;
  l2: string;
  color: string;
}

interface Props {
  reporte: ReporteEventos;
  /** Camión resaltado (clic en su código); también se resalta en la tabla. */
  resaltada: number | null;
  onResaltar: (id: number) => void;
}

/**
 * Línea de tiempo de las últimas 24 h: una barra por camión con sus tramos de estado y las alertas
 * de consumo en morado. Al pasar el cursor (o hacer clic) sobre un tramo, su detalle aparece en el
 * recuadro fijo de arriba: no hay tooltip flotante que se pueda desplazar.
 */
export function LineaDeTiempo({ reporte, resaltada, onResaltar }: Props) {
  const desde = new Date(reporte.desde).getTime();
  const hasta = new Date(reporte.hasta).getTime();
  const tz = reporte.zonaHoraria;
  const noches = medianoches(desde, hasta, tz);
  const marcas = marcasCada2h(desde, hasta, tz, noches);

  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const d = detalle ?? detallePorDefecto(reporte.maquinarias, hasta, tz);

  return (
    <section className="rounded-xl border border-[#12263A] bg-[#071623] px-5 py-[18px]">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-cond text-[21px] font-semibold text-[#F2F6FA]">Línea de tiempo de estados · últimas 24 h</h2>
        <div className="min-h-[74px] w-full rounded-[10px] border bg-[#02111C] px-3.5 py-2 text-[13px] leading-normal text-[#C9D6E3] sm:w-[360px]" style={{ borderColor: d?.color ?? "#1E3850" }} aria-live="polite">
          {d ? (
            <>
              <div className="text-sm font-semibold text-white">{d.titulo}</div>
              <div>{d.l1}</div>
              <div className="text-[#8FA3B8]">{d.l2}</div>
            </>
          ) : (
            <div className="text-[#8FA3B8]">Pasa el cursor sobre un tramo para ver su detalle.</div>
          )}
        </div>
      </div>
      <p className="mb-2 text-[12.5px] text-[#8FA3B8]">Pasa el cursor o haz clic sobre un tramo para ver su detalle · clic en el código para resaltar el camión en la tabla</p>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Cinta de horas: arriba "ayer HH:MM" y "ahora HH:MM"; abajo las horas pares y la medianoche */}
          <div className="mb-1 flex items-end" style={{ gap: SEP }}>
            <div className="flex-none" style={{ width: ANCHO_NOMBRE }} />
            <div className="relative h-[34px] flex-1">
              <span className="absolute left-0 top-0 whitespace-nowrap text-xs text-[#6F859B]">ayer {horaEn(desde, tz)}</span>
              <span className="absolute right-0 top-0 whitespace-nowrap font-cond text-[15px] font-semibold text-[#2BC4E8]">ahora {horaEn(hasta, tz)}</span>
              {marcas.map((m) => (
                <span
                  key={m.t}
                  className={`absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-xs tabular-nums ${m.medianoche ? "font-semibold text-[#C9D6E3]" : "text-[#8FA3B8]"}`}
                  style={{ left: `${posicion(m.t, desde, hasta)}%` }}
                >
                  {m.etiqueta}
                </span>
              ))}
            </div>
            <div className="flex-none" style={{ width: ANCHO_METRICAS }} />
          </div>

          <div className="relative flex flex-col gap-[18px] pb-1.5 pt-3">
            {reporte.maquinarias.map((m) => (
              <Carril key={m.id} m={m} desde={desde} hasta={hasta} tz={tz} resaltada={resaltada === m.id} onResaltar={onResaltar} onDetalle={setDetalle} />
            ))}

            {/* Medianoche (punteada) y "ahora" (línea de acento), sobre todas las barras */}
            <div className="pointer-events-none absolute inset-y-0" style={{ left: ANCHO_NOMBRE + SEP, right: ANCHO_METRICAS + SEP }}>
              {noches.map((t) => (
                <div key={t} className="absolute inset-y-0 border-l border-dashed border-[#3A5A78]" style={{ left: `${posicion(t, desde, hasta)}%` }} />
              ))}
              <div className="absolute inset-y-0 right-0 w-0.5 bg-[#2BC4E8]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-[18px] gap-y-1.5 text-[13.5px] text-[#C9D6E3]">
        {ESTADOS_ORDEN.map((e) => (
          <span key={e} className="inline-flex items-center gap-[7px]">
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: ESTADO[e].color }} />
            {ESTADO[e].etiqueta}
          </span>
        ))}
        <span className="inline-flex items-center gap-[7px]">
          <span className="h-3 w-1.5 rounded-sm" style={{ background: COLOR_CONSUMO }} />
          Alerta de consumo de combustible
        </span>
        <span className="text-[#8FA3B8]">Línea punteada = medianoche</span>
      </div>
    </section>
  );
}

function Carril({
  m,
  desde,
  hasta,
  tz,
  resaltada,
  onResaltar,
  onDetalle,
}: {
  m: MaquinariaReporte;
  desde: number;
  hasta: number;
  tz: string;
  resaltada: boolean;
  onResaltar: (id: number) => void;
  onDetalle: (d: Detalle) => void;
}) {
  const total = hasta - desde;
  const alertas = m.alertas.filter((a) => a.origen === "REGLA");

  // Un solo manejador por barra: se busca el tramo bajo el cursor (los tramos cortos no tienen área propia)
  const alMover = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = desde + ((e.clientX - r.left) / r.width) * total;
    const s = buscarTramo(m.segmentos, t);
    if (s) onDetalle(detalleTramo(m, s, hasta, tz));
  };

  return (
    <div className="flex items-center" style={{ gap: SEP }}>
      <button
        type="button"
        onClick={() => onResaltar(m.id)}
        aria-pressed={resaltada}
        title={`Resaltar ${m.placa} en la tabla`}
        className={`flex-none rounded-md px-1.5 py-0.5 text-left ${resaltada ? "bg-[#0C2E4A]" : "hover:bg-[#0A1E30]"}`}
        style={{ width: ANCHO_NOMBRE }}
      >
        <div className="truncate font-cond text-[19px] font-bold leading-tight text-white">{m.placa}</div>
        <div className="truncate text-[12.5px] text-[#8FA3B8]">{m.nombre}</div>
      </button>

      <div
        className="relative h-7 flex-1 cursor-crosshair rounded bg-[#0A1B2A]"
        onMouseMove={alMover}
        onClick={alMover}
        role="img"
        aria-label={`${m.placa}: ${resumenAccesible(m)}`}
      >
        <svg className="absolute inset-0 h-full w-full rounded" viewBox="0 0 1000 1" preserveAspectRatio="none" aria-hidden="true">
          {m.segmentos.map((s) => {
            const x = (posicion(new Date(s.inicio).getTime(), desde, hasta) / 100) * 1000;
            const w = (posicion(new Date(s.fin).getTime(), desde, hasta) / 100) * 1000 - x;
            return <rect key={s.inicio} x={x} y={0} width={Math.max(w, 0.5)} height={1} fill={ESTADO[s.estado].color} />;
          })}
        </svg>

        {alertas.map((a) => {
          const ini = posicion(new Date(a.inicio).getTime(), desde, hasta);
          const fin = posicion(a.fin ? new Date(a.fin).getTime() : hasta, desde, hasta);
          const mostrar = (e: MouseEvent) => {
            e.stopPropagation();
            onDetalle(detalleAlerta(m, a, tz));
          };
          return (
            <div
              key={a.id}
              className="absolute inset-y-0 min-w-1 cursor-pointer outline-offset-[-2px] hover:outline-2 hover:outline-white"
              style={{ left: `${ini}%`, width: `${Math.max(fin - ini, 0)}%`, background: COLOR_CONSUMO }}
              onMouseMove={mostrar}
              onClick={mostrar}
            >
              <span className="absolute -top-1.5 left-0 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#B65CFF] ring-2 ring-[#071623]" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <div className="flex-none text-right text-sm tabular-nums" style={{ width: ANCHO_METRICAS }}>
        <strong className="text-base text-white">{num(m.consumoGal, 1)} gal</strong> · {m.kmPorGalon === null ? "—" : num(m.kmPorGalon, 2)} km/gal
      </div>
    </div>
  );
}

/* ───────── Detalle ───────── */

/** "14:28", o "ayer 14:28" si el instante es del día anterior al de `ref` (en la zona de la sede). */
function cuando(t: number, ref: number, tz: string): string {
  const dia = (x: number) => new Date(x).toLocaleDateString("en-CA", { timeZone: tz });
  return `${dia(t) === dia(ref) ? "" : "ayer "}${horaEn(t, tz)}`;
}

function detalleTramo(m: MaquinariaReporte, s: SegmentoReporte, hasta: number, tz: string): Detalle {
  const ini = new Date(s.inicio).getTime();
  const fin = new Date(s.fin).getTime();
  const horas = (fin - ini) / 3_600_000;
  const finTxt = fin >= hasta - 60_000 ? "ahora" : cuando(fin, hasta, tz);
  const titulo = `${cuando(ini, hasta, tz)} → ${finTxt} · ${ESTADO[s.estado].etiqueta} · ${m.placa}`;

  if (s.estado === "sin_senal") {
    return { titulo, l1: `${duracion(fin - ini)} · sin datos del equipo`, l2: "Si llegan lecturas atrasadas, el tramo se completa solo", color: ESTADO[s.estado].color };
  }
  const partes = [duracion(fin - ini), `${num(s.consumoGal, 1)} gal`];
  if (s.distanciaKm > 0) partes.push(`${num(s.distanciaKm, 0)} km`);
  const galH = horas > 0 ? s.consumoGal / horas : 0;
  const l2 =
    s.estado === "conduccion"
      ? `${num(galH, 1)} gal/h promedio · ${s.consumoGal > 0 ? num(s.distanciaKm / s.consumoGal, 2) : "—"} km/gal`
      : s.estado === "ralenti"
        ? `${num(galH, 1)} gal/h promedio`
        : "Motor apagado";
  return { titulo, l1: partes.join(" · "), l2, color: ESTADO[s.estado].color };
}

function detalleAlerta(m: MaquinariaReporte, a: AlertaReporte, tz: string): Detalle {
  const ini = new Date(a.inicio).getTime();
  const fin = a.fin ? new Date(a.fin).getTime() : null;
  return {
    titulo: `${horaEn(ini, tz)} · Alerta de consumo de combustible · ${m.placa}`,
    l1: `Avanza sin registrar consumo · ${duracion((fin ?? Date.now()) - ini)}`,
    l2: fin ? `Cerrado automáticamente a las ${horaEn(fin, tz)}` : "Abierto · en curso",
    color: COLOR_CONSUMO,
  };
}

/** Al cargar: el tramo actual del primer camión, para que el recuadro no quede vacío. */
function detallePorDefecto(maquinarias: MaquinariaReporte[], hasta: number, tz: string): Detalle | null {
  const m = maquinarias.find((x) => x.segmentos.length > 0);
  return m ? detalleTramo(m, m.segmentos[m.segmentos.length - 1]!, hasta, tz) : null;
}

/* ───────── Utilidades ───────── */

/** Búsqueda binaria del tramo que contiene `t` (los tramos vienen ordenados y no se solapan). */
function buscarTramo(tramos: SegmentoReporte[], t: number): SegmentoReporte | null {
  let lo = 0;
  let hi = tramos.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = tramos[mid]!;
    if (t < new Date(s.inicio).getTime()) hi = mid - 1;
    else if (t >= new Date(s.fin).getTime()) lo = mid + 1;
    else return s;
  }
  return null;
}

/** Horas pares locales; la medianoche se rotula "00:00 · hoy". Se omiten las muy pegadas a los bordes. */
function marcasCada2h(desde: number, hasta: number, tz: string, noches: number[]) {
  const res: { t: number; etiqueta: string; medianoche: boolean }[] = [];
  for (let t = Math.ceil(desde / 3_600_000) * 3_600_000; t < hasta; t += 3_600_000) {
    const p = posicion(t, desde, hasta);
    if (p < 4 || p > 94) continue; // ahí van "ayer HH:MM" / "ahora HH:MM"
    const medianoche = noches.includes(t);
    const h = Number(new Date(t).toLocaleString("en-US", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }));
    const min = new Date(t).toLocaleString("en-US", { timeZone: tz, minute: "2-digit" });
    if (Number(min) !== 0) continue;
    if (medianoche) res.push({ t, etiqueta: "00:00 · hoy", medianoche: true });
    else if (h % 2 === 0) res.push({ t, etiqueta: `${String(h).padStart(2, "0")}:00`, medianoche: false });
  }
  return res;
}

function resumenAccesible(m: MaquinariaReporte): string {
  return ESTADOS_ORDEN.filter((e) => m.porEstado[e].horas > 0)
    .map((e) => `${ESTADO[e].etiqueta} ${num(m.porEstado[e].horas, 1)} h`)
    .join(", ");
}
