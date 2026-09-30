import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
}

/** Modal accesible: cierra con Esc o clic en el fondo y devuelve el foco al cerrar. */
export function Modal({ abierto, titulo, onCerrar, children, ancho = "max-w-lg" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previo?.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onCerrar}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex max-h-[90vh] w-full ${ancho} flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h3 className="text-sm font-bold text-white">{titulo}</h3>
          <button type="button" onClick={onCerrar} className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
