import { useState, useCallback, type ReactNode } from "react";
import { create } from "zustand";
import { Check, AlertTriangle, X } from "lucide-react";
import { Modal } from "./Modal";

type TipoAviso = "exito" | "error";
interface Aviso { id: number; tipo: TipoAviso; texto: string }

const useAvisosStore = create<{ avisos: Aviso[]; agregar: (t: TipoAviso, texto: string) => void; quitar: (id: number) => void }>((set) => ({
  avisos: [],
  agregar: (tipo, texto) => {
    const id = Date.now() + Math.random();
    set((s) => ({ avisos: [...s.avisos, { id, tipo, texto }] }));
    setTimeout(() => set((s) => ({ avisos: s.avisos.filter((a) => a.id !== id) })), 4000);
  },
  quitar: (id) => set((s) => ({ avisos: s.avisos.filter((a) => a.id !== id) })),
}));

/** Reemplaza a alert(): avisar.exito("Guardado") / avisar.error("No se pudo…"). */
export const avisar = {
  exito: (texto: string) => useAvisosStore.getState().agregar("exito", texto),
  error: (texto: string) => useAvisosStore.getState().agregar("error", texto),
};

export function Avisos() {
  const { avisos, quitar } = useAvisosStore();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[10001] flex w-80 flex-col gap-2" aria-live="polite">
      {avisos.map((a) => (
        <div
          key={a.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-xl backdrop-blur ${
            a.tipo === "exito" ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-200" : "border-red-500/40 bg-red-950/90 text-red-200"
          }`}
        >
          {a.tipo === "exito" ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="flex-1">{a.texto}</span>
          <button type="button" onClick={() => quitar(a.id)} aria-label="Cerrar aviso" className="opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Reemplaza a confirm():
 *   const [confirmar, dialogo] = useConfirmar();
 *   if (await confirmar("¿Eliminar?")) …   y renderizar {dialogo}
 */
export function useConfirmar(): [(pregunta: string, detalle?: string) => Promise<boolean>, ReactNode] {
  const [estado, setEstado] = useState<{ pregunta: string; detalle?: string; resolver: (v: boolean) => void } | null>(null);

  const confirmar = useCallback(
    (pregunta: string, detalle?: string) => new Promise<boolean>((resolver) => setEstado({ pregunta, detalle, resolver })),
    [],
  );
  const cerrar = (valor: boolean) => {
    estado?.resolver(valor);
    setEstado(null);
  };

  const dialogo = (
    <Modal abierto={!!estado} titulo="Confirmar" onCerrar={() => cerrar(false)} ancho="max-w-sm">
      <p className="text-sm text-slate-200">{estado?.pregunta}</p>
      {estado?.detalle && <p className="mt-1 text-xs text-slate-400">{estado.detalle}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={() => cerrar(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-300 ring-1 ring-slate-700 hover:bg-slate-800">
          Cancelar
        </button>
        <button type="button" onClick={() => cerrar(true)} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500">
          Confirmar
        </button>
      </div>
    </Modal>
  );

  return [confirmar, dialogo];
}
