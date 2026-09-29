import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// XSS Mitigation
export function escapeHtml(unsafe: string | null | undefined | number): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface UseLeafletMapOptions {
  center?: [number, number];
  zoom?: number;
}

export function useLeafletMap(containerRef: RefObject<HTMLDivElement | null>, options: UseLeafletMapOptions = {}) {
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [capaMapa, setCapaMapa] = useState<"mapa" | "satelite">("mapa");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Center defaults to Vaca Muerta
  const defaultCenter: [number, number] = [-38.9516, -68.0591];
  const center = options.center || defaultCenter;
  const zoom = options.zoom || 10;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
    });
    
    map.setView(center, zoom);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tile;
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Small delay to ensure correct tile rendering on initial layout mount
    setTimeout(() => {
      map.invalidateSize();
      setMapLoaded(true);
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);

    const url =
      capaMapa === "satelite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attr =
      capaMapa === "satelite"
        ? "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        : "&copy; OpenStreetMap contributors";

    const newTile = L.tileLayer(url, { attribution: attr, maxZoom: 19 }).addTo(mapRef.current);
    tileLayerRef.current = newTile;
  }, [capaMapa]);

  return {
    map: mapRef.current,
    markersGroup: markersGroupRef.current,
    capaMapa,
    setCapaMapa,
    mapLoaded,
  };
}
