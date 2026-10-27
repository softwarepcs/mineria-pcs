import type { ReactNode } from "react";

const PAD = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
} as const;

interface PanelProps {
  children: ReactNode;
  /** Padding interno. Por defecto `"md"`. */
  padding?: keyof typeof PAD;
  className?: string;
}

/**
 * Contenedor de sección (fondo #071623, borde #12263A). Sin backdrop-blur: dentro de un blur, `position: fixed` deja de referirse a la ventana.
 * Reemplaza el patrón repetido `rounded-xl border border-[#12263A] bg-[#071623]`.
 */
export function Panel({ children, padding = "md", className = "" }: PanelProps) {
  return (
    <div className={`rounded-xl border border-[#12263A] bg-[#071623] ${PAD[padding]} ${className}`}>
      {children}
    </div>
  );
}

/** Título de un panel (Barlow Condensed 21 px), con un complemento opcional a la derecha. */
export function PanelTitulo({ children, extra, className = "" }: { children: ReactNode; extra?: ReactNode; className?: string }) {
  return (
    <div className={`mb-3.5 flex flex-wrap items-baseline justify-between gap-2 ${className}`}>
      <h2 className="font-cond text-[21px] font-semibold leading-tight text-[#F2F6FA]">{children}</h2>
      {extra}
    </div>
  );
}
