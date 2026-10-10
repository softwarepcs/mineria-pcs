import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SinDatos, Spinner } from "@/shared/ui/Estados";
import { fechaHora, num } from "@/shared/utils/formato";
import type { AlertaEvento, Severidad } from "../api";
import { EST, SEV, SEVERIDADES_ORDEN, est, nombreRegla, sev } from "../estilos";

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
  total: number;
  agrupar: boolean;
  seleccionadaId: string | null;
  marcadas: ReadonlySet<string>;
  puedeAtender: boolean;
  hayMas: boolean;
  cargandoMas: boolean;
  onSeleccionar: (id: string) => void;
  /** Navegación con teclado: selecciona sin abrir el detalle en móvil. */
  onMover: (id: string) => void;
  onMarcar: (ids: string[], marcar: boolean) => void;
  onCargarMas: () => void;
}

function Casilla({ marcada, parcial, onCambiar, etiqueta }: { marcada: boolean; parcial?: boolean; onCambiar: (v: boolean) => void; etiqueta: string }) {
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
      className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#0df5c6]"
    />
  );
}

function Fila({
  a,
  mostrarRegla,
  seleccionada,
  marcada,
  puedeAtender,
  onSeleccionar,
  onMarcar,
}: {
  a: AlertaEvento;
  mostrarRegla: boolean;
  seleccionada: boolean;
  marcada: boolean;
  puedeAtender: boolean;
  onSeleccionar: () => void;
  onMarcar: (v: boolean) => void;
}) {
  const s = sev(a.severidad);
  const e = est(a.estado);
  return (
    <div
      data-alerta={a.id}
      className={`flex items-center gap-2 border-l-[3px] px-2 py-1.5 transition-colors ${seleccionada ? "bg-white/[0.07]" : "hover:bg-white/[0.03]"}`}
      style={{ borderLeftColor: s.strip }}
    >
      {puedeAtender && <Casilla marcada={marcada} onCambiar={onMarcar} etiqueta={`Marcar alerta ${a.id}`} />}
      <button type="button" onClick={onSeleccionar} aria-current={seleccionada} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className="min-w-0 flex-1">
          {mostrarRegla && <span className="block truncate text-[11px] font-bold text-white">{nombreRegla(a.regla)}</span>}
          <span className="block truncate font-mono text-[10px] text-slate-400">
            {fechaHora(a.fechaHora)}
            {mostrarRegla ? ` · ${a.maquinaria}` : ` · valor ${num(a.valorRegistrado, 1)}`}
          </span>
        </span>
        <span className={`shrink-0 rounded border px-1 py-px text-[9px] font-bold ${s.clase}`}>{s.corta}</span>
        <span title={EST[a.estado]?.etiqueta ?? a.estado} className={`h-2 w-2 shrink-0 rounded-full ${e.punto}`} />
      </button>
    </div>
  );
}

export function AlertasLista({ items, total, agrupar, seleccionadaId, marcadas, puedeAtender, hayMas, cargandoMas, onSeleccionar, onMover, onMarcar, onCargarMas }: Props) {
  const grupos = useMemo(() => (agrupar ? agruparAlertas(items) : []), [agrupar, items]);
  const [abiertos, setAbiertos] = useState<ReadonlySet<string>>(new Set());

  // El grupo de la alerta seleccionada siempre se muestra abierto al seleccionarla
  useEffect(() => {
    if (!seleccionadaId) return;
    const g = grupos.find((x) => x.items.some((a) => a.id === seleccionadaId));
    if (g) setAbiertos((prev) => (prev.has(g.clave) ? prev : new Set(prev).add(g.clave)));
  }, [seleccionadaId, grupos]);

  // Mantiene visible la fila seleccionada (teclado)
  useEffect(() => {
    if (seleccionadaId) document.querySelector(`[data-alerta="${seleccionadaId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [seleccionadaId]);

  const idsVisibles = useMemo(() => {
    if (!agrupar) return items.map((a) => a.id);
    return grupos.flatMap((g) => (g.items.length === 1 || abiertos.has(g.clave) ? g.items.map((a) => a.id) : []));
  }, [agrupar, items, grupos, abiertos]);

  const alternar = (clave: string) =>
    setAbiertos((prev) => {
      const n = new Set(prev);
      if (!n.delete(clave)) n.add(clave);
      return n;
    });

  const onKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
    if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;
    ev.preventDefault();
    const i = seleccionadaId ? idsVisibles.indexOf(seleccionadaId) : -1;
    const sig = idsVisibles[ev.key === "ArrowDown" ? Math.min(i + 1, idsVisibles.length - 1) : Math.max(i - 1, 0)];
    if (sig) onMover(sig);
  };

  const fila = (a: AlertaEvento, mostrarRegla: boolean) => (
    <Fila
      key={a.id}
      a={a}
      mostrarRegla={mostrarRegla}
      seleccionada={seleccionadaId === a.id}
      marcada={marcadas.has(a.id)}
      puedeAtender={puedeAtender}
      onSeleccionar={() => onSeleccionar(a.id)}
      onMarcar={(v) => onMarcar([a.id], v)}
    />
  );

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} aria-label="Lista de alertas" className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/8 bg-[#0d1117] outline-none focus-visible:border-white/25">
      {items.length === 0 && <SinDatos titulo="No hay alertas con estos filtros" />}

      {agrupar
        ? grupos.map((g) => {
            if (g.items.length === 1) return fila(g.items[0], true);
            const abierto = abiertos.has(g.clave);
            const marcadasGrupo = g.items.filter((a) => marcadas.has(a.id)).length;
            const sv = SEV[g.severidad];
            return (
              <div key={g.clave} className="border-b border-white/5">
                <div className="flex items-center gap-2 border-l-[3px] bg-white/[0.02] px-2 py-1.5" style={{ borderLeftColor: sv.strip }}>
                  {puedeAtender && (
                    <Casilla
                      marcada={marcadasGrupo === g.items.length}
                      parcial={marcadasGrupo > 0}
                      onCambiar={(v) => onMarcar(g.items.map((a) => a.id), v)}
                      etiqueta={`Marcar las ${g.items.length} alertas de ${g.maquinaria}`}
                    />
                  )}
                  <button type="button" onClick={() => alternar(g.clave)} aria-expanded={abierto} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    {abierto ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-bold text-white">{nombreRegla(g.regla)}</span>
                      <span className="block truncate font-mono text-[10px] text-slate-400">
                        {g.maquinaria} · último {fechaHora(g.items[0].fechaHora)}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded border px-1 py-px text-[9px] font-bold ${sv.clase}`}>{sv.corta}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-px font-mono text-[10px] font-bold text-white" title={`${g.sinAtender} sin atender`}>
                      ×{g.items.length}
                    </span>
                  </button>
                </div>
                {abierto && <div className="ml-3 border-l border-white/10">{g.items.map((a) => fila(a, false))}</div>}
              </div>
            );
          })
        : items.map((a) => fila(a, true))}

      {items.length > 0 && (
        <div className="flex items-center justify-between gap-2 border-t border-white/8 px-3 py-2 text-[11px] text-slate-500">
          <span className="font-mono">
            {items.length} de {total}
          </span>
          {hayMas && (
            <button type="button" disabled={cargandoMas} onClick={onCargarMas} className="inline-flex items-center gap-1.5 rounded bg-white/5 px-3 py-1 font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">
              {cargandoMas && <Spinner />} Cargar más
            </button>
          )}
        </div>
      )}
    </div>
  );
}
