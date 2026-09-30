import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  /** Badge numérico junto al título (ej: total de registros). */
  contador?: number;
  /** Slot para acciones: botones "Crear", filtros, etc. */
  accion?: ReactNode;
  className?: string;
}

/**
 * Encabezado estándar de página: título + descripción + acciones opcionales.
 *
 * Elimina la duplicación del patrón `h1 + p` presente en 8 vistas.
 */
export function PageHeader({ titulo, descripcion, contador, accion, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col justify-between gap-3 sm:flex-row sm:items-center ${className}`}>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{titulo}</h1>
        {contador !== undefined && (
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-[#0df5c6]">
            {contador}
          </span>
        )}
      </div>
      {descripcion && !accion && <p className="text-sm text-slate-400">{descripcion}</p>}
      {accion && <div className="flex flex-wrap items-center gap-3">{accion}</div>}
      {descripcion && accion && <p className="w-full text-sm text-slate-400">{descripcion}</p>}
    </div>
  );
}
