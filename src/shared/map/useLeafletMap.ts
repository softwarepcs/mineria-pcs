import { useEffect, useState, type RefObject } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type CapaMapa = "mapa" | "satelite";

const CAPAS: Record<CapaMapa, { url: string; attribution: string }> = {
  mapa: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  satelite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
};

interface Opciones {
  /** Vista inicial mientras no hay datos; los componentes hacen fitBounds a sus datos. */
  centro?: [number, number];
  zoom?: number;
  posicionZoom?: L.ControlPosition;
}

/**
 * Crea un mapa Leaflet en el contenedor y lo destruye al desmontar.
 * Devuelve el mapa como estado (no como ref) para que los efectos que dibujan
 * se vuelvan a ejecutar cuando el mapa ya existe.
 */
export function useLeafletMap(contenedorRef: RefObject<HTMLDivElement | null>, opciones: Opciones = {}) {
  const [mapa, setMapa] = useState<L.Map | null>(null);
  const [capa, setCapa] = useState<CapaMapa>("mapa");
  const { centro = [-15, -65], zoom = 3, posicionZoom = "bottomright" } = opciones;

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const m = L.map(contenedor, { zoomControl: false }).setView(centro, zoom);
    L.control.zoom({ position: posicionZoom }).addTo(m);

    // Leaflet calcula mal el tamaño si el contenedor cambia (pestañas, pantalla completa)
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(contenedor);
    const timer = window.setTimeout(() => m.invalidateSize(), 150);

    setMapa(m);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      m.remove();
      setMapa(null);
    };
    // Solo al montar: centro y zoom son la vista inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenedorRef]);

  useEffect(() => {
    if (!mapa) return;
    const { url, attribution } = CAPAS[capa];
    const tile = L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(mapa);
    return () => {
      tile.remove();
    };
  }, [mapa, capa]);

  return { mapa, capa, setCapa };
}

/** Ajusta la vista a los puntos (o no hace nada si no hay ninguno). */
export function ajustarVista(mapa: L.Map, puntos: [number, number][], zoomMax = 15) {
  if (puntos.length === 0) return;
  if (puntos.length === 1) mapa.setView(puntos[0], Math.min(zoomMax, 13));
  else mapa.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: zoomMax });
}
