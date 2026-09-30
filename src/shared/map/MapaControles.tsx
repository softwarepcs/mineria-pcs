import { Maximize2, Minimize2 } from "lucide-react";
import type { CapaMapa } from "./useLeafletMap";

/** Selector Mapa/Satélite + pantalla completa, igual en todos los mapas. */
export function MapaControles({
  capa,
  onCapa,
  pantallaCompleta,
  onPantallaCompleta,
  className = "top-3 right-3",
}: {
  capa: CapaMapa;
  onCapa: (c: CapaMapa) => void;
  pantallaCompleta: boolean;
  onPantallaCompleta: () => void;
  className?: string;
}) {
  return (
    <div className={`absolute z-[1000] flex items-center gap-2 ${className}`}>
      <div className="flex items-center rounded-lg border border-white/15 bg-[#0d1422]/90 p-0.5 shadow-xl backdrop-blur-sm">
        {(["mapa", "satelite"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCapa(c)}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${capa === c ? "bg-[#0df5c6] text-[#07131b] shadow" : "text-slate-400 hover:text-white"}`}
          >
            {c === "mapa" ? "Mapa" : "Satélite"}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onPantallaCompleta}
        title={pantallaCompleta ? "Salir de pantalla completa" : "Pantalla completa"}
        className="rounded-lg border border-white/15 bg-[#0d1422]/90 p-1.5 text-slate-300 shadow-xl backdrop-blur-sm transition hover:text-[#0df5c6]"
      >
        {pantallaCompleta ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
