const VARIANTES = {
  success: "border-green-500/40 bg-green-500/10 text-green-400",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  danger:  "border-red-500/40   bg-red-500/10   text-red-400",
  info:    "border-blue-500/40  bg-blue-500/10  text-blue-300",
  neutral: "border-white/15     bg-white/5      text-slate-400",
} as const;

const TAMANOS = {
  xs: "px-1.5 py-0.5 text-[9px]",
  sm: "px-2.5 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
} as const;

interface BadgeProps {
  etiqueta: string;
  /** Variante semántica predefinida. */
  variante?: keyof typeof VARIANTES;
  /** Si se pasa `color`, se ignora `variante` y se usa este color hex como acento. */
  color?: string;
  tamano?: keyof typeof TAMANOS;
  className?: string;
}

/**
 * Badge de estado genérico.
 *
 * Uso con variante predefinida:
 * ```tsx
 * <Badge etiqueta="ACTIVO" variante="success" />
 * ```
 *
 * Uso con color custom:
 * ```tsx
 * <Badge etiqueta="CRÍTICO" color="#ef5350" />
 * ```
 */
export function Badge({ etiqueta, variante = "neutral", color, tamano = "sm", className = "" }: BadgeProps) {
  if (color) {
    return (
      <span
        className={`inline-block rounded border font-bold uppercase tracking-wider ${TAMANOS[tamano]} ${className}`}
        style={{ borderColor: `${color}55`, backgroundColor: `${color}1a`, color }}
      >
        {etiqueta}
      </span>
    );
  }

  return (
    <span className={`inline-block rounded border font-bold uppercase tracking-wider ${TAMANOS[tamano]} ${VARIANTES[variante]} ${className}`}>
      {etiqueta}
    </span>
  );
}
