import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SinDatos } from "@/shared/ui/Estados";
import { fechaHora, haceCuanto, num } from "@/shared/utils/formato";
import type { AlertaEvento, Severidad } from "../api";
import { SEV, SEVERIDADES_ORDEN, est, nombreRegla, pctSobreUmbral, sev } from "../estilos";

interface Grupo {
  clave: string;
  regla: string;
  maquinaria: string;
  items: AlertaEvento[];
  severidad: Severidad;
  sinAtender: number;
}

/** Agrupa por regla + unidad conservando el orden (la más reciente primero). */
function agruparAlertas(items: AlertaEvento[]): Grupo[] {
  const mapa = new Map<string, Grupo>();
  for (const a of items) {
    const clave = `${a.regla}|${a.maquinariaId}`;
    let g = mapa.get(clave);
    if (!g) {
      g = { clave, regla: a.regla, maquinaria: a.maquinaria, items: [], severidad: a.severidad, sinAtender: 0 };
      mapa.set(clave, g);
    }
    g.items.push(a);
    if (a.estado === "GENERADO") g.sinAtender += 1;
    if (SEVERIDADES_ORDEN.indexOf(a.severidad) < SEVERIDADES_ORDEN.indexOf(g.severidad)) g.severidad = a.severidad;
  }
  return [...mapa.values()];
}

interface Props {
  items: AlertaEvento[];
  agrupar: boolean;
  seleccionadaId: string | null;
  marcadas: ReadonlySet<string>;
  /** Muestra las casillas siempre (modo selección). Si no, solo al pasar el cursor. */
  mostrarCasillas: boolean;
  puedeAtender: boolean;
  /** Con el panel de detalle abierto la tabla es más estrecha: se omite la columna Valor / umbral. */
  compacta: boolean;
  onAbrir: (id: string) => void;
  onMarcar: (ids: string[], marcar: boolean) => void;
}

const TH = "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500";

