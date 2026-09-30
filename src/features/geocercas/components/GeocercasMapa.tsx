import { useEffect, useRef } from "react";
import L from "leaflet";
import { Layers } from "lucide-react";
import { useLeafletMap, ajustarVista } from "@/shared/map/useLeafletMap";
import { useFullscreen } from "@/shared/map/useFullscreen";
import { MapaControles } from "@/shared/map/MapaControles";
import { escapeHtml, colorSeguro } from "@/shared/utils/escapeHtml";
import type { LatLng } from "@/shared/utils/geometria";
import type { Geocerca, GeocercaValores } from "../api";

export interface UnidadEnMapa {
  id: number;
  identificador: string;
  posicion: LatLng;
  dentroDeEdicion: boolean;
}

/** interactive=false mientras se edita: así los clics llegan al mapa y no abren popups. */
function capaGeocerca(g: Pick<Geocerca, "tipo" | "centro" | "radio" | "puntos" | "color">, resaltada: boolean, interactive = true): L.Layer | null {
  const color = colorSeguro(g.color);
  const estilo = { color, weight: resaltada ? 3 : 2, fillColor: color, fillOpacity: resaltada ? 0.35 : 0.2, interactive };
  if (g.tipo === "CIRCULO" && g.centro && g.radio) return L.circle(g.centro, { ...estilo, radius: g.radio });
  if (g.tipo === "POLIGONO" && g.puntos.length >= 3) return L.polygon(g.puntos, estilo);
  if (g.tipo === "POLIGONO" && g.puntos.length > 0) return L.polyline(g.puntos, { color, weight: 2, dashArray: "4 6", interactive });
  return null;
}

export function GeocercasMapa({
  geocercas,
  editandoId,
  valores,
  unidades,
  modoEdicion,
  onClic,
  visible,
}: {
  geocercas: Geocerca[];
  editandoId: number | null;
  valores: GeocercaValores;
  unidades: UnidadEnMapa[];
  modoEdicion: boolean;
  onClic: (p: LatLng) => void;
  visible: boolean;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { mapa, capa, setCapa } = useLeafletMap(contenedorRef);
  const { pantallaCompleta, alternarPantallaCompleta } = useFullscreen(wrapperRef);
  const onClicRef = useRef(onClic);
  onClicRef.current = onClic;
  const ajustadoRef = useRef(false);

  // Clic en el mapa solo mientras se edita
  useEffect(() => {
    if (!mapa || !modoEdicion) return;
    mapa.closePopup();
    const handler = (e: L.LeafletMouseEvent) => onClicRef.current([Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))]);
    mapa.on("click", handler);
    mapa.getContainer().style.cursor = "crosshair";
    return () => {
      mapa.off("click", handler);
      mapa.getContainer().style.cursor = "";
    };
  }, [mapa, modoEdicion]);

  // Geocercas guardadas (la que se edita se dibuja aparte, con los valores del formulario)
  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    geocercas.filter((g) => g.activa && g.id !== editandoId).forEach((g) => {
      capaGeocerca(g, false, !modoEdicion)?.bindPopup(`<strong>${escapeHtml(g.nombre)}</strong><br/>${escapeHtml(g.sede)}<br/>${escapeHtml(g.descripcion)}`).addTo(grupo);
    });
    if (!ajustadoRef.current && geocercas.length) {
      ajustadoRef.current = true;
      const pts = geocercas.flatMap((g) => (g.centro ? [g.centro] : g.puntos));
      ajustarVista(mapa, pts);
    }
    return () => {
      grupo.remove();
    };
  }, [mapa, geocercas, editandoId, modoEdicion]);

  // Vista previa de lo que se está editando
  useEffect(() => {
    if (!mapa || !modoEdicion) return;
    const grupo = L.layerGroup().addTo(mapa);
    capaGeocerca(valores, true, false)?.addTo(grupo);
    const puntos = valores.tipo === "CIRCULO" ? (valores.centro ? [valores.centro] : []) : valores.puntos;
    puntos.forEach((p) => L.circleMarker(p, { radius: 4, color: "#fff", weight: 2, fillColor: colorSeguro(valores.color), fillOpacity: 1, interactive: false }).addTo(grupo));
    return () => {
      grupo.remove();
    };
  }, [mapa, modoEdicion, valores]);

  // Unidades con posición real
  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    unidades.forEach((u) => {
      const dentro = modoEdicion && u.dentroDeEdicion;
      L.circleMarker(u.posicion, { radius: 7, color: dentro ? "#fff" : "#0df5c6", weight: 2, fillColor: dentro ? "#0df5c6" : "#1e293b", fillOpacity: 1, interactive: !modoEdicion })
        .bindPopup(`<strong>${escapeHtml(u.identificador)}</strong>${modoEdicion ? `<br/>${dentro ? "Dentro de la geocerca" : "Fuera de la geocerca"}` : ""}`)
        .addTo(grupo);
    });
    return () => {
      grupo.remove();
    };
  }, [mapa, unidades, modoEdicion]);

  const ajustarTodo = () => {
    if (!mapa) return;
    ajustarVista(mapa, [...geocercas.flatMap((g) => (g.centro ? [g.centro] : g.puntos)), ...unidades.map((u) => u.posicion)]);
  };

  return (
    <div ref={wrapperRef} className={`relative h-full flex-1 flex-col overflow-hidden bg-[#050b14] lg:flex ${visible ? "flex" : "hidden"}`}>
      <MapaControles capa={capa} onCapa={setCapa} pantallaCompleta={pantallaCompleta} onPantallaCompleta={alternarPantallaCompleta} />
      <button type="button" onClick={ajustarTodo} title="Ver todas" className="absolute left-3 top-3 z-[1000] rounded-lg border border-white/15 bg-[#0d1422]/90 p-1.5 text-slate-300 hover:text-[#0df5c6]">
        <Layers className="h-4 w-4" />
      </button>
      {modoEdicion && (
        <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 rounded-md bg-[#0d1117]/90 px-3 py-1.5 text-[11px] text-slate-200 shadow-lg">
          {valores.tipo === "CIRCULO" ? "Clic para ubicar el centro" : "Clic para agregar vértices"}
        </div>
      )}
      <div ref={contenedorRef} className="h-full w-full" />
    </div>
  );
}
