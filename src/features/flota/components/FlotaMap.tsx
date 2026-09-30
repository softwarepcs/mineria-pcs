import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import type { MaquinariaStats, EstadoFlota } from "@/features/flota/api";
import { useLeafletMap, ajustarVista } from "@/shared/map/useLeafletMap";
import { useFullscreen } from "@/shared/map/useFullscreen";
import { MapaControles } from "@/shared/map/MapaControles";
import { escapeHtml } from "@/shared/utils/escapeHtml";
import { num } from "@/shared/utils/formato";

import { ESTADO_UNIDAD } from "@/features/flota/estado";

function iconoCamion(estado: EstadoFlota, seleccionado: boolean) {
  const color = ESTADO_UNIDAD[estado].color;
  const size = seleccionado ? 40 : 32;
  return L.divIcon({
    className: "",
    html: `
      <div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;
        background:${color};border-radius:9999px;border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 0 0 3px rgba(0,0,0,0.45), 0 0 14px ${color}88;">
        <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="#0b1220" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 3h13v13H1z"/><path d="M14 8h4l3 3v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/>
        </svg>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

type ConPosicion = MaquinariaStats & { lat: number; lng: number };

export function FlotaMap({ maquinarias, selectedId, onSelect }: { maquinarias: MaquinariaStats[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const marcadoresRef = useRef<Record<string, L.Marker>>({});
  const { mapa, capa, setCapa } = useLeafletMap(contenedorRef);
  const { pantallaCompleta, alternarPantallaCompleta } = useFullscreen(wrapperRef);

  // Solo se dibujan las unidades con posición real
  const conPosicion = useMemo(() => maquinarias.filter((m): m is ConPosicion => m.lat !== null && m.lng !== null), [maquinarias]);
  const sinPosicion = maquinarias.length - conPosicion.length;

  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    marcadoresRef.current = {};
    conPosicion.forEach((c) => {
      marcadoresRef.current[c.id] = L.marker([c.lat, c.lng], { icon: iconoCamion(c.estado, c.id === selectedId) })
        .bindPopup(`<div style="font-family:sans-serif;font-size:13px;"><strong>${escapeHtml(c.placa)}</strong><br/>${escapeHtml(num(c.l100km, 1))} L/100km · ${ESTADO_UNIDAD[c.estado].etiqueta}</div>`)
        .on("click", () => onSelect(c.id))
        .addTo(grupo);
    });
    return () => {
      grupo.remove();
    };
  }, [mapa, conPosicion, selectedId, onSelect]);

  // Centrar solo cuando cambia la selección o al cargar: el refresco periódico no quita el zoom del usuario
  const centradoParaRef = useRef<string | null>(null);
  useEffect(() => {
    if (!mapa || conPosicion.length === 0) return;
    const clave = selectedId ?? "todas";
    if (centradoParaRef.current === clave) return;
    centradoParaRef.current = clave;
    const sel = selectedId ? conPosicion.find((c) => c.id === selectedId) : undefined;
    if (sel) {
      mapa.flyTo([sel.lat, sel.lng], 15, { duration: 0.8 });
      marcadoresRef.current[sel.id]?.openPopup();
    } else {
      mapa.closePopup();
      ajustarVista(mapa, conPosicion.map((c) => [c.lat, c.lng]));
    }
  }, [mapa, selectedId, conPosicion]);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#161b22] ${pantallaCompleta ? "h-screen" : "h-[320px] sm:h-[380px] lg:h-[450px]"}`}
    >
      <MapaControles capa={capa} onCapa={setCapa} pantallaCompleta={pantallaCompleta} onPantallaCompleta={alternarPantallaCompleta} />
      {sinPosicion > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-slate-300">
          {sinPosicion} unidad{sinPosicion > 1 ? "es" : ""} sin posición GPS
        </div>
      )}
      <div ref={contenedorRef} className="h-full w-full" />
    </div>
  );
}
