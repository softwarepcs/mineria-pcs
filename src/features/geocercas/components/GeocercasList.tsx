import { useMemo, useState } from "react";
import { ArrowDownAZ, Plus, Eye, EyeOff, Trash2, Truck, Circle, Pentagon } from "lucide-react";
import type { Geocerca, TipoGeocerca } from "../api";
import { colorSeguro } from "@/shared/utils/escapeHtml";
import { SearchInput } from "@/shared/ui/SearchInput";

export function GeocercasList({
  geocercas,
  seleccionadaId,
  unidadesDentro,
  puedeEditar,
  onNueva,
  onSeleccionar,
  onAlternarActiva,
  onEliminar,
}: {
  geocercas: Geocerca[];
  seleccionadaId: number | null;
  unidadesDentro: (g: Geocerca) => number;
  puedeEditar: boolean;
  onNueva: () => void;
  onSeleccionar: (g: Geocerca) => void;
  onAlternarActiva: (g: Geocerca) => void;
  onEliminar: (g: Geocerca) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [asc, setAsc] = useState(true);
  const [tipo, setTipo] = useState<"" | TipoGeocerca>("");

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return geocercas
      .filter((g) => (!tipo || g.tipo === tipo) && (!q || g.nombre.toLowerCase().includes(q) || g.descripcion.toLowerCase().includes(q) || g.sede.toLowerCase().includes(q)))
      .sort((a, b) => (asc ? 1 : -1) * a.nombre.localeCompare(b.nombre));
  }, [geocercas, busqueda, tipo, asc]);

  return (
    <div className="sidebar-scroll flex flex-1 flex-col overflow-y-auto bg-[#0d1117]">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-[#161b22] p-2">
        {puedeEditar && (
          <button type="button" onClick={onNueva} className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/15">
            <Plus className="h-3 w-3" /> Crear
          </button>
        )}
        <button type="button" onClick={() => setAsc((a) => !a)} title="Ordenar por nombre" className="rounded border border-white/10 p-1 text-slate-400 hover:text-white">
          <ArrowDownAZ className="h-3.5 w-3.5" />
        </button>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoGeocerca | "")} className="rounded border border-white/15 bg-[#161b22] px-1.5 py-1 text-[11px] text-slate-300 outline-none">
          <option value="">Todas</option>
          <option value="CIRCULO">Círculos</option>
          <option value="POLIGONO">Polígonos</option>
        </select>
        <SearchInput valor={busqueda} onChange={setBusqueda} placeholder="Buscar" className="flex-1" />
      </div>

      {lista.length === 0 ? (
        <p className="p-6 text-center text-xs text-slate-500">{geocercas.length ? "Ninguna geocerca coincide." : "Todavía no hay geocercas."}</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {lista.map((g) => {
            const dentro = unidadesDentro(g);
            return (
              <li
                key={g.id}
                onClick={() => onSeleccionar(g)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2.5 transition ${g.id === seleccionadaId ? "bg-cyan-500/10" : "hover:bg-white/[0.03]"} ${g.activa ? "" : "opacity-50"}`}
              >
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: colorSeguro(g.color) }} />
                {g.tipo === "CIRCULO" ? <Circle className="h-3.5 w-3.5 shrink-0 text-slate-500" /> : <Pentagon className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-white">{g.nombre}</div>
                  <div className="truncate text-[10px] text-slate-500">{g.sede}{g.descripcion ? ` · ${g.descripcion}` : ""}</div>
                </div>
                {dentro > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-cyan-300" title="Unidades dentro ahora">
                    <Truck className="h-3 w-3" /> {dentro}
                  </span>
                )}
                {puedeEditar && (
                  <>
                    <button type="button" title={g.activa ? "Desactivar" : "Activar"} onClick={(e) => { e.stopPropagation(); onAlternarActiva(g); }} className="p-1 text-slate-400 hover:text-white">
                      {g.activa ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" title="Eliminar" onClick={(e) => { e.stopPropagation(); onEliminar(g); }} className="p-1 text-slate-400 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
