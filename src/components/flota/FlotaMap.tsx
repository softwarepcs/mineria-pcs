import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Maquinaria } from "../../types";

function truckIcon(estado: Maquinaria["estado"], selected: boolean) {
  let color = "#64748b";
  if (estado === "conduccion") color = "#22c55e";
  else if (estado === "ralenti") color = "#f59e0b";
  
  const size = selected ? 40 : 32;
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

export function FlotaMap({
  maquinarias,
  selectedId,
  onSelect,
}: {
  maquinarias: Maquinaria[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [capaMapa, setCapaMapa] = useState<"mapa" | "satelite">("mapa");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error al intentar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
    });
    
    // Default zoom to Argentina (Vaca Muerta)
    map.setView([-38.9516, -68.0591], 10);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    tileLayerRef.current = tile;
    mapRef.current = map;

    // Small delay to ensure correct tile rendering on initial layout mount
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ResizeObserver for fluid responsiveness on window resize, sidebar toggle or device rotation
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Cambiar capa entre Mapa y Satélite
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);

    const url =
      capaMapa === "satelite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attr =
      capaMapa === "satelite"
        ? "&copy; Esri &mdash; Source: Esri"
        : "&copy; OpenStreetMap contributors";

    const newTile = L.tileLayer(url, { attribution: attr, maxZoom: 19 }).addTo(mapRef.current);
    tileLayerRef.current = newTile;
  }, [capaMapa]);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    maquinarias.forEach((c) => {
      const estadoLabel = c.estado === "conduccion" ? "Conducción" : c.estado === "ralenti" ? "Ralentí" : "Offline";
      const marker = L.marker([c.lat, c.lng], { icon: truckIcon(c.estado, c.id === selectedId) })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:13px;"><strong>${c.placa}</strong><br/>${c.l100km.toFixed(1)} L/100km - ${estadoLabel}</div>`
        )
        .on("click", () => onSelect(c.id));
      markersRef.current[c.id] = marker;
    });

    // Auto-fit bounds if we have trucks
    if (maquinarias.length > 0 && !selectedId) {
      const bounds = L.latLngBounds(maquinarias.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [maquinarias, selectedId, onSelect]);

  // Handle selectedId zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!selectedId) {
      if (maquinarias.length > 0) {
        const bounds = L.latLngBounds(maquinarias.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50], duration: 0.8 });
      }
      map.closePopup();
      return;
    }
    const maq = maquinarias.find((c) => c.id === selectedId);
    if (!maq) return;
    map.flyTo([maq.lat, maq.lng], 16, { duration: 0.8 });
    markersRef.current[selectedId]?.openPopup();
  }, [selectedId, maquinarias]);

  return (
    <div
      ref={wrapperRef}
      className={`mp-map-wrapper !mb-0 w-full rounded-xl overflow-hidden relative border border-white/[0.06] bg-[#161b22] ${
        isFullscreen ? "mp-map-wrapper-fullscreen" : "h-[320px] sm:h-[380px] lg:h-[450px]"
      }`}
    >
      {/* Layer toggle */}
      <div className="mp-map-layer-toggle !left-2.5 !top-2.5 sm:!left-3.5 sm:!top-3.5">
        <button
          type="button"
          onClick={() => setCapaMapa("mapa")}
          className={`mp-map-layer-btn !px-2.5 !py-1 sm:!px-3.5 sm:!py-1.5 text-xs ${
            capaMapa === "mapa" ? "mp-map-layer-btn-active" : ""
          }`}
        >
          Mapa
        </button>
        <button
          type="button"
          onClick={() => setCapaMapa("satelite")}
          className={`mp-map-layer-btn !px-2.5 !py-1 sm:!px-3.5 sm:!py-1.5 text-xs ${
            capaMapa === "satelite" ? "mp-map-layer-btn-active" : ""
          }`}
        >
          Satélite
        </button>
      </div>

      {/* Fullscreen button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="mp-map-fullscreen-btn !right-2.5 !top-2.5 sm:!right-3.5 sm:!top-3.5"
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M15 9V4.5M15 9h4.5M9 15v4.5M9 15H4.5M15 15v4.5M15 15h4.5" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>

      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}