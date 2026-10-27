import { useState } from "react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useReporteEventos } from "@/features/reportes/hooks";
import type { MaquinariaReporte } from "@/features/reportes/api";
import { horaEn } from "@/features/reportes/ventana";
import { Cargando, ErrorCarga, SinDatos, Spinner } from "@/shared/ui/Estados";
import { num } from "@/shared/utils/formato";
import { LineaDeTiempo } from "./LineaDeTiempo";

/** Cifras de una fila de la tabla (un camión o la flota). */
interface Cifras {
  km: number;
  gal: number;
  /** galones / horas en ruta y en ralentí */
  gr: number;
  gi: number;
  hr: number;
  hi: number;
}

const cifras = (m: MaquinariaReporte): Cifras => ({
  km: m.distanciaKm,
  gal: m.consumoGal,
  gr: m.porEstado.conduccion.galones,
  gi: m.porEstado.ralenti.galones,
  hr: m.porEstado.conduccion.horas,
  hi: m.porEstado.ralenti.horas,
});

const pct = (parte: number, total: number) => (total > 0 ? num((parte / total) * 100, 1) : "—");
const div = (a: number, b: number, d: number) => (b > 0 ? num(a / b, d) : "—");

/** Pantalla Consumo y eficiencia: línea de tiempo de las últimas 24 h y detalle por camión. */
export function ConsumoView({ empresa }: { empresa: EmpresaDetalle }) {
  // Solo se monitorea la ventana de las últimas 24 h (avanza sola con cada refresco)
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useReporteEventos(empresa.id, "24h", null);
  const [resaltada, setResaltada] = useState<number | null>(null);
  const resaltar = (id: number) => setResaltada((r) => (r === id ? null : id));

  const tz = data?.zonaHoraria ?? empresa.zonaHoraria;
  const ventana = data ? `de ayer ${horaEn(data.desde, tz)} a hoy ${horaEn(data.hasta, tz)}` : "";

  return (
    <div className="flex w-full max-w-full flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-cond text-[32px] font-bold leading-none text-white sm:text-[38px]">Consumo</h1>
          <p className="mt-1 text-base text-[#A9BBCC]">Últimas 24 horas{ventana && ` · ${ventana}`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#8FA3B8]">
          {isFetching && <Spinner className="h-3 w-3" />}
          <span>
            En línea <span className="punto-vivo ml-1" /> · la ventana avanza con la hora actual
          </span>
          {dataUpdatedAt > 0 && (
            <span className="text-xs">· actualizado {new Date(dataUpdatedAt).toLocaleTimeString("es-AR", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
          )}
          <button type="button" onClick={() => void refetch()} className="rounded-md border border-[#1E3850] bg-[#0C2133] px-2.5 py-1 text-xs text-[#C9D6E3] hover:text-white">
            Actualizar
          </button>
        </div>
      </div>

      {isLoading ? (
        <Cargando texto="Calculando estados..." />
      ) : isError || !data ? (
        <ErrorCarga error={error} onReintentar={() => void refetch()} />
      ) : data.maquinarias.length === 0 ? (
        <SinDatos titulo="Sin camiones">Esta empresa todavía no tiene camiones con equipo instalado.</SinDatos>
      ) : (
        <>
          <LineaDeTiempo reporte={data} resaltada={resaltada} onResaltar={resaltar} />
          <TablaDetalle maquinarias={data.maquinarias} resaltada={resaltada} onResaltar={resaltar} />
        </>
      )}
    </div>
  );
}

/* ───────── Tabla agrupada: Eficiencia · Galones · Horómetro ───────── */

const G = {
  E: "bg-[rgba(43,196,232,0.06)]",
  G: "bg-[rgba(21,228,98,0.055)]",
  H: "bg-[rgba(167,139,250,0.08)]",
  GP: "bg-[rgba(21,228,98,0.13)]",
  HP: "bg-[rgba(167,139,250,0.17)]",
};
const TH_BASE = "px-2.5 py-2.5 align-bottom text-[12.5px] font-medium text-[#8FA3B8] whitespace-nowrap";
const TH = `${TH_BASE} text-right`;
const TD = "px-2.5 py-[11px] text-right tabular-nums whitespace-nowrap";
const SEPARA = "border-l-[3px] border-l-[#02111C]";

function Pc({ children }: { children: string }) {
  return <span className="ml-1.5 text-[12.5px] font-normal text-[#8FA3B8]">{children} %</span>;
}

function TablaDetalle({ maquinarias, resaltada, onResaltar }: { maquinarias: MaquinariaReporte[]; resaltada: number | null; onResaltar: (id: number) => void }) {
  const filas = maquinarias.map((m) => ({ m, c: cifras(m) }));
  const T = filas.reduce<Cifras>(
    (a, { c }) => ({ km: a.km + c.km, gal: a.gal + c.gal, gr: a.gr + c.gr, gi: a.gi + c.gi, hr: a.hr + c.hr, hi: a.hi + c.hi }),
    { km: 0, gal: 0, gr: 0, gi: 0, hr: 0, hi: 0 },
  );
  const Thm = T.hr + T.hi;

  const celdas = (c: Cifras, flota: boolean) => {
    const hm = c.hr + c.hi;
    return (
      <>
        <td className={`${TD} ${G.E} ${SEPARA} font-semibold text-white`}>{div(c.km, c.gal, 2)}</td>
        <td className={`${TD} ${G.E}`}>{div(c.gal, c.km, 3)}</td>
        <td className={`${TD} ${G.GP} ${SEPARA} text-[15px] font-bold text-white`}>
          {num(c.gal, 1)}
          <Pc>{flota ? "100" : pct(c.gal, T.gal)}</Pc>
        </td>
        <td className={`${TD} ${G.G}`}>
          {num(c.gr, 1)}
          <Pc>{pct(c.gr, c.gal)}</Pc>
        </td>
        <td className={`${TD} ${G.G}`}>
          {num(c.gi, 1)}
          <Pc>{pct(c.gi, c.gal)}</Pc>
        </td>
        <td className={`${TD} ${G.HP} ${SEPARA} text-[15px] font-bold text-white`}>
          {num(hm, 1)}
          <Pc>{flota ? "100" : pct(hm, Thm)}</Pc>
        </td>
        <td className={`${TD} ${G.H}`}>
          {num(c.hr, 1)}
          <Pc>{pct(c.hr, hm)}</Pc>
        </td>
        <td className={`${TD} ${G.H}`}>
          {num(c.hi, 1)}
          <Pc>{pct(c.hi, hm)}</Pc>
        </td>
      </>
    );
  };

  const grupo = (titulo: string, sub: string, color: string, fondo: string, cols: number) => (
    <th colSpan={cols} className={`${fondo} ${SEPARA} border-t-[3px] px-3 pb-2 pt-2.5 text-left`} style={{ borderTopColor: color }}>
      <span className="font-cond text-[15px] font-bold tracking-[1px] text-white">{titulo}</span>
      <small className="mt-0.5 block text-xs font-normal text-[#8FA3B8]">{sub}</small>
    </th>
  );
  const etiqueta = (txt: string, color: string) => (
    <span className="mb-[3px] inline-block rounded px-[5px] py-px text-[10.5px] font-bold tracking-[1px] text-[#02111C]" style={{ background: color }}>{txt}</span>
  );

  return (
    <section className="rounded-xl border border-[#12263A] bg-[#071623] px-5 py-[18px]">
      <h2 className="mb-3.5 font-cond text-[21px] font-semibold text-[#F2F6FA]">Detalle por camión · últimas 24 h</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-sm text-[#E3EBF2]">
          <thead>
            <tr>
              <th colSpan={2} />
              {grupo("EFICIENCIA", "Cuánto rinde cada galón", "#2BC4E8", G.E, 2)}
              {grupo("GALONES", "Total y cómo se reparte", "#15E462", G.G, 3)}
              {grupo("HORÓMETRO", "Horas de motor y cómo se reparten", "#A78BFA", G.H, 3)}
            </tr>
            <tr className="border-b border-[#12263A]">
              <th className={`${TH_BASE} text-left`}>Código</th>
              <th className={`${TH_BASE} text-left`}>Camión</th>
              <th className={`${TH} ${G.E} ${SEPARA}`}>Rendimiento<br />(km/gal)</th>
              <th className={`${TH} ${G.E}`}>Consumo<br />(gal/km)</th>
              <th className={`${TH} ${G.GP} ${SEPARA} font-bold text-white`}>
                {etiqueta("TOTAL", "#15E462")}<br />Galones<br /><span className="font-normal text-[#A9BBCC]">% de la flota</span>
              </th>
              <th className={`${TH} ${G.G} text-[#A9BBCC]`}>↳ En ruta (gal)<br />% del camión</th>
              <th className={`${TH} ${G.G} text-[#A9BBCC]`}>↳ Ralentí (gal)<br />% del camión</th>
              <th className={`${TH} ${G.HP} ${SEPARA} font-bold text-white`}>
                {etiqueta("TOTAL", "#A78BFA")}<br />Horómetro (h)<br /><span className="font-normal text-[#A9BBCC]">% de la flota</span>
              </th>
              <th className={`${TH} ${G.H} text-[#A9BBCC]`}>↳ En ruta (h)<br />% del camión</th>
              <th className={`${TH} ${G.H} text-[#A9BBCC]`}>↳ Ralentí (h)<br />% del camión</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(({ m, c }) => {
              const sel = resaltada === m.id;
              return (
                <tr key={m.id} onClick={() => onResaltar(m.id)} className="cursor-pointer border-b border-[#0F2233] hover:[&>td]:brightness-125">
                  <td className={`px-2.5 py-[11px] font-semibold text-white ${sel ? "bg-[#0C2E4A] shadow-[inset_3px_0_0_#2BC4E8]" : ""}`}>{m.placa}</td>
                  <td className={`whitespace-nowrap px-2.5 py-[11px] ${sel ? "bg-[#0C2E4A]" : ""}`}>{m.nombre}</td>
                  {celdas(c, false)}
                </tr>
              );
            })}
            <tr className="border-t-2 border-[#2A4A66] font-bold">
              <td className="px-2.5 py-[11px] text-white">Flota</td>
              <td />
              {celdas(T, true)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-[#8FA3B8]">
        Rendimiento y consumo = km ÷ galones y galones ÷ km del periodo · Horómetro = horas de motor encendido (en ruta + ralentí) en las últimas 24 h
      </p>
    </section>
  );
}
