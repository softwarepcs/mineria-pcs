import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Camion } from "../../types";

function truckIcon(estado: Camion["estado"], selected: boolean) {
  const color = estado === "revisar" ? "#f59e0b" : "#22c55e";
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
  camiones,
  selectedId,
  onSelect,
}: {
  camiones: Camion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([-12.0, -77.125], 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    camiones.forEach((c) => {
      const marker = L.marker([c.lat, c.lng], { icon: truckIcon(c.estado, c.id === selectedId) })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:13px;"><strong>${c.placa}</strong><br/>${c.l100km.toFixed(1)} L/100km · ${
            c.estado === "revisar" ? "Revisar" : "En línea"
          }</div>`
        )
        .on("click", () => onSelect(c.id));
      markersRef.current[c.id] = marker;
    });
  }, [camiones, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!selectedId) {
      map.flyTo([-12.0, -77.125], 13, { duration: 0.8 });
      map.closePopup();
      return;
    }
    const camion = camiones.find((c) => c.id === selectedId);
    if (!camion) return;
    map.flyTo([camion.lat, camion.lng], 16, { duration: 0.8 });
    markersRef.current[selectedId]?.openPopup();
  }, [selectedId, camiones]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div ref={containerRef} className="h-[420px] w-full" />
    </div>
  );
}