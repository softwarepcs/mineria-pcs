import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../../components/Icon";
import operadoresData from "../../../data/operadores.json";
import { getMaquinarias, getTelemetriaByMaquinaria } from "../../../services/telemetriaService";

interface TelemetriaPunto {
  id: string | number;
  maquinariaId: string;
  placa: string;
  fecha: string;
  lat: number;
  lng: number;
  velocidad: number;
  rumbo: number;
  temIngreso: number;
  temRetorno: number;
  rpm: number;
  flujoIn: number;
  flujoRet: number;
  consumoGh: number;
  totalGal: number;
  odometro: number;
  porcPaso: number;
}

function createNumberedIcon(num: number) {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;
        background:#1a9a7a;color:#ffffff;font-size:12px;font-weight:bold;border-radius:9999px;
        border:2px solid #ffffff;box-shadow:0 0 8px rgba(0,0,0,0.6);">
        ${num}
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function createStartIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#16a34a;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;
          border-radius:6px;margin-bottom:4px;box-shadow:0 2px 8px rgba(22,163,74,0.5);white-space:nowrap;">Inicio</div>
        <div style="width:14px;height:14px;background:#16a34a;border-radius:9999px;
          border:3px solid #fff;box-shadow:0 0 10px rgba(22,163,74,0.7);"></div>
      </div>`,
    iconSize: [50, 36],
    iconAnchor: [25, 36],
    popupAnchor: [0, -36],
  });
}

function createEndIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#dc2626;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;
          border-radius:6px;margin-bottom:4px;box-shadow:0 2px 8px rgba(220,38,38,0.5);white-space:nowrap;">Fin</div>
        <div style="width:14px;height:14px;background:#dc2626;border-radius:9999px;
          border:3px solid #fff;box-shadow:0 0 10px rgba(220,38,38,0.7);"></div>
      </div>`,
    iconSize: [50, 36],
    iconAnchor: [25, 36],
    popupAnchor: [0, -36],
  });
}