function Casilla({ marcada, parcial, visible, onCambiar, etiqueta }: { marcada: boolean; parcial?: boolean; visible: boolean; onCambiar: (v: boolean) => void; etiqueta: string }) {
  return (
    <input
      type="checkbox"
      aria-label={etiqueta}
      checked={marcada}
      ref={(el) => {
        if (el) el.indeterminate = !!parcial && !marcada;
      }}
      onChange={(e) => onCambiar(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className={`h-3.5 w-3.5 cursor-pointer accent-[#0df5c6] transition-opacity focus:opacity-100 ${visible || marcada || parcial ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
    />
  );
}

function EtiquetaSeveridad({ s }: { s: string }) {
  const v = sev(s);
  return <span className={`inline-block rounded border px-1.5 py-px text-[10px] font-bold ${v.clase}`}>{v.etiqueta}</span>;
}

function Estado({ e, soloPunto }: { e: string; soloPunto: boolean }) {
  const v = est(e);
  return (
    <span title={v.etiqueta} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-slate-300">
      <span className={`h-2 w-2 rounded-full ${v.punto}`} />
      <span className={soloPunto ? "sr-only" : ""}>{v.etiqueta}</span>
    </span>
  );
}

function ValorUmbral({ a }: { a: AlertaEvento }) {
  const pct = pctSobreUmbral(a.valorRegistrado, a.valorUmbral);
  return (
    <span className="whitespace-nowrap font-mono">
      <span className="font-bold text-white">{num(a.valorRegistrado, 1)}</span>
      <span className="text-slate-500"> {a.condicion} {num(a.valorUmbral, 1)}</span>
      {pct !== null && (
        <span className="ml-1.5 rounded px-1 py-px text-[10px] font-bold" style={{ color: sev(a.severidad).strip, background: "rgba(255,255,255,0.05)" }}>
          {pct >= 0 ? "+" : ""}
          {pct.toFixed(1)}%
        </span>
      )}
    </span>
  );
}

export function AlertasTabla({ items, agrupar, seleccionadaId, marcadas, mostrarCasillas, puedeAtender, compacta, onAbrir, onMarcar }: Props) {
  const grupos = useMemo(() => (agrupar ? agruparAlertas(items) : []), [agrupar, items]);
  const [abiertos, setAbiertos] = useState<ReadonlySet<string>>(new Set());

  const alternar = (clave: string) =>
    setAbiertos((prev) => {
      const n = new Set(prev);
      if (!n.delete(clave)) n.add(clave);
      return n;
    });

  // Al seleccionar una alerta (clic o teclado) su grupo se abre; después se puede contraer libremente.
  // Solo reacciona a un cambio de selección, no a cada recarga de la lista.
  const ultimaSeleccion = useRef<string | null>(null);
  useEffect(() => {
    if (seleccionadaId === ultimaSeleccion.current) return;
    ultimaSeleccion.current = seleccionadaId;
    const clave = seleccionadaId ? grupos.find((g) => g.items.some((a) => a.id === seleccionadaId))?.clave : undefined;
    if (clave) setAbiertos((prev) => (prev.has(clave) ? prev : new Set(prev).add(clave)));
  }, [seleccionadaId, grupos]);

  const estaAbierto = (clave: string) => abiertos.has(clave);

  const filaAlerta = (a: AlertaEvento, enGrupo: boolean) => {
    const seleccionada = seleccionadaId === a.id;
    return (
      <tr
        key={a.id}
        data-alerta={a.id}
        aria-selected={seleccionada}
        onClick={() => onAbrir(a.id)}
        className={`group cursor-pointer border-b border-white/5 transition-colors ${seleccionada ? "bg-[#0df5c6]/[0.07]" : "hover:bg-white/[0.04]"}`}
      >
        <td className="w-9 py-2 pl-3" style={{ boxShadow: `inset 3px 0 0 ${sev(a.severidad).strip}` }}>
          {puedeAtender && <Casilla marcada={marcadas.has(a.id)} visible={mostrarCasillas} onCambiar={(v) => onMarcar([a.id], v)} etiqueta={`Marcar alerta ${a.id}`} />}
        </td>
        <td className="hidden px-3 py-2 sm:table-cell"><EtiquetaSeveridad s={a.severidad} /></td>
        <td className={`px-3 py-2 ${enGrupo ? "pl-8 text-slate-400" : "font-semibold text-white"}`}>{enGrupo ? "↳ " : ""}{nombreRegla(a.regla)}</td>
        <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-300">{a.maquinaria}</td>
        <td className="hidden whitespace-nowrap px-3 py-2 md:table-cell">
          <span className="block font-mono text-slate-300">{fechaHora(a.fechaHora)}</span>
          <span className="block text-[10px] text-slate-500">{haceCuanto(a.fechaHora)}</span>
        </td>
        {!compacta && <td className="hidden px-3 py-2 lg:table-cell"><ValorUmbral a={a} /></td>}
        <td className="px-3 py-2"><Estado e={a.estado} soloPunto={compacta} /></td>
      </tr>
    );
  };

  const filaGrupo = (g: Grupo) => {
    const abierto = estaAbierto(g.clave);
    const marcadasGrupo = g.items.filter((a) => marcadas.has(a.id)).length;
    const peor = g.items.reduce((m, a) => Math.max(m, pctSobreUmbral(a.valorRegistrado, a.valorUmbral) ?? 0), 0);
    return (
      <tr key={g.clave} onClick={() => alternar(g.clave)} aria-expanded={abierto} className="group cursor-pointer border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.05]">
        <td className="w-9 py-2 pl-3" style={{ boxShadow: `inset 3px 0 0 ${SEV[g.severidad].strip}` }}>
          {puedeAtender && (
            <Casilla
              marcada={marcadasGrupo === g.items.length}
              parcial={marcadasGrupo > 0}
              visible={mostrarCasillas}
              onCambiar={(v) => onMarcar(g.items.map((a) => a.id), v)}
              etiqueta={`Marcar las ${g.items.length} alertas de ${g.maquinaria}`}
            />
          )}
        </td>
        <td className="hidden px-3 py-2 sm:table-cell"><EtiquetaSeveridad s={g.severidad} /></td>
        <td className="px-3 py-2 font-semibold text-white">
          <span className="inline-flex items-center gap-1.5">
            {abierto ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            {nombreRegla(g.regla)}
            <span className="rounded-full bg-white/10 px-1.5 py-px font-mono text-[10px] font-bold text-white">×{g.items.length}</span>
          </span>
        </td>
        <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-300">{g.maquinaria}</td>
        <td className="hidden whitespace-nowrap px-3 py-2 md:table-cell">
          <span className="block font-mono text-slate-300">{fechaHora(g.items[0].fechaHora)}</span>
          <span className="block text-[10px] text-slate-500">última · {haceCuanto(g.items[0].fechaHora)}</span>
        </td>
        {!compacta && <td className="hidden px-3 py-2 text-slate-400 lg:table-cell">{peor > 0 ? `hasta +${peor.toFixed(1)}%` : "—"}</td>}
        <td title={`${g.sinAtender} sin atender`} className="whitespace-nowrap px-3 py-2 text-[11px] text-slate-400">{compacta ? `${g.sinAtender} ●` : g.sinAtender ? `${g.sinAtender} sin atender` : "todas atendidas"}</td>
      </tr>
    );
  };

  if (items.length === 0) return <SinDatos titulo="No hay alertas con estos filtros" />;

  return (
    <table className="w-full border-collapse text-xs">
      <thead className="sticky top-0 z-10 bg-[#0b0f17] shadow-[0_1px_0_rgba(255,255,255,0.08)]">
        <tr>
          <th className="w-9" />
          <th className={`${TH} hidden sm:table-cell`}>Severidad</th>
          <th className={TH}>Regla</th>
          <th className={TH}>Unidad</th>
          <th className={`${TH} hidden md:table-cell`}>Fecha</th>
          {!compacta && <th className={`${TH} hidden lg:table-cell`}>Valor / umbral</th>}
          <th className={TH}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {agrupar
          ? grupos.flatMap((g) => (g.items.length === 1 ? [filaAlerta(g.items[0], false)] : [filaGrupo(g), ...(estaAbierto(g.clave) ? g.items.map((a) => filaAlerta(a, true)) : [])]))
          : items.map((a) => filaAlerta(a, false))}
      </tbody>
    </table>
  );
}