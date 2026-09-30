import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { useLeafletMap, ajustarVista } from "@/shared/map/useLeafletMap";
import { useFullscreen } from "@/shared/map/useFullscreen";
import { MapaControles } from "@/shared/map/MapaControles";
import { escapeHtml, colorSeguro } from "@/shared/utils/escapeHtml";
import type { Geocerca } from "@/features/geocercas/api";
import type { Lectura } from "@/features/telemetria/api";
import { ESTADO_UNIDAD, posicion, type UnidadConHoy } from "../estado";

export function UnidadesMapa({
  unidades,
  seleccionadaId,
  onSeleccionar,
  geocercas,
  recorrido,
  visible,
}: {
  unidades: UnidadConHoy[];
  seleccionadaId: number | null;
  onSeleccionar: (id: number) => void;
  geocercas: Geocerca[];
  recorrido: Lectura[] | null;
  visible: boolean;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { mapa, capa, setCapa } = useLeafletMap(contenedorRef, { posicionZoom: "topright" });
  const { pantallaCompleta, alternarPantallaCompleta } = useFullscreen(wrapperRef);

  const conPosicion = useMemo(() => unidades.filter((u) => posicion(u) !== null), [unidades]);

  // Geocercas activas de la empresa
  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    geocercas.filter((g) => g.activa).forEach((g) => {
      const color = colorSeguro(g.color);
      const estilo = { color, weight: 2, fillColor: color, fillOpacity: 0.18 };
      const capaGeo = g.tipo === "CIRCULO" && g.centro && g.radio ? L.circle(g.centro, { ...estilo, radius: g.radio }) : g.puntos.length >= 3 ? L.polygon(g.puntos, estilo) : null;
      capaGeo?.bindPopup(`<strong>${escapeHtml(g.nombre)}</strong><br/>${escapeHtml(g.descripcion)}`).addTo(grupo);
    });
    return () => {
      grupo.remove();
    };
  }, [mapa, geocercas]);

  // Marcadores de unidades
  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    conPosicion.forEach((u) => {
      const sel = u.id === seleccionadaId;
      const { color } = ESTADO_UNIDAD[u.estado];
      const html = `
        <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:9999px;background:rgba(13,17,23,0.92);
          border:1.5px solid ${sel ? "#0df5c6" : color};box-shadow:${sel ? "0 0 0 4px rgba(13,245,198,0.25),0 0 16px rgba(13,245,198,0.7)" : "0 2px 8px rgba(0,0,0,0.6)"};cursor:pointer;">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};"></span>
          <span style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;color:#f8fafc;white-space:nowrap;">${escapeHtml(u.identificador)}</span>
        </div>`;
      L.marker(posicion(u)!, { icon: L.divIcon({ className: "", html, iconSize: [110, 26], iconAnchor: [55, 13] }), zIndexOffset: sel ? 1000 : 0 })
        .on("click", () => onSeleccionar(u.id))
        .addTo(grupo);
    });
    return () => {
      grupo.remove();
    };
  }, [mapa, conPosicion, seleccionadaId, onSeleccionar]);

  // Recorrido de la unidad seleccionada
  useEffect(() => {
    if (!mapa || !recorrido) return;
    const puntos = recorrido.filter((l) => l.lat !== null && l.lng !== null).map((l) => [l.lat!, l.lng!] as [number, number]);
    if (puntos.length < 2) return;
    const linea = L.polyline(puntos, { color: "#3fb68b", weight: 3, opacity: 0.9 }).addTo(mapa);
    ajustarVista(mapa, puntos);
    return () => {
      linea.remove();
    };
  }, [mapa, recorrido]);

  // Centrar solo cuando cambia la selección (o al tener posiciones por primera vez).
  // Las actualizaciones cada 30 s mueven los marcadores pero no tocan el zoom del usuario.
  const centradoParaRef = useRef<string | null>(null);
  const hayPosiciones = conPosicion.length > 0;
  useEffect(() => {
    if (!mapa || recorrido || !hayPosiciones) return;
    const clave = String(seleccionadaId ?? "todas");
    if (centradoParaRef.current === clave) return;
    centradoParaRef.current = clave;
    const sel = conPosicion.find((u) => u.id === seleccionadaId);
    if (sel) mapa.flyTo(posicion(sel)!, 13, { duration: 0.8 });
    else ajustarVista(mapa, conPosicion.map((u) => posicion(u)!));
  }, [mapa, seleccionadaId, conPosicion, hayPosiciones, recorrido]);
  // Al cerrar el recorrido se vuelve a centrar en la selección
  useEffect(() => {
    if (!recorrido) centradoParaRef.current = null;
  }, [recorrido]);

  const sinPosicion = unidades.length - conPosicion.length;

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full w-full flex-1 overflow-hidden bg-[#050911] xl:flex ${visible ? "flex" : "hidden"}`}
    >
      <MapaControles capa={capa} onCapa={setCapa} pantallaCompleta={pantallaCompleta} onPantallaCompleta={alternarPantallaCompleta} className="top-3 right-14" />
      <div className="absolute bottom-4 left-4 z-[1000] hidden items-center gap-4 rounded-full border border-white/10 bg-[#0d1422]/90 px-3.5 py-1.5 text-[11px] font-medium text-slate-300 shadow-2xl backdrop-blur-md xl:flex">
        {Object.values(ESTADO_UNIDAD).map((e) => (
          <span key={e.etiqueta} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
            {e.etiqueta}
          </span>
        ))}
        {sinPosicion > 0 && <span className="text-slate-500">· {sinPosicion} sin posición</span>}
      </div>
      <div ref={contenedorRef} className="h-full w-full" />
    </div>
  );
}
