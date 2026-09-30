import type { ReactNode } from "react";
import { mensajeError } from "@/shared/api/errores";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400 ${className}`} />;
}

export function Cargando({ texto = "Cargando..." }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-8 text-sm text-slate-400" role="status">
      <Spinner />
      {texto}
    </div>
  );
}

export function SinDatos({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <p className="text-sm font-medium text-slate-300">{titulo}</p>
      {children && <div className="mt-1.5 text-xs text-slate-500">{children}</div>}
    </div>
  );
}

export function ErrorCarga({ error, onReintentar }: { error: unknown; onReintentar?: () => void }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300" role="alert">
      <p>{mensajeError(error, "No se pudo cargar la información.")}</p>
      {onReintentar && (
        <button type="button" onClick={onReintentar} className="mt-2 text-xs font-semibold underline hover:text-red-200">
          Reintentar
        </button>
      )}
    </div>
  );
}
