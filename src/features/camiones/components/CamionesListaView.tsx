// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Plus, ChevronDown, Check } from "lucide-react";
import type { Empresa } from "@/types";
import { getGeocercas } from "@/services/geocercaService";
import { escapeHtml } from "@/hooks/useLeafletMap";
import { apiClient } from "@/utils/apiClient";

import { CamionesListSide } from "./CamionesLista/CamionesListSide";
import { CamionesMapa } from "./CamionesLista/CamionesMapa";
import { CamionesPanelDetalle } from "./CamionesLista/CamionesPanelDetalle";
import { CrearCamionModal } from "./CamionesLista/Modales/CrearCamionModal";
import { type CamionUnidad, DEFAULT_CAMIONES, getStatusColor } from "@/data/camionesData";
export function CamionesListaView({ empresa }: { empresa?: Empresa }) {
  const { id } = useParams(); // empresa id
  const empresaId = id || (empresa ? String(empresa.id) : "1");

  // User-registered custom units stored in local memory
  const [customUnits, setCustomUnits] = useState<CamionUnidad[]>(() => {
    try {
      const saved = localStorage.getItem("custom_unidades_transporte");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load trucks: consume directly from empresa.flota.maquinarias (matching FlotaHome!)
  const camionesList: CamionUnidad[] = useMemo(() => {
    const rawMaquinarias: any[] =
      empresa?.flota?.maquinarias && empresa.flota.maquinarias.length > 0
        ? empresa.flota.maquinarias
        : (empresa?.flota as any)?.camiones && (empresa?.flota as any).camiones.length > 0
        ? (empresa?.flota as any).camiones
        : [];

    const truckModels = [
      "Iveco S-Way",
      "Volvo FH 540",
      "Mercedes-Benz Actros",
      "Scania R500",
      "Volvo FMX 460",
      "Kenworth T800",
      "Scania G440",
      "MAN TGX 26.480",
    ];

    const cargoTypes = [
      "Cisterna 6x4",
      "Tolva Minera",
      "Tolva Granelera",
      "Sideral 28t",
      "Cisterna Criogénica",
      "Plataforma Forestal",
      "Semirremolque B-Double",
    ];

    let baseList: CamionUnidad[] = [];

    if (rawMaquinarias.length > 0) {
      baseList = rawMaquinarias.map((maq, idx) => {
        const idStr = String(maq.id || `c${idx + 1}`);
        const placaStr = String(maq.placa || idStr);

        let estadoMapped: CamionUnidad["estado"] = "en_marcha";
        if (maq.estado === "ralenti" || maq.estado === "revisar") estadoMapped = "ralenti";
        else if (maq.estado === "offline" || maq.estado === "sin_datos") estadoMapped = "sin_senal";
        else if (maq.estado === "operando") estadoMapped = "operando";

        const estadoLabels: Record<CamionUnidad["estado"], string> = {
          en_marcha: "En marcha",
          ralenti: "Ralentí",
          operando: "Operando",
          sin_senal: "Sin señal",
        };

        // Match with operador por maquinariaId
        const op: any =
          ([] as any[]).find(
            (o) =>
              o.maquinariaId === idStr ||
              o.maquinariaId === placaStr ||
              (o.maquinariaId && idStr.includes(o.maquinariaId)) ||
              (o.maquinariaId && placaStr.includes(o.maquinariaId))
          );

        const desvio = typeof maq.desvioPct === "number" ? maq.desvioPct : (idx % 2 === 0 ? 12.8 : 4.5);
        const l100 = typeof maq.l100km === "number" ? maq.l100km : 38.0;
        const ralenti = typeof maq.ralentiPct === "number" ? maq.ralentiPct : 14.7;
        const horas = typeof maq.horas === "number" ? maq.horas : 180 + idx * 25;
        const consumoL = typeof maq.litros === "number" ? Math.round(maq.litros / 10) : 240 + idx * 10;
        const velocidad = estadoMapped === "ralenti" ? 0 : estadoMapped === "sin_senal" ? 0 : 55 + ((idx * 7) % 30);
        const caudal = estadoMapped === "ralenti" ? 18 : estadoMapped === "sin_senal" ? 0 : 115 + ((idx * 13) % 65);

        const lat = maq.lat || (-34.588 + ((idx % 4) * 0.02) - ((idx % 3) * 0.015));
        const lng = maq.lng || (-58.41 - ((idx % 3) * 0.02) + ((idx % 2) * 0.012));

        return {
          id: idStr,
          placa: placaStr,
          modelo: maq.modelo || truckModels[idx % truckModels.length],
          tipoCarga: maq.tipoCarga || cargoTypes[idx % cargoTypes.length],
          estado: estadoMapped,
          estadoLabel: estadoLabels[estadoMapped] || "En marcha",
          conductor: op?.nombre || `Conductor ${idx + 1}`,
          legajo: op?.legajo || `001${23 + idx}`,
          base: op?.sedes?.[0]?.sede?.nombre || "Sin Base",
          vencimientoLicencia: op?.vencimientoLicencia || "2027-04-15",
          conduccionBrusca: op?.conduccionBrusca ?? 2,
          viajes: op?.viajes ?? (35 + idx * 2),
          turno: idx % 2 === 0 ? "Turno mañana" : "Turno tarde",
          velocidadKmH: velocidad,
          caudalLh: caudal,
          ultimoDatoSec: idx * 3 + 4,
          desvioPct: desvio,
          consumoDiaL: consumoL,
          rendimientoL100km: l100,
          horometroH: horas,
          ralentiPct: ralenti,
          bateriaPct: 82 + ((idx * 5) % 17),
          senalEstado: estadoMapped === "sin_senal" ? "Débil" : "OK",
          lat,
          lng,
          caudalHistorial: [
            { hora: "12:00", valor: caudal + 15 },
            { hora: "12:30", valor: caudal - 10 },
            { hora: "13:00", valor: caudal + 5 },
            { hora: "13:30", valor: caudal + 25 },
            { hora: "14:00", valor: Math.max(caudal - 30, 20) },
            { hora: "14:30", valor: Math.max(caudal - 40, 15) },
            { hora: "15:00", valor: caudal },
            { hora: "15:30", valor: caudal + 20 },
            { hora: "16:00", valor: caudal + 10 },
          ],
        };
      });
    } else {
      // Default 15 trucks enriched with operators
      baseList = DEFAULT_CAMIONES.map((truck, idx) => {
        const op: any =
          ([] as any[]).find(
            (o) =>
              o.maquinariaId === truck.id ||
              o.maquinariaId === truck.placa ||
              (o.maquinariaId && truck.id.includes(o.maquinariaId))
          );

        return {
          ...truck,
          conductor: op?.nombre || truck.conductor,
          legajo: op?.legajo || truck.legajo,
          turno: op?.atribucion ? `Turno ${op.atribucion.toLowerCase()}` : truck.turno,
          base: op?.base || truck.base,
          vencimientoLicencia: op?.vencimientoLicencia || truck.vencimientoLicencia,
          conduccionBrusca: op?.conduccionBrusca ?? truck.conduccionBrusca,
          viajes: op?.viajes ?? truck.viajes,
          horometroH: op?.kmPeriodo ? Math.round(op.kmPeriodo) : truck.horometroH,
          rendimientoL100km: op?.rendimientoBruto ?? truck.rendimientoL100km,
          ralentiPct: op?.ralentiImproductivo ?? truck.ralentiPct,
        };
      });
    }

    return [...customUnits, ...baseList];
  }, [empresa, customUnits]);

  // Selected Truck ID (Default to first truck in list or TC-TRUCK-08)
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (camionesList.length > 0) {
      if (!selectedId || !camionesList.some((c) => c.id === selectedId)) {
        setSelectedId(camionesList[0].id);
      }
    }
  }, [camionesList, selectedId]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterConductor, setFilterConductor] = useState<string>("todos");
  const [filterProducto, setFilterProducto] = useState<string>("todos");
  const [filterAlertas, setFilterAlertas] = useState<string>("todos");

  // Register Modal state (matching Wialon / fleet unit properties)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [saveAlert, setSaveAlert] = useState(false);

  // Map state
  const [capaMapa, setCapaMapa] = useState<"mapa" | "satelite">("mapa");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vistaMovil, setVistaMovil] = useState<"unidades" | "mapa" | "detalle">("unidades");

  // Refs for Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const geocercasLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filtered List
  const filteredCamiones = useMemo(() => {
    return camionesList.filter((c) => {
      const matchSearch =
        searchTerm === "" ||
        c.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.modelo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        filterEstado === "todos" || c.estado === filterEstado;
      const matchConductor =
        filterConductor === "todos" || c.conductor === filterConductor;
      const matchProducto =
        filterProducto === "todos" ||
        c.tipoCarga.toLowerCase().includes(filterProducto.toLowerCase());
      const matchAlertas =
        filterAlertas === "todos" ||
        (filterAlertas === "con_alerta" ? c.desvioPct > 10 : c.desvioPct <= 10);

      return matchSearch && matchEstado && matchConductor && matchProducto && matchAlertas;
    });
  }, [camionesList, searchTerm, filterEstado, filterConductor, filterProducto, filterAlertas]);

  // Active Truck Object
  const currentTruck = useMemo(() => {
    return (
      camionesList.find((c) => c.id === selectedId) ||
      camionesList[0] ||
      DEFAULT_CAMIONES[0]
    );
  }, [camionesList, selectedId]);

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

  // ResizeObserver for responsive map resizing
  useEffect(() => {
    if (!mapWrapperRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    observer.observe(mapWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Invalidate map size and fly to current truck when mobile view changes to "mapa"
  useEffect(() => {
    if (vistaMovil === "mapa") {
      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        if (currentTruck) {
          mapRef.current.flyTo([currentTruck.lat, currentTruck.lng], 13, {
            duration: 0.8,
          });
        }
      }, 100);
    }
  }, [vistaMovil, currentTruck]);

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
      attributionControl: false,
    });

    // Centered on Buenos Aires just like in the screenshot
    map.setView([-34.588, -58.43], 12);
    L.control.zoom({ position: "topright" }).addTo(map);

    // Standard OpenStreetMap tiles matching Geocercas view
    const tile = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = tile;

    // Layer group for geocercas matching GeocercasView
    const geocercasGroup = L.layerGroup().addTo(map);
    geocercasLayerGroupRef.current = geocercasGroup;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render Geocercas on map (desde API real)
  useEffect(() => {
    const group = geocercasLayerGroupRef.current;
    if (!group) return;

    getGeocercas()
      .then((geocercas) => {
        group.clearLayers();
        geocercas.forEach((geo: any) => {
          if (geo.activa === false) return;
          if (geo.tipo === "circle" || !geo.tipo) {
            const circle = L.circle([geo.lat, geo.lng], {
              radius: geo.radio || 500,
              color: geo.color || "#22d3ee",
              weight: 2,
              fillColor: geo.color || "#22d3ee",
              fillOpacity: 0.22,
            }).bindPopup(`<strong>${escapeHtml(geo.nombre)}</strong><br/>${escapeHtml(geo.descripcion || "")}`);
            group.addLayer(circle);
          }
        });
      })
      .catch(() => {
        // Sin geocercas disponibles — no bloquea el mapa
      });
  }, []);

  // Layer toggle: Mapa (OpenStreetMap) vs Satélite (Esri) - exactly like Geocercas
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

    const newTile = L.tileLayer(url, {
      attribution: attr,
      maxZoom: 19,
    }).addTo(mapRef.current);

    tileLayerRef.current = newTile;
  }, [capaMapa]);

  // Update Map Markers with custom pill badges
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    camionesList.forEach((truck) => {
      const isSelected = truck.id === selectedId;
      const statusColor = getStatusColor(truck.estado);

      // Custom capsule pill marker HTML matching the image
      const markerHtml = `
        <div style="
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 8px; border-radius: 9999px;
          background: rgba(13, 17, 23, 0.92);
          border: 1.5px solid ${isSelected ? "#0df5c6" : statusColor};
          box-shadow: ${
            isSelected
              ? "0 0 0 4px rgba(13,245,198,0.25), 0 0 16px rgba(13,245,198,0.7)"
              : "0 2px 8px rgba(0,0,0,0.6)"
          };
          cursor: pointer; transition: all 0.2s ease;
        ">
          <span style="
            width: 8px; height: 8px; border-radius: 50%;
            background: ${statusColor};
            box-shadow: 0 0 6px ${statusColor};
          "></span>
          <span style="
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, sans-serif;
            font-size: 11px; font-weight: 700; color: #f8fafc;
            letter-spacing: 0.02em; white-space: nowrap;
          ">${truck.placa}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "",
        html: markerHtml,
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      });

      const marker = L.marker([truck.lat, truck.lng], { icon: customIcon })
        .addTo(map)
        .on("click", () => {
          setSelectedId(truck.id);
        });

      markersRef.current[truck.id] = marker;
    });
  }, [camionesList, selectedId]);

  // Fly to selected truck
  useEffect(() => {
    if (!mapRef.current || !currentTruck) return;
    if (mapContainerRef.current && mapContainerRef.current.clientWidth > 0) {
      mapRef.current.invalidateSize();
      mapRef.current.flyTo([currentTruck.lat, currentTruck.lng], 13, {
        duration: 0.8,
      });
    }
  }, [selectedId, currentTruck]);

  // Register New Unit
  const handleGuardarNuevoCamion = async (newTruck: CamionUnidad) => {
    try {
      const dto = {
        identificador: newTruck.id,
        modelo: newTruck.modelo,
        estadoOperativo: "OPERATIVO",
        // Aquí pasamos los campos requeridos por el backend.
        // Asignamos a la primera sede si existe o al tipo maquinaria 1 por defecto si no tenemos selectores
        sedeId: empresa?.sedes?.[0]?.id || 1,
        tipoMaquinariaId: 1
      };
      
      await apiClient.post('/maquinarias', dto);

      const updated = [newTruck, ...customUnits];
      setCustomUnits(updated);
      setSelectedId(newTruck.id);
      setIsModalOpen(false);
      setSaveAlert(true);
      setTimeout(() => setSaveAlert(false), 3000);
    } catch (e) {
      console.error("Error al crear maquinaria en el backend", e);
      alert("Error al crear el camión en el servidor.");
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px] w-full overflow-hidden rounded-xl border border-white/10 bg-[#070b12] text-slate-200 font-sans shadow-2xl">
      {/* ─── TOP HEADER BAR ─── */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-white/10 bg-[#0c121d] px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top line on mobile: Title + Badge + Mobile Register button */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Transporte
            </h1>
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 text-xs font-semibold text-[#0df5c6]">
              {filteredCamiones.length} unidades
            </span>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] px-2.5 py-1 text-xs font-bold text-[#07131b] shadow-[0_0_12px_rgba(13,245,198,0.25)] transition"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Registrar</span>
            </button>
          </div>
        </div>

        {/* Search + Filter dropdowns + Mobile View Switcher */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-none md:max-w-2xl justify-start">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[140px] sm:min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar unidad, conductor..."
              className="w-full rounded-lg border border-white/10 bg-[#141b29] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0df5c6] transition"
            />
          </div>

          {/* Filter: Estado */}
          <div className="relative">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Estado</option>
              <option value="en_marcha">En marcha</option>
              <option value="ralenti">Ralenti</option>
              <option value="operando">Operando</option>
              <option value="sin_senal">Sin señal</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter: Conductor */}
          <div className="relative hidden sm:block">
            <select
              value={filterConductor}
              onChange={(e) => setFilterConductor(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Conductor</option>
              <option value="">Sin datos de operadores disponibles</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter: Producto */}
          <div className="relative hidden md:block">
            <select
              value={filterProducto}
              onChange={(e) => setFilterProducto(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Producto</option>
              <option value="Cisterna">Cisterna</option>
              <option value="Tolva">Tolva</option>
              <option value="Volquete">Volquete</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter: Con alertas */}
          <div className="relative hidden lg:block">
            <select
              value={filterAlertas}
              onChange={(e) => setFilterAlertas(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Alertas</option>
              <option value="con_alerta">Desvío &gt; 10%</option>
              <option value="sin_alerta">Sin alertas</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

        </div>

        {/* Right Primary Action on Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {saveAlert && (
            <span className="text-xs text-[#0df5c6] font-medium animate-fade-in flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Unidad registrada
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] px-3.5 py-1.5 text-xs font-bold text-[#07131b] shadow-[0_0_15px_rgba(13,245,198,0.3)] transition"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Registrar unidad
          </button>
        </div>
      </header>

      {/* ─── DEDICATED MOBILE VIEW SWITCHER BAR (< xl) ─── */}
      <div className="xl:hidden flex items-center bg-[#0a0f19] border-b border-white/10 p-2 gap-2 shrink-0 z-30">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setVistaMovil("unidades")}
          className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 active:scale-95 ${
            vistaMovil === "unidades"
              ? "bg-[#0df5c6] text-[#07131b] shadow-md"
              : "bg-[#141b29] text-slate-300 hover:text-white"
          }`}
        >
          <span>Unidades</span>
          <span className="text-[10px] opacity-80 font-mono">({filteredCamiones.length})</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setVistaMovil("mapa")}
          className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 active:scale-95 ${
            vistaMovil === "mapa"
              ? "bg-[#0df5c6] text-[#07131b] shadow-md"
              : "bg-[#141b29] text-slate-300 hover:text-white"
          }`}
        >
          <span>Mapa</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setVistaMovil("detalle")}
          className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 active:scale-95 truncate ${
            vistaMovil === "detalle"
              ? "bg-[#0df5c6] text-[#07131b] shadow-md"
              : "bg-[#141b29] text-slate-300 hover:text-white"
          }`}
        >
          <span>Detalle</span>
          {currentTruck && <span className="text-[10px] opacity-80 truncate hidden xs:inline">({currentTruck.placa})</span>}
        </button>
      </div>

      {/* ─── 3-COLUMN MAIN BODY ─── */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
        <CamionesListSide
          filteredCamiones={filteredCamiones}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          vistaMovil={vistaMovil}
          setVistaMovil={setVistaMovil}
        />
        
        <CamionesMapa
          mapWrapperRef={mapWrapperRef}
          isFullscreen={isFullscreen}
          vistaMovil={vistaMovil}
          capaMapa={capaMapa}
          setCapaMapa={setCapaMapa}
          toggleFullscreen={toggleFullscreen}
          currentTruck={currentTruck}
          setVistaMovil={setVistaMovil}
          mapContainerRef={mapContainerRef}
        />

        {currentTruck && (
          <CamionesPanelDetalle
            currentTruck={currentTruck}
            empresaId={empresa?.id || "empresa-1"}
            vistaMovil={vistaMovil}
            setVistaMovil={setVistaMovil}
            setSelectedId={setSelectedId}
          />
        )}
      </div>

      <CrearCamionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleGuardarNuevoCamion}
      />
    </div>
  );
}
