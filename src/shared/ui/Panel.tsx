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
 * Contenedor visual con borde glassmorphism.
 * Reemplaza el patrón repetido `rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm`.
 */
export function Panel({ children, padding = "md", className = "" }: PanelProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${PAD[padding]} ${className}`}>
      {children}
    </div>
  );
}
