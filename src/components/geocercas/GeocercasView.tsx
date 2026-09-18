import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  Plus,
  ArrowDownAZ,
  Wrench,
  Eye,
  EyeOff,
  Trash2,
  Circle,
  Pentagon,
  Spline,
  MapPin,
  Camera,
  LandPlot,
  Building,
  Warehouse,
  Flag,
  Shield,
  Radio,
  Target,
  Construction,
  Fuel,
  Maximize2,
  Minimize2,
  Layers,
  Crosshair,
  AlertTriangle,
  Truck,
  Check,
} from "lucide-react";
import type { Geocerca, GeocercaTipo } from "../../types/geocerca";
import type { Empresa, Maquinaria } from "../../types";
import {
  getStoredGeocercas,
  saveStoredGeocercas,
  calcularAreaHa,
  calcularPerimetroKm,
} from "../../data/geocercasData";
import { IconPickerModal } from "./IconPickerModal";

// Helper to render icon by name
function renderGeocercaIcon(iconName: string, className = "h-4 w-4") {
  switch (iconName) {
    case "camera":
      return <Camera className={className} />;
    case "stadium":
      return <LandPlot className={className} />;
    case "building":
      return <Building className={className} />;
    case "warehouse":
      return <Warehouse className={className} />;
    case "flag":
      return <Flag className={className} />;
    case "shield":
      return <Shield className={className} />;
    case "radar":
      return <Radio className={className} />;
    case "target":
      return <Target className={className} />;
    case "construction":
      return <Construction className={className} />;
    case "fuel":
      return <Fuel className={className} />;
    case "pin":
    default:
      return <MapPin className={className} />;
  }
}

