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
 * Título y descripción a la izquierda (uno bajo el otro); las acciones, alineadas a la derecha. El desplegable de una acción se ancla a su borde derecho, así que se abre hacia la izquierda sin salirse de la pantalla.
 */
export function PageHeader({ titulo, descripcion, contador, accion, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="font-cond text-[32px] font-bold leading-none text-white sm:text-[38px]">{titulo}</h1>
          {contador !== undefined && (
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-[#2BC4E8]">
              {contador}
            </span>
          )}
        </div>
        {descripcion && <p className="mt-1 text-base text-[#A9BBCC]">{descripcion}</p>}
      </div>
      {accion && <div className="flex flex-wrap items-center gap-3 sm:justify-end">{accion}</div>}
    </div>
  );
}
