import { Maximize2, Minimize2 } from "lucide-react";

/** Botón de pantalla completa para tablas y paneles (mismo estilo que el del mapa). */
export function BotonPantallaCompleta({ activo, onClick, que = "la tabla" }: { activo: boolean; onClick: () => void; que?: string }) {
  const etiqueta = activo ? "Salir de pantalla completa" : `Ver ${que} en pantalla completa`;
  return (
    <button
      type="button"
      onClick={onClick}
      title={etiqueta}
      aria-label={etiqueta}
      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-[#1E3850] bg-[#0C2133] text-[#C9D6E3] transition hover:text-[#2BC4E8]"
    >
      {activo ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>
  );
}
