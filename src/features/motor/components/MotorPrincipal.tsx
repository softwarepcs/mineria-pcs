import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useLecturas } from "@/features/telemetria/hooks";
import { Icon } from "@/components/Icon";
import { useLeafletMap, ajustarVista } from "@/shared/map/useLeafletMap";
import { useFullscreen } from "@/shared/map/useFullscreen";
import { MapaControles } from "@/shared/map/MapaControles";
import { escapeHtml } from "@/shared/utils/escapeHtml";
import { descargarCsv } from "@/shared/utils/csv";
import { fechaHora, hoyISO, num } from "@/shared/utils/formato";
import { mensajeError } from "@/shared/api/errores";

const MAX_DIAS = 90;

function marcador(color: string, texto: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="background:${color};color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;margin-bottom:4px;white-space:nowrap;">${texto}</div>
      <div style="width:14px;height:14px;background:${color};border-radius:9999px;border:3px solid #fff;"></div></div>`,
    iconSize: [50, 36],
    iconAnchor: [25, 36],
    popupAnchor: [0, -36],
  });
}

export function MotorPrincipal({ empresa }: { empresa: EmpresaDetalle }) {
  const { data: unidades = [] } = useUnidades(empresa.id);
  const conDispositivo = useMemo(() => unidades.filter((u) => u.dispositivo || u.telemetria), [unidades]);

  const [maquinariaId, setMaquinariaId] = useState<number | null>(null);
  const [desde, setDesde] = useState(hoyISO(-7));
  const [hasta, setHasta] = useState(hoyISO());
  const [consulta, setConsulta] = useState<{ maquinariaId: number; desde: string; hasta: string } | null>(null);
  const [errorRango, setErrorRango] = useState<string | null>(null);
  const [verEnMapa, setVerEnMapa] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [porPagina, setPorPagina] = useState(25);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    if (!maquinariaId && conDispositivo.length) setMaquinariaId(conDispositivo[0].id);
  }, [conDispositivo, maquinariaId]);

  const { data: lecturas = [], isFetching, error } = useLecturas(consulta);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { mapa, capa, setCapa } = useLeafletMap(contenedorRef);
  const { pantallaCompleta, alternarPantallaCompleta } = useFullscreen(wrapperRef);
  const unidad = unidades.find((u) => u.id === consulta?.maquinariaId);

  const buscar = () => {
    if (!maquinariaId) return;
    // Días completos en hora local
    const ini = new Date(`${desde}T00:00:00`);
    const fin = new Date(`${hasta}T23:59:59.999`);
    const dias = (fin.getTime() - ini.getTime()) / 86_400_000;
    if (dias < 0) return setErrorRango("La fecha de inicio es posterior a la final.");
    if (dias > MAX_DIAS) return setErrorRango(`El rango máximo es de ${MAX_DIAS} días.`);
    setErrorRango(null);
    setVerEnMapa(false);
    setPagina(1);
    setConsulta({ maquinariaId, desde: ini.toISOString(), hasta: fin.toISOString() });
  };

  // Ruta en el mapa
  useEffect(() => {
    if (!mapa || !verEnMapa) return;
    const puntos = lecturas.filter((l) => l.lat !== null && l.lng !== null);
    const grupo = L.layerGroup().addTo(mapa);
    const coords = puntos.map((l) => [l.lat!, l.lng!] as [number, number]);
    if (coords.length > 1) L.polyline(coords, { color: "#3fb68b", weight: 3, opacity: 0.85 }).addTo(grupo);
    puntos.forEach((l, i) => {
      const esInicio = i === 0;
      const esFin = i === puntos.length - 1 && i > 0;
      const popup = `<div style="font-family:sans-serif;font-size:12px;color:#0b1220;">
        <strong>${esInicio ? "Inicio" : esFin ? "Fin" : `Punto ${i + 1}`} · ${escapeHtml(unidad?.identificador)}</strong><br/>
        <strong>Fecha:</strong> ${escapeHtml(fechaHora(l.timestamp))}<br/>
        <strong>Velocidad:</strong> ${escapeHtml(num(l.velocidad, 1))} km/h · <strong>RPM:</strong> ${escapeHtml(num(l.rpm))}<br/>
        <strong>Flujo in/ret:</strong> ${escapeHtml(num(l.flujoIn, 1))} / ${escapeHtml(num(l.flujoRet, 1))}<br/>
        <strong>Operador:</strong> ${escapeHtml(l.operador ?? "—")}</div>`;
      const m =
        esInicio || esFin
          ? L.marker([l.lat!, l.lng!], { icon: marcador(esInicio ? "#16a34a" : "#dc2626", esInicio ? "Inicio" : "Fin") })
          : L.circleMarker([l.lat!, l.lng!], { radius: 4, color: "#1a9a7a", fillColor: "#1a9a7a", fillOpacity: 0.9, weight: 1 });
      m.bindPopup(popup).addTo(grupo);
    });
    ajustarVista(mapa, coords);
    return () => {
      grupo.remove();
    };
  }, [mapa, verEnMapa, lecturas, unidad]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lecturas;
    return lecturas.filter((l) => [fechaHora(l.timestamp), l.operador, l.rpm, l.lat, l.lng].some((c) => String(c ?? "").toLowerCase().includes(q)));
  }, [lecturas, busqueda]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const visibles = filtradas.slice(inicio, inicio + porPagina);
  useEffect(() => setPagina(1), [busqueda, porPagina]);

  const exportar = () => {
    descargarCsv(
      `telemetria_${unidad?.identificador ?? "unidad"}_${desde}_${hasta}.csv`,
      ["Ítem", "Fecha y hora", "Operador", "Latitud", "Longitud", "Velocidad (km/h)", "Rumbo", "Temp. ingreso", "Temp. retorno", "RPM", "Flujo IN", "Flujo RET", "Consumo (gal/h)", "Total (gal)", "Odómetro", "% paso"],
      filtradas.map((l, i) => [i + 1, fechaHora(l.timestamp), l.operador, l.lat, l.lng, l.velocidad, l.rumbo, l.temIngreso, l.temRetorno, l.rpm, l.flujoIn, l.flujoRet, l.consumoGh, l.totalGal, l.odometro, l.porcPaso]),
    );
  };

  return (
    <div>
      <div className="mp-header">
        <span className="mp-header-icon"><Icon name="database" className="h-5 w-5" /></span>
        <div>
          <h1 className="mp-header-title">Registros de telemetría</h1>
          <p className="mp-header-subtitle">Flujo, temperatura, RPM y trazado de ruta</p>
        </div>
      </div>

      <div className="mp-filter-bar">
        <div className="mp-filter-group mp-filter-group-grow">
          <label className="mp-filter-label">Unidad</label>
          <select value={maquinariaId ?? ""} onChange={(e) => setMaquinariaId(Number(e.target.value))} className="mp-filter-input" disabled={!conDispositivo.length}>
            {!conDispositivo.length && <option value="">Ninguna unidad con dispositivo</option>}
            {conDispositivo.map((u) => <option key={u.id} value={u.id}>{u.identificador}</option>)}
          </select>
        </div>
        <div className="mp-filter-group">
          <label className="mp-filter-label">Desde</label>
          <input type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className="mp-filter-input" />
        </div>
        <div className="mp-filter-group">
          <label className="mp-filter-label">Hasta</label>
          <input type="date" value={hasta} min={desde} max={hoyISO()} onChange={(e) => setHasta(e.target.value)} className="mp-filter-input" />
        </div>
        <div className="mp-filter-actions">
          <button type="button" onClick={buscar} disabled={isFetching || !maquinariaId} className="mp-btn-buscar">{isFetching ? "Cargando..." : "Buscar"}</button>
          <button type="button" onClick={exportar} disabled={!filtradas.length} className="mp-btn-exportar">Exportar CSV</button>
          <button type="button" onClick={() => setVerEnMapa(true)} disabled={!lecturas.length} className="mp-btn-cargar-mapa">Ver en mapa</button>
        </div>
      </div>

      {(errorRango || error) && <p className="mb-3 text-sm text-red-400">{errorRango ?? mensajeError(error)}</p>}
      {verEnMapa && <p className="mp-map-status">✓ {lecturas.filter((l) => l.lat !== null).length} puntos con posición trazados en el mapa</p>}

      <div ref={wrapperRef} className={`mp-map-wrapper relative ${pantallaCompleta ? "h-screen" : "mp-map-wrapper-normal"}`}>
        <MapaControles capa={capa} onCapa={setCapa} pantallaCompleta={pantallaCompleta} onPantallaCompleta={alternarPantallaCompleta} />
        <div ref={contenedorRef} style={{ height: "100%", width: "100%" }} />
      </div>

      <div className="mp-table-container">
        <div className="mp-table-toolbar">
          <div className="mp-table-toolbar-left">
            <span>Mostrar</span>
            <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))}>
              <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
            </select>
            <span>registros</span>
          </div>
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar en tabla..." className="mp-table-search" />
        </div>
        <div className="mp-table-wrapper">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Ítem</th><th>Fecha y hora</th><th>Operador</th><th>Latitud</th><th>Longitud</th><th>Velocidad</th><th>Rumbo</th>
                <th>Temp. in</th><th>RPM</th><th>Flujo IN</th><th>Flujo RET</th><th>Consumo gal/h</th><th>Total gal</th><th>Odómetro</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length ? (
                visibles.map((l, i) => (
                  <tr key={l.id}>
                    <td className="mp-cell-muted">{inicio + i + 1}</td>
                    <td>{fechaHora(l.timestamp)}</td>
                    <td className="whitespace-nowrap font-medium text-slate-300">{l.operador ?? "—"}</td>
                    <td style={{ color: "#00ebb0", fontWeight: 600 }}>{l.lat?.toFixed(6) ?? "—"}</td>
                    <td style={{ color: "#00ebb0", fontWeight: 600 }}>{l.lng?.toFixed(6) ?? "—"}</td>
                    <td>{num(l.velocidad, 1)}</td>
                    <td>{num(l.rumbo)}</td>
                    <td>{num(l.temIngreso, 1)}</td>
                    <td className="mp-cell-bold">{num(l.rpm)}</td>
                    <td>{num(l.flujoIn, 1)}</td>
                    <td>{num(l.flujoRet, 1)}</td>
                    <td style={{ color: "#00ebb0", fontWeight: 600 }}>{num(l.consumoGh, 1)}</td>
                    <td>{num(l.totalGal)}</td>
                    <td>{num(l.odometro)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="mp-table-empty">
                    {!consulta ? "Elige una unidad y un rango de fechas y presiona Buscar." : isFetching ? "Cargando..." : lecturas.length ? "Ningún registro coincide con la búsqueda." : "No hay lecturas en ese rango."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mp-pagination">
          <span className="mp-pagination-info">
            Mostrando {filtradas.length ? inicio + 1 : 0} a {Math.min(inicio + porPagina, filtradas.length)} de {filtradas.length.toLocaleString("es-PE")} registros
          </span>
          <div className="mp-pagination-buttons">
            <button type="button" className="mp-page-btn" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>‹</button>
            <span className="mp-page-btn mp-page-btn-active">{pagina} / {totalPaginas}</span>
            <button type="button" className="mp-page-btn" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
