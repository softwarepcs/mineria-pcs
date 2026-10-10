import { useEffect, useState } from "react";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { GraficoLinea, type Serie } from "@/shared/ui/GraficoLinea";
import { PeriodoSelector } from "@/shared/ui/PeriodoSelector";
import { fechaHora, haceCuanto, hora, num } from "@/shared/utils/formato";
import { useLecturasSistema } from "@/features/telemetria/hooks";
import type { CampoSistema, LecturasSistema, ValorCampo } from "@/features/telemetria/api";
import { useSistemasUnidad } from "../hooks";

const HORAS = [
  { valor: 6, etiqueta: "6 h" },
  { valor: 24, etiqueta: "24 h" },
  { valor: 168, etiqueta: "7 días" },
];
const COLORES = ["#0df5c6", "#58a6ff", "#fbbf24", "#f472b6"];

function textoValor(c: CampoSistema, v: ValorCampo | undefined): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  if (typeof v === "number") return num(v, c.decimales);
  return v;
}

function Dato({ campo, valor }: { campo: CampoSistema; valor: ValorCampo | undefined }) {
  const activo = valor === true;
  return (
    <div className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-[#0d1117] p-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{campo.etiqueta}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-xl font-bold ${activo ? "text-[#0df5c6]" : "text-white"}`}>{textoValor(campo, valor)}</span>
        {campo.unidad && typeof valor === "number" && <span className="text-[11px] text-slate-400">{campo.unidad}</span>}
      </div>
    </div>
  );
}

/** Campos graficables que comparten unidad van en un mismo gráfico (p. ej. temp. de cámara y de evaporador). */
function gruposDeGrafico(campos: CampoSistema[]): CampoSistema[][] {
  const grupos = new Map<string, CampoSistema[]>();
  campos.filter((c) => c.grafico).forEach((c, i) => {
    const k = c.unidad ? `u:${c.unidad}` : `solo:${i}`;
    grupos.set(k, [...(grupos.get(k) ?? []), c]);
  });
  return [...grupos.values()];
}

function Graficos({ datos }: { datos: LecturasSistema }) {
  const grupos = gruposDeGrafico(datos.campos);
  if (!grupos.length) return null;
  if (datos.serie.length < 2) return <p className="text-xs text-slate-500">Aún no hay suficientes lecturas en este período para dibujar gráficos.</p>;
  const ticks = datos.serie.map((l) => hora(l.timestamp));
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {grupos.map((g) => {
        const series: Serie[] = g.map((c, i) => ({
          nombre: c.etiqueta,
          color: COLORES[i % COLORES.length],
          valores: datos.serie.map((l) => (typeof l.valores[c.clave] === "number" ? (l.valores[c.clave] as number) : null)),
        }));
        return (
          <div key={g[0].clave} className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4">
            <h3 className="mb-2 text-xs font-bold text-white">{g.map((c) => c.etiqueta).join(" · ")}{g[0].unidad ? ` (${g[0].unidad})` : ""}</h3>
            <GraficoLinea alto={130} unidad={g[0].unidad} etiquetasX={ticks} series={series} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Lo que reporta cada sistema de la unidad (motor, frío, fluidos…), armado a partir de los campos que el
 * propio sistema declara: agregar un sistema nuevo no requiere tocar esta pantalla.
 */
export function SistemasUnidad({ maquinariaId }: { maquinariaId: number }) {
  const sistemas = useSistemasUnidad(maquinariaId);
  const activos = (sistemas.data ?? []).filter((s) => s.estado);
  const [elegido, setElegido] = useState<number | null>(null);
  const [horas, setHoras] = useState(24);
  const sistemaId = activos.find((s) => s.sistemaId === elegido)?.sistemaId ?? activos[0]?.sistemaId ?? null;
  const lecturas = useLecturasSistema(maquinariaId, sistemaId, horas);

  useEffect(() => setElegido(null), [maquinariaId]);

  if (sistemas.isLoading) return <Cargando />;
  if (sistemas.error) return <ErrorCarga error={sistemas.error} onReintentar={() => void sistemas.refetch()} />;
  if (!activos.length) {
    return <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4 text-xs text-slate-500">Esta unidad no tiene sistemas ni dispositivo instalado: no recibe telemetría.</div>;
  }

  const d = lecturas.data;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" className="flex flex-wrap gap-1">
          {activos.map((s) => (
            <button
              key={s.sistemaId}
              type="button"
              role="tab"
              aria-selected={s.sistemaId === sistemaId}
              onClick={() => setElegido(s.sistemaId)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${s.sistemaId === sistemaId ? "bg-cyan-500 text-slate-950" : "border border-white/10 text-slate-300 hover:bg-white/5"}`}
            >
              {s.sistema.nombre}
            </button>
          ))}
        </div>
        <PeriodoSelector opciones={HORAS} valor={horas} onCambiar={setHoras} />
      </div>

      {lecturas.isLoading ? (
        <Cargando />
      ) : lecturas.error ? (
        <ErrorCarga error={lecturas.error} onReintentar={() => void lecturas.refetch()} />
      ) : d ? (
        <>
          {d.ultima ? (
            <p className="text-[11px] text-slate-400">Último dato de este sistema: {haceCuanto(d.ultima.timestamp)} · {fechaHora(d.ultima.timestamp)}</p>
          ) : (
            <p className="text-xs text-slate-500">Este sistema no envió lecturas en el período elegido.</p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {d.campos.map((c) => <Dato key={c.clave} campo={c} valor={d.ultima?.valores[c.clave]} />)}
          </div>
          <Graficos datos={d} />
        </>
      ) : null}
    </div>
  );
}
