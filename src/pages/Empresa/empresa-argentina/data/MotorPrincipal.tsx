import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import motorPrincipalData from "../../../../data/motorPrincipalData.json";
import { Icon } from "../../../../components/Icon";

interface TelemetriaPunto {
  id: number;
  MaquinariaId: string;
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
        background:#15803d;color:#ffffff;font-size:12px;font-weight:bold;border-radius:9999px;
        border:2px solid #ffffff;box-shadow:0 0 8px rgba(0,0,0,0.6);">
        ${num}
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export function MotorPrincipal({ empresaNombre }: { empresaNombre: string }) {
  const [maquinarias] = useState(motorPrincipalData.maquinarias);
  const [MaquinariaSeleccionado, setMaquinariaSeleccionado] = useState(maquinarias[0].id);
  const [fechaInicio, setFechaInicio] = useState("2026-09-01");
  const [fechaFin, setFechaFin] = useState("2026-09-10");

  const [resultados, setResultados] = useState<TelemetriaPunto[]>([]);
  const [datosCargadosEnMapa, setDatosCargadosEnMapa] = useState(false);
  const [busquedaTabla, setBusquedaTabla] = useState("");
  const [mostrarRegistros, setMostrarRegistros] = useState(10);
  const [capaMapa, setCapaMapa] = useState<"mapa" | "satelite">("mapa");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Inicializar Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-12.046, -77.103], 11);

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
    setMaquinariaSeleccionado(nuevoId);
    setResultados([]);
    setDatosCargadosEnMapa(false);
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }
  };

  // Botón Buscar: llena la tabla con los datos del camión y rango de fecha
  const handleBuscar = () => {
    const todos = motorPrincipalData.telemetria as TelemetriaPunto[];
    const filtrados = todos.filter((t) => {
      const fechaCorta = t.fecha.split(" ")[0];
      return (
        t.MaquinariaId === MaquinariaSeleccionado &&
        fechaCorta >= fechaInicio &&
        fechaCorta <= fechaFin
      );
    });

    setResultados(filtrados);
    setDatosCargadosEnMapa(false);
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
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

    resultados.forEach((r, index) => {
      latLngs.push([r.lat, r.lng]);
      const marker = L.marker([r.lat, r.lng], {
        icon: createNumberedIcon(index + 1),
      }).bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;color:#0b1220;">
          <strong>Punto ${index + 1} · ${r.placa}</strong><br/>
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
        color: "#10b981",
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
      `MotorPrincipal_${maquinarias.find((c) => c.id === MaquinariaSeleccionado)?.placa || "telemetria"}.csv`
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

  const registrosPaginados = registrosFiltrados.slice(0, mostrarRegistros);

  return (
    <div className="space-y-6">
      {/* Título de la vista */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
          <Icon name="database" className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">Motor Principal</h1>
          <p className="text-xs text-slate-400">
            {empresaNombre} · Telemetría de flujo, temperatura, RPM y trazado de ruta en mapa
          </p>
        </div>
      </div>

      {/* Panel Superior: Filtros a la izquierda y Mapa a la derecha */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Columna Izquierda: Controles y Filtros */}
        <div className="rounded-xl border border-white/10 bg-[#0c1824] p-5 backdrop-blur-sm lg:col-span-4">
          <div className="space-y-4">
            {/* Camión / Maquinaria */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white">
                Camión / Maquinaria <span className="text-red-400">*</span>
              </label>
              <select
                value={MaquinariaSeleccionado}
                onChange={(e) => handleCambioMaquinaria(e.target.value)}
                className="w-full rounded-lg border border-teal-300 bg-[#2dd4bf] px-3 py-2.5 text-sm font-bold text-slate-950 shadow-inner outline-none transition focus:ring-2 focus:ring-teal-200"
              >
                {maquinarias.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white font-medium">
                    {c.placa} ({c.nombre})
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white">
                Fecha Inicio: <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-lg border border-teal-300 bg-[#2dd4bf] px-3 py-2 text-sm font-bold text-slate-950 shadow-inner outline-none transition focus:ring-2 focus:ring-teal-200"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white">
                Fecha Fin: <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-lg border border-teal-300 bg-[#2dd4bf] px-3 py-2 text-sm font-bold text-slate-950 shadow-inner outline-none transition focus:ring-2 focus:ring-teal-200"
              />
            </div>

            {/* Opciones y Botones */}
            <div className="pt-2">
              <span className="mb-2 block text-xs font-semibold text-slate-300">Opciones:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBuscar}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0284c7] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#0369a1]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </button>

                <button
                  type="button"
                  onClick={handleExportarExcel}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#16a34a] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#15803d]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </button>
              </div>

              {/* Botón Cargar Datos al Mapa */}
              <button
                type="button"
                onClick={handleCargarAlMapa}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-[#0f2d4a] px-4 py-2.5 text-xs font-bold text-cyan-200 shadow transition hover:bg-[#163f68]"
              >
                <svg className="h-4 w-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Cargar Datos al Mapa
              </button>

              {datosCargadosEnMapa && (
                <p className="mt-2 text-center text-xs text-emerald-400">
                  ✓ {resultados.length} puntos de ruta trazados en el mapa
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Mapa Interactivo con Botones de Modo */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 lg:col-span-8">
          {/* Selector de modo Mapa / Satélite */}
          <div className="absolute left-4 top-4 z-[1000] flex overflow-hidden rounded-md border border-black/30 bg-white/90 shadow text-xs font-medium text-slate-800">
            <button
              type="button"
              onClick={() => setCapaMapa("mapa")}
              className={`px-3 py-1.5 transition ${
                capaMapa === "mapa" ? "bg-white font-bold text-black" : "hover:bg-slate-100"
              }`}
            >
              Mapa
            </button>
            <button
              type="button"
              onClick={() => setCapaMapa("satelite")}
              className={`px-3 py-1.5 transition ${
                capaMapa === "satelite" ? "bg-white font-bold text-black" : "hover:bg-slate-100"
              }`}
            >
              Satélite
            </button>
          </div>

          <div ref={mapContainerRef} className="h-[380px] w-full" />
        </div>
      </div>

      {/* Panel Inferior: Tabla de Telemetría Detallada */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#081522] backdrop-blur-sm">
        {/* Barra superior de la tabla */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Mostrar</span>
            <select
              value={mostrarRegistros}
              onChange={(e) => setMostrarRegistros(Number(e.target.value))}
              className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>registros</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Buscar:</span>
            <input
              type="text"
              value={busquedaTabla}
              onChange={(e) => setBusquedaTabla(e.target.value)}
              placeholder="Buscar en tabla..."
              className="rounded border border-white/10 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none"
            >
            </input>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0c2236] text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                <th className="px-3 py-2.5">Item</th>
                <th className="px-3 py-2.5">Fecha</th>
                <th className="px-3 py-2.5">Latitud</th>
                <th className="px-3 py-2.5">Longitud</th>
                <th className="px-3 py-2.5">Velocidad</th>
                <th className="px-3 py-2.5">Rumbo</th>
                <th className="px-3 py-2.5">Tem Ingreso</th>
                <th className="px-3 py-2.5">Tem Retorno</th>
                <th className="px-3 py-2.5">RPM</th>
                <th className="px-3 py-2.5">Flujo IN</th>
                <th className="px-3 py-2.5">Flujo RET</th>
                <th className="px-3 py-2.5">Consumo G/H</th>
                <th className="px-3 py-2.5">Total Gal</th>
                <th className="px-3 py-2.5">Odómetro</th>
                <th className="px-3 py-2.5 text-right">%Paso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {registrosPaginados.length > 0 ? (
                registrosPaginados.map((r, i) => (
                  <tr key={r.id} className="transition hover:bg-white/5">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.fecha}</td>
                    <td className="px-3 py-2 text-cyan-300">{r.lat.toFixed(6)}</td>
                    <td className="px-3 py-2 text-cyan-300">{r.lng.toFixed(6)}</td>
                    <td className="px-3 py-2">{r.velocidad.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.rumbo}</td>
                    <td className="px-3 py-2">{r.temIngreso.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.temRetorno.toFixed(1)}</td>
                    <td className="px-3 py-2 font-bold text-white">{r.rpm}</td>
                    <td className="px-3 py-2">{r.flujoIn.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.flujoRet.toFixed(1)}</td>
                    <td className="px-3 py-2 font-bold text-emerald-400">{r.consumoGh.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.totalGal.toLocaleString("es-PE")}</td>
                    <td className="px-3 py-2">{r.odometro}</td>
                    <td className={`px-3 py-2 text-right ${r.porcPaso < 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      {r.porcPaso}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-xs text-slate-400 font-sans">
                    {resultados.length === 0
                      ? "Selecciona un camión o maquinaria, define el rango de fechas y presiona 'Buscar' para consultar la información."
                      : "No se encontraron registros que coincidan con la búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