// Distance helper to check if truck is in geofence
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function GeocercasView({ empresa }: { empresa?: Empresa | null }) {
  // Tabs: "geocercas" | "grupos"
  const [activeTab, setActiveTab] = useState<"geocercas" | "grupos">("geocercas");

  // Geocercas state
  const [geocercas, setGeocercas] = useState<Geocerca[]>(() => getStoredGeocercas());
  const [editingId, setEditingId] = useState<string | null>("geo-1"); // Start by previewing Avenida Central

  // Form Fields
  const [nombre, setNombre] = useState("Avenida Central España");
  const [nombreColor, setNombreColor] = useState("#f97316");
  const [fontSize, setFontSize] = useState("12 px");
  const [recurso, setRecurso] = useState(empresa?.nombre || "rigel_teste_mgr");
  const [descripcion, setDescripcion] = useState(
    "Avenida Central España, Panamá, Panama"
  );
  const [grupo, setGrupo] = useState("Ninguno");
  const [tipo, setTipo] = useState<GeocercaTipo>("circle");
  const [lat, setLat] = useState<number | string>(8.992859);
  const [lng, setLng] = useState<number | string>(-79.554388);
  const [radio, setRadio] = useState<number | string>(3475.78);
  const [icono, setIcono] = useState("pin");
  const [color, setColor] = useState("#00c4cc");
  const [colorVisible, setColorVisible] = useState(true);
  const [visibilidadDe, setVisibilidadDe] = useState(1);
  const [visibilidadA, setVisibilidadA] = useState(19);

  // Polygon/Line points
  const [puntos, setPuntos] = useState<[number, number][]>([]);

  // Search & Filters for List
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterTipo, setFilterTipo] = useState<"todos" | "circle" | "polygon" | "line">("todos");

  // Icon Picker Modal
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  // Map state
  const [capaMapa, setCapaMapa] = useState<"mapa" | "satelite">("mapa");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // References for Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Leaflet Layers
  const geocercasLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const previewLayerRef = useRef<L.Layer | null>(null);
  const trucksLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Available vehicles/machinery
  const maquinarias: Maquinaria[] = useMemo(() => {
    if (empresa?.flota?.maquinarias) {
      return empresa.flota.maquinarias;
    }
    // Default demo trucks in Panama area to match sample map coordinates
    return [
      {
        id: "TC-01",
        placa: "TC-PAN-01",
        km: 12400,
        litros: 4200,
        l100km: 39.5,
        desvioPct: 2.1,
        ralentiPct: 14,
        horas: 450,
        pctGasto: 18,
        co2Ton: 11.2,
        estado: "conduccion",
        lat: 8.988,
        lng: -79.522,
      },
      {
        id: "TC-02",
        placa: "TC-PAN-02",
        km: 15200,
        litros: 5100,
        l100km: 41.2,
        desvioPct: 3.5,
        ralentiPct: 19,
        horas: 580,
        pctGasto: 21,
        co2Ton: 13.5,
        estado: "ralenti",
        lat: 8.955,
        lng: -79.551,
      },
      {
        id: "TC-03",
        placa: "TC-PAN-03",
        km: 9800,
        litros: 3400,
        l100km: 38.0,
        desvioPct: -1.2,
        ralentiPct: 11,
        horas: 320,
        pctGasto: 15,
        co2Ton: 9.1,
        estado: "conduccion",
        lat: 9.015,
        lng: -79.535,
      },
    ];
  }, [empresa]);

  // Real-time calculated Area and Perimeter
  const numRadio = typeof radio === "number" ? radio : parseFloat(radio) || 0;
  const numLat = typeof lat === "number" ? lat : parseFloat(lat) || 0;
  const numLng = typeof lng === "number" ? lng : parseFloat(lng) || 0;

  const areaHaCalculada = useMemo(() => {
    if (tipo === "circle") {
      return calcularAreaHa(numRadio);
    }
    if (puntos.length >= 3) {
      // Approximate polygon area
      return Number(((puntos.length * Math.PI * 50000) / 10000).toFixed(3));
    }
    return 0;
  }, [tipo, numRadio, puntos]);

  const perimetroKmCalculado = useMemo(() => {
    if (tipo === "circle") {
      return calcularPerimetroKm(numRadio);
    }
    if (puntos.length >= 2) {
      return Number((puntos.length * 1.5).toFixed(3));
    }
    return 0;
  }, [tipo, numRadio, puntos]);

  // Persist geocercas
  const updateGeocercasAndSave = (newList: Geocerca[]) => {
    setGeocercas(newList);
    saveStoredGeocercas(newList);
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapWrapperRef.current?.requestFullscreen().catch((err) => {
        console.error("Error al activar pantalla completa:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    });

    // Default view centered around Panama coordinates matching screenshots
    map.setView([8.992859, -79.554388], 12);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tile;

    // Layer groups for geofences and trucks
    const geocercasGroup = L.layerGroup().addTo(map);
    geocercasLayerGroupRef.current = geocercasGroup;

    const trucksGroup = L.layerGroup().addTo(map);
    trucksLayerGroupRef.current = trucksGroup;

    // Map click handler to pick coordinates dynamically!
    map.on("click", (e: L.LeafletMouseEvent) => {
      const clickedLat = Number(e.latlng.lat.toFixed(6));
      const clickedLng = Number(e.latlng.lng.toFixed(6));
      setLat(clickedLat);
      setLng(clickedLng);

      // If in polygon or line mode, add point
      setPuntos((prev) => [...prev, [clickedLat, clickedLng]]);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Layer Toggle (Street / Satellite)
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

  // Render Saved Geocercas on Map
  const renderSavedGeocercas = useCallback(() => {
    const map = mapRef.current;
    const group = geocercasLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    geocercas.forEach((geo) => {
      // Don't render if disabled or if it's the one currently being edited (since preview handles it)
      if (!geo.activa) return;
      if (editingId === geo.id) return;

      if (geo.tipo === "circle") {
        const circle = L.circle([geo.lat, geo.lng], {
          radius: geo.radio,
          color: geo.color,
          weight: 2,
          fillColor: geo.color,
          fillOpacity: 0.25,
        });

        circle.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 2px;">
            <div style="font-weight: bold; color: ${geo.color}; font-size: 13px; margin-bottom: 3px;">
              ${geo.nombre}
            </div>
            <div><strong>Radio:</strong> ${geo.radio} m</div>
            <div><strong>Área:</strong> ${geo.areaHa} ha</div>
            <div><strong>Perímetro:</strong> ${geo.perimetroKm} km</div>
            <div style="margin-top: 4px; color: #64748b; font-size: 11px;">${geo.descripcion}</div>
          </div>
        `);

        group.addLayer(circle);

        // Center marker icon
        const centerIcon = L.divIcon({
          className: "",
          html: `<div style="background:${geo.color};width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        group.addLayer(L.marker([geo.lat, geo.lng], { icon: centerIcon }));
      } else if (geo.tipo === "polygon" && geo.puntos && geo.puntos.length >= 3) {
        const poly = L.polygon(geo.puntos, {
          color: geo.color,
          weight: 2,
          fillColor: geo.color,
          fillOpacity: 0.25,
        });
        poly.bindPopup(`<strong>${geo.nombre}</strong><br/>${geo.descripcion}`);
        group.addLayer(poly);
      } else if (geo.tipo === "line" && geo.puntos && geo.puntos.length >= 2) {
        const polyline = L.polyline(geo.puntos, {
          color: geo.color,
          weight: 4,
          dashArray: "6, 8",
        });
        group.addLayer(polyline);
      }
    });
  }, [geocercas, editingId]);

  useEffect(() => {
    renderSavedGeocercas();
  }, [renderSavedGeocercas]);

  // LIVE DYNAMIC PREVIEW: "al momento de digitar se cree la geocerca"
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous preview layer if any
    if (previewLayerRef.current) {
      map.removeLayer(previewLayerRef.current);
      previewLayerRef.current = null;
    }

    // If coordinates are valid
    if (!isNaN(numLat) && !isNaN(numLng) && numLat !== 0 && numLng !== 0) {
      if (tipo === "circle" && numRadio > 0) {
        const activeColor = colorVisible ? color : "#94a3b8";

        const previewCircle = L.circle([numLat, numLng], {
          radius: numRadio,
          color: activeColor,
          weight: 2.5,
          opacity: 0.95,
          fillColor: activeColor,
          fillOpacity: 0.38,
        });

        previewCircle.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 2px;">
            <div style="font-weight: bold; color: ${activeColor}; font-size: 13px; margin-bottom: 3px;">
              ${nombre || "Nueva geocerca"}
            </div>
            <div><strong>Radio:</strong> ${numRadio} m</div>
            <div><strong>Área:</strong> ${areaHaCalculada} ha</div>
            <div><strong>Perímetro:</strong> ${perimetroKmCalculado} km</div>
            <div style="margin-top: 4px; color: #64748b; font-size: 11px;">${descripcion}</div>
          </div>
        `);

        previewCircle.addTo(map);
        previewLayerRef.current = previewCircle;
      } else if (tipo === "polygon" && puntos.length >= 3) {
        const activeColor = colorVisible ? color : "#94a3b8";
        const poly = L.polygon(puntos, {
          color: activeColor,
          weight: 2.5,
          fillColor: activeColor,
          fillOpacity: 0.38,
        }).addTo(map);
        previewLayerRef.current = poly;
      } else if (tipo === "line" && puntos.length >= 2) {
        const activeColor = colorVisible ? color : "#94a3b8";
        const line = L.polyline(puntos, {
          color: activeColor,
          weight: 4,
        }).addTo(map);
        previewLayerRef.current = line;
      }
    }
  }, [numLat, numLng, numRadio, color, colorVisible, tipo, puntos, nombre, descripcion, areaHaCalculada, perimetroKmCalculado]);

  // Render Vehicles / Trucks on Map and detect if they are inside
  useEffect(() => {
    const map = mapRef.current;
    const group = trucksLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    maquinarias.forEach((truck) => {
      const isInsideActiveGeo =
        !isNaN(numLat) &&
        !isNaN(numLng) &&
        numRadio > 0 &&
        getDistanceMeters(numLat, numLng, truck.lat, truck.lng) <= numRadio;

      const truckIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 32px; height: 32px; border-radius: 50%;
            background: ${isInsideActiveGeo ? "#0df5c6" : "#1e293b"};
            border: 2px solid ${isInsideActiveGeo ? "#fff" : "#0df5c6"};
            box-shadow: 0 0 10px ${isInsideActiveGeo ? "rgba(13,245,198,0.8)" : "rgba(0,0,0,0.5)"};
            display: flex; align-items: center; justify-content: center; color: ${isInsideActiveGeo ? "#0b1220" : "#0df5c6"};
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 3h13v13H1z"/><path d="M14 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([truck.lat, truck.lng], { icon: truckIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
          <strong>Unidad: ${truck.placa}</strong><br/>
          Estado: ${truck.estado}<br/>
          ${isInsideActiveGeo ? '<span style="color: #059669; font-weight: bold;">✔ Dentro de geocerca</span>' : '<span style="color: #64748b;">Fuera de geocerca</span>'}
        </div>
      `);
      group.addLayer(marker);
    });
  }, [maquinarias, numLat, numLng, numRadio]);

  // Center on current geocerca
  const handleFlyToCurrent = () => {
    if (mapRef.current && !isNaN(numLat) && !isNaN(numLng) && numLat !== 0) {
      mapRef.current.flyTo([numLat, numLng], 13, { duration: 0.8 });
    }
  };

  // Fit all geocercas
  const handleFitAll = () => {
    if (!mapRef.current) return;
    const points: [number, number][] = geocercas
      .filter((g) => g.activa)
      .map((g) => [g.lat, g.lng]);

    if (!isNaN(numLat) && !isNaN(numLng) && numLat !== 0) {
      points.push([numLat, numLng]);
    }

    if (points.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(points), { padding: [60, 60] });
    }
  };

  // Reset form to blank / clean
  const handleLimpiar = () => {
    setNombre("");
    setDescripcion("");
    setRadio(1000);
    setTipo("circle");
    setPuntos([]);
  };

  // Cancel edit
  const handleCancelar = () => {
    setEditingId(null);
    handleLimpiar();
  };

  // Load a geocerca into the form for editing / preview
  const handleSelectGeocerca = (geo: Geocerca) => {
    setEditingId(geo.id);
    setNombre(geo.nombre);
    setNombreColor(geo.nombreColor || "#f97316");
    setFontSize(geo.fontSize || "12 px");
    setRecurso(geo.recurso || "rigel_teste_mgr");
    setDescripcion(geo.descripcion);
    setGrupo(geo.grupo || "Ninguno");
    setTipo(geo.tipo);
    setLat(geo.lat);
    setLng(geo.lng);
    setRadio(geo.radio);
    setIcono(geo.icono || "pin");
    setColor(geo.color || "#00c4cc");
    setColorVisible(geo.colorVisible ?? true);
    setVisibilidadDe(geo.visibilidadDe || 1);
    setVisibilidadA(geo.visibilidadA || 19);
    setPuntos(geo.puntos || []);

    // Fly map to selected geocerca
    if (mapRef.current && geo.lat && geo.lng) {
      mapRef.current.flyTo([geo.lat, geo.lng], 13, { duration: 0.8 });
    }
  };

  // Toggle visibility of an existing geocerca
  const handleToggleActiva = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = geocercas.map((g) =>
      g.id === id ? { ...g, activa: !g.activa } : g
    );
    updateGeocercasAndSave(updated);
  };

  // Delete geocerca
  const handleDeleteGeocerca = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de eliminar esta geocerca?")) {
      const updated = geocercas.filter((g) => g.id !== id);
      updateGeocercasAndSave(updated);
      if (editingId === id) {
        handleCancelar();
      }
    }
  };

  // Save Geocerca (create or update)
  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("Por favor ingresa un nombre para la geocerca.");
      return;
    }

    const payload: Geocerca = {
      id: editingId || `geo-${Date.now()}`,
      nombre: nombre.trim(),
      nombreColor,
      fontSize,
      recurso,
      descripcion: descripcion.trim(),
      grupo,
      tipo,
      lat: Number(numLat.toFixed(6)),
      lng: Number(numLng.toFixed(6)),
      radio: Number(numRadio),
      areaHa: areaHaCalculada,
      perimetroKm: perimetroKmCalculado,
      puntos: puntos.length > 0 ? puntos : undefined,
      icono,
      color,
      colorVisible,
      visibilidadDe,
      visibilidadA,
      activa: true,
      empresaId: empresa?.id ?? null,
    };

    let updated: Geocerca[];
    if (editingId && geocercas.some((g) => g.id === editingId)) {
      updated = geocercas.map((g) => (g.id === editingId ? payload : g));
    } else {
      updated = [payload, ...geocercas];
      setEditingId(payload.id);
    }

    updateGeocercasAndSave(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Count vehicles inside a given geofence
  const getVehiclesInsideCount = (geo: Geocerca) => {
    if (geo.tipo !== "circle" || !geo.radio) return 0;
    return maquinarias.filter(
      (t) => getDistanceMeters(geo.lat, geo.lng, t.lat, t.lng) <= geo.radio
    ).length;
  };

  // Filtered & sorted list
  const geocercasFiltradas = useMemo(() => {
    let list = [...geocercas];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      list = list.filter(
        (g) =>
          g.nombre.toLowerCase().includes(query) ||
          g.descripcion.toLowerCase().includes(query) ||
          g.grupo.toLowerCase().includes(query)
      );
    }

    if (filterTipo !== "todos") {
      list = list.filter((g) => g.tipo === filterTipo);
    }

    list.sort((a, b) => {
      const cmp = a.nombre.localeCompare(b.nombre);
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [geocercas, searchTerm, filterTipo, sortAsc]);

  const tienePuntosFaltantes = (tipo === "polygon" && puntos.length < 3) || (tipo === "line" && puntos.length < 2);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl">
      {/* Top Main Navigation Bar */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/10 bg-[#161b22] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Gestión de Geocercas
              {empresa && (
                <span className="text-[11px] font-normal text-slate-400">
                  — {empresa.nombre}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">
              Creación y delimitación perimetral en tiempo real
            </p>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fade-in">
            <Check className="h-3.5 w-3.5" />
            ¡Geocerca guardada correctamente!
          </div>
        )}
      </div>

      {/* Main Content Area: Left Panel + Right Map */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* ─── LEFT PANEL ─── */}
        <div className="w-[390px] shrink-0 border-r border-white/10 bg-[#0d1117] flex flex-col h-full overflow-hidden">
          {/* Top Tabs: Geocercas | Grupos */}
          <div className="shrink-0 flex border-b border-white/10 bg-[#161b22]/70">
            <button
              type="button"
              onClick={() => setActiveTab("geocercas")}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition ${
                activeTab === "geocercas"
                  ? "border-cyan-400 text-cyan-300 bg-white/[0.03]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Geocercas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("grupos")}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition ${
                activeTab === "grupos"
                  ? "border-cyan-400 text-cyan-300 bg-white/[0.03]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Grupos
            </button>
          </div>

          {/* TAB CONTENT: GRUPOS (EMPTY STATE AS REQUESTED) */}
          {activeTab === "grupos" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0d1117]">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-3 border border-white/10">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">
                Grupos de Geocercas
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-[240px]">
                De momento no hay grupos registrados. Esta sección se mantendrá vacía para futuras agrupaciones operativas.
              </p>
            </div>
          )}

          {/* TAB CONTENT: GEOCERCAS */}
          {activeTab === "geocercas" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto sidebar-scroll">
              {/* Form: Propiedades de la geocerca */}
              <form onSubmit={handleGuardar} className="p-3 border-b border-white/10 space-y-3 bg-[#0d1117]">
                {/* Form Title Banner */}
                <div className="rounded-md bg-[#21262d] px-3 py-1.5 text-xs font-medium text-slate-200 border border-white/5 flex items-center justify-between">
                  <span>Propiedades de la geocerca</span>
                  {editingId && (
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Editando
                    </span>
                  )}
                </div>

                {/* Nombre* + Color Swatch + Font Size */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 w-16 shrink-0">
                    Nombre: <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nueva geocerca"
                    className="flex-1 min-w-0 rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                  />
                  {/* Color Swatch */}
                  <input
                    type="color"
                    value={nombreColor}
                    onChange={(e) => setNombreColor(e.target.value)}
                    title="Color del nombre"
                    className="h-6 w-6 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                  />
                  {/* Font Size Dropdown */}
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="rounded border border-white/15 bg-[#161b22] px-1.5 py-1 text-xs text-slate-300 outline-none focus:border-cyan-400"
                  >
                    <option value="10 px">10 px</option>
                    <option value="12 px">12 px</option>
                    <option value="14 px">14 px</option>
                    <option value="16 px">16 px</option>
                  </select>
                </div>

                {/* Recurso */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 w-16 shrink-0">
                    Recurso:
                  </label>
                  <select
                    value={recurso}
                    onChange={(e) => setRecurso(e.target.value)}
                    className="flex-1 rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    {empresa?.nombre && (
                      <option value={empresa.nombre}>{empresa.nombre}</option>
                    )}
                    <option value="rigel_teste_mgr">rigel_teste_mgr</option>
                    <option value="flota_principal">Flota Principal</option>
                    <option value="operaciones_mina">Operaciones Mina</option>
                  </select>
                </div>

                {/* Descripción */}
                <div className="flex items-start gap-2">
                  <label className="text-xs text-slate-300 w-16 shrink-0 pt-1">
                    Descripción:
                  </label>
                  <textarea
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción de la ubicación o perímetro"
                    className="flex-1 rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                {/* Grupo */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 w-16 shrink-0">
                    Grupo:
                  </label>
                  <select
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                    className="flex-1 rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Ninguno">Ninguno</option>
                    <option value="Zonas Operativas">Zonas Operativas</option>
                    <option value="Puntos de Carga">Puntos de Carga</option>
                    <option value="Rutas Mineras">Rutas Mineras</option>
                  </select>
                </div>

                {/* Tipo: Circle | Polygon | Line */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 w-16 shrink-0">
                    Tipo:
                  </label>
                  <div className="flex items-center rounded border border-white/15 bg-[#161b22] p-0.5">
                    <button
                      type="button"
                      title="Círculo"
                      onClick={() => setTipo("circle")}
                      className={`flex h-6 w-8 items-center justify-center rounded transition ${
                        tipo === "circle"
                          ? "bg-[#6366f1] text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Circle className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      title="Polígono"
                      onClick={() => setTipo("polygon")}
                      className={`flex h-6 w-8 items-center justify-center rounded transition ${
                        tipo === "polygon"
                          ? "bg-[#6366f1] text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Pentagon className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      title="Línea / Ruta"
                      onClick={() => setTipo("line")}
                      className={`flex h-6 w-8 items-center justify-center rounded transition ${
                        tipo === "line"
                          ? "bg-[#6366f1] text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Spline className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Coordenadas (Latitud & Longitud) */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 w-16 shrink-0">
                    Coordenadas:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="Latitud"
                      title="Latitud"
                      className="rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400"
                    />
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="Longitud"
                      title="Longitud"
                      className="rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Radio* (m) */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 w-16 shrink-0">
                    Radio: <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center flex-1 gap-1">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      required
                      value={radio}
                      onChange={(e) => setRadio(e.target.value)}
                      className="flex-1 rounded border border-white/15 bg-[#161b22] px-2 py-1 text-xs font-mono text-white outline-none focus:border-cyan-400"
                    />
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">
                      m
                    </span>
                  </div>
                </div>

                {/* Área (Calculada en tiempo real) */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 w-16 shrink-0">Área:</span>
                  <span className="font-mono text-slate-200">
                    {areaHaCalculada} ha
                  </span>
                </div>

                {/* Perímetro (Calculado en tiempo real) */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 w-16 shrink-0">Perímetro:</span>
                  <span className="font-mono text-slate-200">
                    {perimetroKmCalculado} km, ({Math.round(perimetroKmCalculado * 1000)} m)
                  </span>
                </div>

                {/* Icono + Biblioteca de iconos */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 w-16 shrink-0">
                    Icono:
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-white/15 bg-[#161b22] text-cyan-400">
                      {renderGeocercaIcon(icono, "h-5 w-5")}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsIconModalOpen(true)}
                      className="rounded border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
                    >
                      Biblioteca de iconos
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 w-16 shrink-0">
                    Color:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={colorVisible}
                      onChange={(e) => setColorVisible(e.target.checked)}
                      className="rounded accent-cyan-500 h-4 w-4 cursor-pointer"
                    />
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-6 w-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-400">
                      {color}
                    </span>
                  </div>
                </div>

                {/* Visibilidad: de: [ 1 ] a: [ 19 ] */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 w-16 shrink-0">
                    Visibilidad:
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>de:</span>
                    <input
                      type="number"
                      min="1"
                      max="19"
                      value={visibilidadDe}
                      onChange={(e) => setVisibilidadDe(Number(e.target.value))}
                      className="w-12 rounded border border-white/15 bg-[#161b22] px-1.5 py-0.5 text-xs text-center text-white outline-none"
                    />
                    <span>a:</span>
                    <input
                      type="number"
                      min="1"
                      max="19"
                      value={visibilidadA}
                      onChange={(e) => setVisibilidadA(Number(e.target.value))}
                      className="w-12 rounded border border-white/15 bg-[#161b22] px-1.5 py-0.5 text-xs text-center text-white outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons: Cancelar | Limpiar | Guardar */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCancelar}
                    className="rounded border border-white/10 bg-transparent px-3 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleLimpiar}
                    className="rounded border border-white/10 bg-transparent px-3 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1 text-xs font-medium text-white shadow transition"
                  >
                    Guardar
                  </button>
                </div>
              </form>

              {/* Bottom Section: Toolbar + Geocercas List */}
              <div className="flex flex-col flex-1 min-h-0 bg-[#0d1117]">
                {/* Search & Action Toolbar */}
                <div className="p-2 border-b border-white/10 flex items-center gap-1.5 bg-[#161b22]/50">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      handleLimpiar();
                    }}
                    className="flex items-center gap-1 rounded bg-white/10 hover:bg-white/15 px-2 py-1 text-[11px] font-medium text-white transition"
                  >
                    <Plus className="h-3 w-3" />
                    Crear
                  </button>

                  <button
                    type="button"
                    onClick={() => setSortAsc(!sortAsc)}
                    title="Ordenar alfabéticamente"
                    className="p-1 rounded border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    <ArrowDownAZ className="h-3.5 w-3.5" />
                  </button>

                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value as any)}
                    className="rounded border border-white/15 bg-[#161b22] px-1.5 py-1 text-[11px] text-slate-300 outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="circle">Círculos</option>
                    <option value="polygon">Polígonos</option>
                    <option value="line">Líneas</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar"
                      className="w-full rounded border border-white/15 bg-[#161b22] pl-6 pr-5 py-1 text-[11px] text-white placeholder-slate-500 outline-none"
                    />
                    <Search className="h-3 w-3 text-slate-500 absolute left-1.5 top-2" />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="text-slate-400 hover:text-white absolute right-1.5 top-1.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto sidebar-scroll divide-y divide-white/5">
                  {geocercasFiltradas.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No se encontraron geocercas coincidentes.
                    </div>
                  ) : (
                    geocercasFiltradas.map((item) => {
                      const countInside = getVehiclesInsideCount(item);
                      const isSelected = editingId === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectGeocerca(item)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer transition ${
                            isSelected
                              ? "bg-cyan-500/10 border-l-2 border-cyan-400"
                              : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="shrink-0 p-1 rounded"
                              style={{ color: item.color }}
                            >
                              {renderGeocercaIcon(item.icono, "h-4 w-4")}
                            </span>
                            <div className="min-w-0">
                              <span
                                className="block text-xs font-medium truncate"
                                style={{
                                  color: item.nombreColor || "#e2e8f0",
                                  fontSize: item.fontSize || "12px",
                                }}
                              >
                                {item.nombre}
                              </span>
                              <span className="block text-[10px] text-slate-500 truncate">
                                {item.tipo} • {item.radio}m
                              </span>
                            </div>
                          </div>

                          {/* Action icons right: Truck count | Edit | Eye | Delete */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Trucks Count */}
                            <span
                              title={`${countInside} vehículos dentro`}
                              className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                countInside > 0
                                  ? "bg-cyan-500/20 text-cyan-300 font-bold"
                                  : "text-slate-500"
                              }`}
                            >
                              <Truck className="h-3 w-3" />
                              {countInside}
                            </span>

                            {/* Edit / Wrench */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectGeocerca(item);
                              }}
                              title="Editar geocerca"
                              className="p-1 text-slate-400 hover:text-cyan-400 transition"
                            >
                              <Wrench className="h-3.5 w-3.5" />
                            </button>

                            {/* Eye / Visibility */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleActiva(item.id, e)}
                              title={item.activa ? "Ocultar del mapa" : "Mostrar en mapa"}
                              className={`p-1 transition ${
                                item.activa
                                  ? "text-cyan-400 hover:text-cyan-300"
                                  : "text-slate-600 hover:text-slate-400"
                              }`}
                            >
                              {item.activa ? (
                                <Eye className="h-3.5 w-3.5" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteGeocerca(item.id, e)}
                              title="Eliminar geocerca"
                              className="p-1 text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT MAP PANEL ─── */}
        <div
          ref={mapWrapperRef}
          className={`flex-1 relative h-full bg-[#050b14] overflow-hidden ${
            isFullscreen ? "fixed inset-0 z-[99999]" : ""
          }`}
        >
          {/* Map Layer Controls Floating Top Left */}
          <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 bg-[#0d1117]/90 p-1.5 rounded-lg border border-white/10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCapaMapa("mapa")}
                className={`px-2.5 py-1 text-xs rounded transition font-medium ${
                  capaMapa === "mapa"
                    ? "bg-cyan-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Mapa
              </button>
              <button
                type="button"
                onClick={() => setCapaMapa("satelite")}
                className={`px-2.5 py-1 text-xs rounded transition font-medium ${
                  capaMapa === "satelite"
                    ? "bg-cyan-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Satélite
              </button>
            </div>

            <div className="h-[1px] bg-white/10 w-full" />

            <div className="flex items-center justify-around gap-1">
              <button
                type="button"
                onClick={handleFlyToCurrent}
                title="Centrar en geocerca actual"
                className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-cyan-400 transition"
              >
                <Crosshair className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleFitAll}
                title="Ajustar todas las geocercas"
                className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-cyan-400 transition"
              >
                <Layers className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-cyan-400 transition"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Floating Instructions Banner */}
          <div className="absolute top-3 right-3 z-[1000] hidden sm:flex items-center gap-2 bg-[#0d1117]/85 border border-white/10 px-3 py-1.5 rounded-lg shadow-lg text-[11px] text-slate-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Haz clic en el mapa para posicionar las coordenadas automáticamente
          </div>

          {/* Warning Banner: "⚠ La geocerca no tiene puntos" (Matches user screenshot 1!) */}
          {tienePuntosFaltantes && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white/95 text-red-600 font-medium text-xs px-4 py-2 rounded-md shadow-2xl border border-red-200 animate-bounce">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>La geocerca no tiene puntos</span>
            </div>
          )}

          {/* Real Leaflet Map Container */}
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>
      </div>

      {/* Icon Library Picker Modal */}
      <IconPickerModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        selectedIcon={icono}
        onSelectIcon={(iconName) => setIcono(iconName)}
      />
    </div>
  );
}
