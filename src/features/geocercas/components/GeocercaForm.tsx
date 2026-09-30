import { Circle, Pentagon, Undo2 } from "lucide-react";
import type { Sede } from "@/features/empresas/api";
import type { GeocercaValores } from "../api";
import { num } from "@/shared/utils/formato";

const claseInput = "flex-1 min-w-0 rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-400";

function Fila({ etiqueta, requerido, children }: { etiqueta: string; requerido?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-slate-300">{etiqueta}{requerido && <span className="text-red-400"> *</span>}</span>
      {children}
    </label>
  );
}

export function GeocercaForm({
  valores,
  cambiar,
  sedes,
  medidas,
  editando,
  error,
  guardando,
  onGuardar,
  onCancelar,
}: {
  valores: GeocercaValores;
  cambiar: <K extends keyof GeocercaValores>(campo: K, valor: GeocercaValores[K]) => void;
  sedes: Sede[];
  medidas: { areaHa: number; perimetroM: number };
  editando: boolean;
  error: string | null;
  guardando: boolean;
  onGuardar: () => void;
  onCancelar: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar();
      }}
      className="sidebar-scroll flex-1 space-y-3 overflow-y-auto bg-[#0d1117] p-3"
    >
      <div className="flex items-center justify-between rounded-md border border-white/5 bg-[#21262d] px-3 py-1.5 text-xs font-medium text-slate-200">
        <span>{editando ? "Editar geocerca" : "Nueva geocerca"}</span>
        <span className="text-[10px] text-slate-400">Haz clic en el mapa para ubicarla</span>
      </div>

      <Fila etiqueta="Nombre" requerido>
        <input required maxLength={150} value={valores.nombre} onChange={(e) => cambiar("nombre", e.target.value)} className={claseInput} />
      </Fila>
      <Fila etiqueta="Sede" requerido>
        <select required value={valores.sedeId ?? ""} onChange={(e) => cambiar("sedeId", Number(e.target.value) || null)} className={claseInput}>
          <option value="">Selecciona…</option>
          {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </Fila>
      <label className="flex items-start gap-2">
        <span className="w-20 shrink-0 pt-1 text-xs text-slate-300">Descripción</span>
        <textarea rows={2} value={valores.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} className={`${claseInput} resize-none`} />
      </label>

      <div className="flex items-center gap-2">
        <span className="w-20 shrink-0 text-xs text-slate-300">Tipo</span>
        <div className="flex items-center rounded border border-white/15 bg-[#161b22] p-0.5">
          {([["CIRCULO", Circle, "Círculo"], ["POLIGONO", Pentagon, "Polígono"]] as const).map(([t, Icono, titulo]) => (
            <button
              key={t}
              type="button"
              title={titulo}
              onClick={() => cambiar("tipo", t)}
              className={`flex h-6 items-center gap-1 rounded px-2 text-[11px] transition ${valores.tipo === t ? "bg-[#6366f1] text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Icono className="h-3.5 w-3.5" /> {titulo}
            </button>
          ))}
        </div>
      </div>

      {valores.tipo === "CIRCULO" ? (
        <>
          <Fila etiqueta="Centro">
            <span className="font-mono text-xs text-cyan-300">
              {valores.centro ? `${valores.centro[0].toFixed(6)}, ${valores.centro[1].toFixed(6)}` : "Clic en el mapa"}
            </span>
          </Fila>
          <Fila etiqueta="Radio (m)" requerido>
            <input type="number" min={1} step={1} required value={valores.radio ?? ""} onChange={(e) => cambiar("radio", e.target.value ? Number(e.target.value) : null)} className={claseInput} />
          </Fila>
        </>
      ) : (
        <Fila etiqueta="Vértices">
          <span className="text-xs text-slate-200">{valores.puntos.length}</span>
          <button type="button" disabled={!valores.puntos.length} onClick={() => cambiar("puntos", valores.puntos.slice(0, -1))} className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-white disabled:opacity-40">
            <Undo2 className="h-3 w-3" /> Deshacer
          </button>
          <button type="button" disabled={!valores.puntos.length} onClick={() => cambiar("puntos", [])} className="text-[11px] text-slate-400 hover:text-white disabled:opacity-40">
            Borrar
          </button>
        </Fila>
      )}

      <div className="flex gap-4 text-xs text-slate-400">
        <span>Área: <span className="font-mono text-slate-200">{num(medidas.areaHa, 2)} ha</span></span>
        <span>Perímetro: <span className="font-mono text-slate-200">{num(medidas.perimetroM / 1000, 2)} km</span></span>
      </div>

      <Fila etiqueta="Color">
        <input type="color" value={valores.color} onChange={(e) => cambiar("color", e.target.value)} className="h-6 w-8 cursor-pointer rounded border border-white/15 bg-transparent p-0" />
        <span className="font-mono text-xs text-slate-400">{valores.color}</span>
      </Fila>
      <Fila etiqueta="Vigente desde">
        <input type="datetime-local" value={valores.fechaInicio ?? ""} onChange={(e) => cambiar("fechaInicio", e.target.value || null)} className={claseInput} />
      </Fila>
      <Fila etiqueta="Hasta">
        <input type="datetime-local" value={valores.fechaExpiracion ?? ""} onChange={(e) => cambiar("fechaExpiracion", e.target.value || null)} className={claseInput} />
      </Fila>

      {error && <p className="text-[11px] text-amber-400">{error}</p>}

      <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-2">
        <button type="button" onClick={onCancelar} className="rounded border border-white/10 px-3 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white">Cancelar</button>
        <button type="submit" disabled={!!error || guardando} className="rounded bg-cyan-600 px-3.5 py-1 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