export function MotorPrincipal({ empresaNombre: _empresaNombre }: { empresaNombre: string }) {
  const [maquinarias, setMaquinarias] = useState<any[]>([]);
  const [maquinariaSeleccionada, setMaquinariaSeleccionada] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);

  const [operadores, setOperadores] = useState<any[]>(operadoresData);

  useEffect(() => {
    fetch('/api/operadores')
      .then(res => res.json())
      .then(data => setOperadores(data))
      .catch(err => console.error("Error fetching operadores:", err));
  }, []);

  const [resultados, setResultados] = useState<TelemetriaPunto[]>([]);
  const [datosCargadosEnMapa, setDatosCargadosEnMapa] = useState(false);
  const [busquedaTabla, setBusquedaTabla] = useState("");
  const [mostrarRegistros, setMostrarRegistros] = useState(25);
  const [paginaActual, setPaginaActual] = useState(1);
  const [capaMapa, setCapaMapa] = useState<"mapa" | "satelite">("mapa");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapWrapperRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error al intentar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Cargar maquinarias al montar
  useEffect(() => {
    getMaquinarias()
      .then((data) => {
        setMaquinarias(data);
        if (data.length > 0) {
          setMaquinariaSeleccionada(data[0].id.toString());
        }
      })
      .catch((err) => console.error("Error cargando maquinarias:", err));
  }, []);

  // Inicializar Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centrar en Argentina (Buenos Aires) por defecto. Mover control de zoom abajo a la derecha.
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([-34.6037, -58.3816], 10);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tile;
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Cambiar capa entre Mapa y Satélite
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const url =
      capaMapa === "satelite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attr =
      capaMapa === "satelite"
        ? "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        : "&copy; OpenStreetMap contributors";

    const newTile = L.tileLayer(url, { attribution: attr, maxZoom: 19 }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [capaMapa]);

  // Al cambiar de camión/maquinaria: LIMPIAR la tabla y el mapa
  const handleCambioMaquinaria = (nuevoId: string) => {
    setMaquinariaSeleccionada(nuevoId);
    setResultados([]);
    setDatosCargadosEnMapa(false);
    setPaginaActual(1);
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }
  };

  // Botón Buscar: llena la tabla con los datos del camión y rango de fecha desde Backend
  const handleBuscar = async () => {
    if (!maquinariaSeleccionada) return;
    setCargando(true);
    try {
      const data = await getTelemetriaByMaquinaria(maquinariaSeleccionada, fechaInicio, fechaFin);
      // Extraemos la placa de la maquinaria seleccionada
      const maq = maquinarias.find((m) => m.id.toString() === maquinariaSeleccionada);
      const placa = maq ? (maq.identificador || maq.placa || 'Desconocido') : 'Desconocido';

      const filtrados = data.map((d: any) => ({
        ...d,
        placa
      }));
      setResultados(filtrados);
      setDatosCargadosEnMapa(false);
      setPaginaActual(1);
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      }
    } catch (error) {
      console.error("Error al buscar telemetría:", error);
      alert("Error cargando los datos de telemetría.");
    } finally {
      setCargando(false);
    }
  };

  // Botón Cargar Datos al Mapa: dibuja la ruta y los puntitos en el mapa
  const handleCargarAlMapa = () => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    if (resultados.length === 0) {
      alert("Primero presiona 'Buscar' para obtener los datos que se cargarán al mapa.");
      return;
    }

    const latLngs: L.LatLngExpression[] = [];

    const lastIdx = resultados.length - 1;

    resultados.forEach((r, index) => {
      latLngs.push([r.lat, r.lng]);

      // Primer punto: verde (Inicio), último punto: rojo (Fin), resto: numerados teal
      let icon;
      if (index === 0) {
        icon = createStartIcon();
      } else if (index === lastIdx && lastIdx > 0) {
        icon = createEndIcon();
      } else {
        icon = createNumberedIcon(index + 1);
      }

      const marker = L.marker([r.lat, r.lng], { icon }).bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;color:#0b1220;">
          <strong>${index === 0 ? '🟢 Inicio' : index === lastIdx ? '🔴 Fin' : `Punto ${index + 1}`} · ${r.placa}</strong><br/>
          <strong>Fecha:</strong> ${r.fecha}<br/>
          <strong>Velocidad:</strong> ${r.velocidad} km/h · <strong>RPM:</strong> ${r.rpm}<br/>
          <strong>Flujo In:</strong> ${r.flujoIn} · <strong>Flujo Ret:</strong> ${r.flujoRet}<br/>
          <strong>Consumo:</strong> ${r.consumoGh} G/H<br/>
          <strong>Lat/Lng:</strong> ${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}
        </div>`
      );
      markersGroupRef.current?.addLayer(marker);
    });

    // Dibujar línea del tracking
    if (latLngs.length > 1) {
      const rutaLine = L.polyline(latLngs, {
        color: "#3fb68b",
        weight: 3,
        opacity: 0.85,
        dashArray: "4, 6",
      });
      markersGroupRef.current.addLayer(rutaLine);
    }

    setDatosCargadosEnMapa(true);

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  // Botón Excel: exportar a CSV
  const handleExportarExcel = () => {
    if (resultados.length === 0) {
      alert("No hay datos en la tabla para exportar.");
      return;
    }

    const headers = [
      "Item",
      "Fecha",
      "Latitud",
      "Longitud",
      "Velocidad",
      "Rumbo",
      "Tem Ingreso",
      "Tem Retorno",
      "RPM",
      "Flujo IN",
      "Flujo RET",
      "Consumo G/H",
      "Total Gal",
      "Odometro",
      "%Paso",
    ];

    const rows = resultados.map((r, i) => [
      i + 1,
      r.fecha,
      r.lat,
      r.lng,
      r.velocidad,
      r.rumbo,
      r.temIngreso,
      r.temRetorno,
      r.rpm,
      r.flujoIn,
      r.flujoRet,
      r.consumoGh,
      r.totalGal,
      r.odometro,
      r.porcPaso,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MotorPrincipal_${maquinarias.find((c) => c.id === maquinariaSeleccionada)?.placa || "telemetria"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado de la tabla según buscador
  const registrosFiltrados = resultados.filter((r) => {
    if (!busquedaTabla) return true;
    const q = busquedaTabla.toLowerCase();
    return (
      r.fecha.toLowerCase().includes(q) ||
      r.lat.toString().includes(q) ||
      r.lng.toString().includes(q) ||
      r.rpm.toString().includes(q)
    );
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(registrosFiltrados.length / mostrarRegistros));
  const startIdx = (paginaActual - 1) * mostrarRegistros;
  const endIdx = startIdx + mostrarRegistros;
  const registrosPaginados = registrosFiltrados.slice(startIdx, endIdx);

  // Generar array de páginas para los botones
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (paginaActual > 3) pages.push("...");
      const start = Math.max(2, paginaActual - 1);
      const end = Math.min(totalPages - 1, paginaActual + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (paginaActual < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Resolve current operator
  const operadorActual = operadores.find((o) => {
    const maq = maquinarias.find((m) => String(m.id) === String(maquinariaSeleccionada));
    const placa = maq ? maq.identificador || maq.placa : maquinariaSeleccionada;
    return (
      String(o.maquinariaId) === String(maquinariaSeleccionada) ||
      String(o.maquinariaId) === String(placa)
    );
  });
  const operadorNombre = operadorActual
    ? `${operadorActual.nombre}`
    : "Sin operador";

  // Reset page on filter change
  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaTabla, mostrarRegistros]);

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="mp-header">
        <span className="mp-header-icon">
          <Icon name="database" className="h-5 w-5" />
        </span>
        <div>
          <h1 className="mp-header-title">Registros de telemetría</h1>
          <p className="mp-header-subtitle">
            Flujo, temperatura, RPM y trazado de ruta
          </p>
        </div>
      </div>

      {/* ─── Filter Bar (horizontal) ─── */}
      <div className="mp-filter-bar">
        <div className="mp-filter-group mp-filter-group-grow">
          <label className="mp-filter-label">Camión</label>
          <select
            value={maquinariaSeleccionada}
            onChange={(e) => handleCambioMaquinaria(e.target.value)}
            className="mp-filter-input"
          >
            {maquinarias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.identificador || c.placa}
              </option>
            ))}
          </select>
        </div>

        <div className="mp-filter-group">
          <label className="mp-filter-label">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="mp-filter-input"
          />
        </div>

        <div className="mp-filter-group">
          <label className="mp-filter-label">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="mp-filter-input"
          />
        </div>

        <div className="mp-filter-actions">
          <button
            type="button"
            onClick={handleBuscar}
            disabled={cargando}
            className="mp-btn-buscar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {cargando ? "Cargando..." : "Buscar"}
          </button>

          <button
            type="button"
            onClick={handleExportarExcel}
            className="mp-btn-exportar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </button>

          <button
            type="button"
            onClick={handleCargarAlMapa}
            className="mp-btn-cargar-mapa"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Mapa
          </button>
        </div>
      </div>

      {datosCargadosEnMapa && (
        <p className="mp-map-status">
          ✓ {resultados.length} puntos de ruta trazados en el mapa
        </p>
      )}

      {/* ─── Map ─── */}
      <div
        ref={mapWrapperRef}
        className={`mp-map-wrapper ${isFullscreen ? "mp-map-wrapper-fullscreen" : "mp-map-wrapper-normal"}`}
      >
        {/* Layer toggle */}
        <div className="mp-map-layer-toggle">
          <button
            type="button"
            onClick={() => setCapaMapa("mapa")}
            className={`mp-map-layer-btn ${capaMapa === "mapa" ? "mp-map-layer-btn-active" : ""}`}
          >
            Mapa
          </button>
          <button
            type="button"
            onClick={() => setCapaMapa("satelite")}
            className={`mp-map-layer-btn ${capaMapa === "satelite" ? "mp-map-layer-btn-active" : ""}`}
          >
            Satélite
          </button>
        </div>

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="mp-map-fullscreen-btn"
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

        {/* NO usar className dinámico aquí para no borrar las clases que inyecta Leaflet */}
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* ─── Table ─── */}
      <div className="mp-table-container">
        {/* Toolbar */}
        <div className="mp-table-toolbar">
          <div className="mp-table-toolbar-left">
            <span>Mostrar</span>
            <select
              value={mostrarRegistros}
              onChange={(e) => setMostrarRegistros(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>registros</span>
          </div>

          <input
            type="text"
            value={busquedaTabla}
            onChange={(e) => setBusquedaTabla(e.target.value)}
            placeholder="Buscar en tabla..."
            className="mp-table-search"
          />
        </div>

        {/* Table */}
        <div className="mp-table-wrapper">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Fecha y hora</th>
                <th>Operador / Venc. Lic.</th>
                <th>Latitud</th>
                <th>Longitud</th>
                <th>Velocidad</th>
                <th>Rumbo</th>
                <th>Temperatura</th>
                <th>RPM</th>
                <th>FR IN</th>
                <th>FR RET</th>
                <th>Consumo L/H</th>
                <th>Total Acumulado L</th>
                <th>Odómetro</th>
              </tr>
            </thead>
            <tbody>
              {registrosPaginados.length > 0 ? (
                registrosPaginados.map((r, i) => (
                  <tr key={r.id}>
                    <td className="mp-cell-muted">{startIdx + i + 1}</td>
                    <td>{r.fecha}</td>
                    <td className="text-slate-300 font-medium whitespace-nowrap">{operadorNombre}</td>
                    <td style={{ color: "#00ebb0", fontWeight: 600 }}>{r.lat.toFixed(6)}</td>
                    <td style={{ color: "#00ebb0", fontWeight: 600 }}>{r.lng.toFixed(6)}</td>
                    <td>{r.velocidad.toFixed(1)}</td>
                    <td>{r.rumbo}</td>
                    <td>{r.temIngreso.toFixed(1)}</td>
                    <td className="mp-cell-bold">{r.rpm}</td>
                    <td>{r.flujoIn.toFixed(1)}</td>
                    <td>{r.flujoRet.toFixed(1)}</td>
                    <td style={{ color: "#00ebb0", fontWeight: 600 }}>{r.consumoGh.toFixed(1)}</td>
                    <td>{r.totalGal.toLocaleString("es-PE")}</td>
                    <td>{r.odometro}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="mp-table-empty">
                    {resultados.length === 0
                      ? "Selecciona un camión, define el rango de fechas y presiona 'Buscar' para consultar la información."
                      : "No se encontraron registros que coincidan con la búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mp-pagination">
          <span className="mp-pagination-info">
            Mostrando {registrosFiltrados.length > 0 ? startIdx + 1 : 0} a{" "}
            {Math.min(endIdx, registrosFiltrados.length)} de {registrosFiltrados.length.toLocaleString("es-PE")} registros
          </span>
          <div className="mp-pagination-buttons">
            <button
              type="button"
              className="mp-page-btn"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="mp-page-btn" style={{ cursor: "default", borderColor: "transparent" }}>
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={`mp-page-btn ${paginaActual === page ? "mp-page-btn-active" : ""}`}
                  onClick={() => setPaginaActual(page as number)}
                >
                  {page}
                </button>
              )
            )}
            <button
              type="button"
              className="mp-page-btn"
              disabled={paginaActual === totalPages}
              onClick={() => setPaginaActual((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


