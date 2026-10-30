import { useEffect, useMemo, useRef, type ReactNode } from "react";
import L from "leaflet";
import type { Unidad } from "@/features/camiones/api";
import type { EstadoFlota } from "@/features/flota/api";
import { ESTADO_UNIDAD, textoEstado } from "@/features/flota/estado";
import type { Geocerca } from "@/features/geocercas/api";
import { useLeafletMap, ajustarVista } from "@/shared/map/useLeafletMap";
import { useFullscreen } from "@/shared/map/useFullscreen";
import { MapaControles } from "@/shared/map/MapaControles";
import { colorSeguro, escapeHtml } from "@/shared/utils/escapeHtml";
import { fechaHora, num } from "@/shared/utils/formato";
import { FUNCIONES } from "@/app/funciones";

function icono(placa: string, estado: EstadoFlota, seleccionado: boolean) {
  const color = ESTADO_UNIDAD[estado].color;
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;align-items:center;gap:6px;transform:translate(-11px,-11px);white-space:nowrap;font-family:Barlow,sans-serif;">
        <span style="flex:none;width:16px;height:16px;border-radius:9999px;background:${color};border:3px solid #02111C;box-shadow:0 0 0 2px ${color};display:inline-block;"></span>
        <span style="background:#02111C;border:1px solid ${seleccionado ? "#2BC4E8" : "#1E3850"};border-radius:6px;padding:2px 7px;font-size:12.5px;font-weight:600;color:#fff;">${escapeHtml(placa)}</span>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [0, 0],
    popupAnchor: [0, -12],
  });
}

function popup(u: Unidad, conEnlace: boolean, tz: string): string {
  const t = u.telemetria;
  const linea = (txt: string, color = "#C9D6E3") => `<div style="color:${color};">${escapeHtml(txt)}</div>`;
  const camion = [[u.marca, u.modelo].filter(Boolean).join(" "), FUNCIONES.operadores ? u.operadorActual?.nombre : null].filter(Boolean).join(" · ");
  return `
    <div style="font-family:Barlow,sans-serif;font-size:13px;line-height:1.55;min-width:250px;">
      <div style="display:flex;align-items:center;gap:7px;font-weight:600;color:#fff;font-size:14px;">
        <span style="width:9px;height:9px;border-radius:9999px;background:${ESTADO_UNIDAD[u.estado].color};display:inline-block;"></span>
        ${escapeHtml(u.placa)} · ${escapeHtml(textoEstado(u.estado, u.estadoDesde))}
      </div>
      ${camion ? linea(camion) : ""}
      ${u.geocercaActual ? linea(`Zona ${u.geocercaActual.nombre}`) : ""}
      ${t ? linea(`Consumo ${num(t.consumoInstantaneo ?? null, 1)} gal/h · Velocidad ${num(t.velocidad ?? null, 0)} km/h`) : ""}
      ${t ? linea(`Galones (T) ${num(t.consumoAcumulado ?? null, 2)} gal`) : ""}
      ${linea(`Último dato ${fechaHora(u.ultimaConexion, tz)}`, "#8FA3B8")}
      ${conEnlace ? `<a href="#" data-ver-linea="1" style="font-size:13px;font-weight:600;color:#8FD9EE;">Ver línea de tiempo ›</a>` : ""}
    </div>`;
}

type ConPosicion = Unidad & { telemetria: NonNullable<Unidad["telemetria"]> & { lat: number; lng: number } };

export function HomeMapa({
  unidades,
  geocercas,
  seleccionadaId,
  onSeleccionar,
  onVerLinea,
  zonaHoraria,
  superpuestos,
}: {
  unidades: Unidad[];
  geocercas: Geocerca[];
  seleccionadaId: number | null;
  onSeleccionar: (id: number) => void;
  /** Enlace "Ver línea de tiempo ›" del recuadro de cada camión. */
  onVerLinea?: () => void;
  zonaHoraria: string;
  /** Paneles que se dibujan encima del mapa (estado de la flota, últimas alertas). */
  superpuestos?: ReactNode;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const marcadoresRef = useRef<Record<number, L.Marker>>({});
  const { mapa, capa, setCapa } = useLeafletMap(contenedorRef);
  const { pantallaCompleta, alternarPantallaCompleta } = useFullscreen(wrapperRef);

  const conPosicion = useMemo(
    () => unidades.filter((u): u is ConPosicion => u.telemetria?.lat != null && u.telemetria?.lng != null),
    [unidades],
  );
  const activas = useMemo(() => geocercas.filter((g) => g.activa), [geocercas]);

  // Geocercas (polígonos y círculos) con su nombre
  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    activas.forEach((g) => {
      const color = colorSeguro(g.color);
      const estilo = { color, weight: 2, fillColor: color, fillOpacity: 0.16 };
      let capaG: L.Layer | null = null;
      let centro: [number, number] | null = null;
      if (g.tipo === "CIRCULO" && g.centro && g.radio) {
        capaG = L.circle(g.centro, { ...estilo, radius: g.radio });
        centro = g.centro;
      } else if (g.tipo === "POLIGONO" && g.puntos.length >= 3) {
        capaG = L.polygon(g.puntos, estilo);
        centro = [g.puntos.reduce((s, p) => s + p[0], 0) / g.puntos.length, g.puntos.reduce((s, p) => s + p[1], 0) / g.puntos.length];
      }
      if (capaG && centro) {
        capaG.addTo(grupo);
      }
    });
    return () => {
      grupo.remove();
    };
  }, [mapa, activas]);

  // Camiones
  useEffect(() => {
    if (!mapa) return;
    const grupo = L.layerGroup().addTo(mapa);
    marcadoresRef.current = {};
    conPosicion.forEach((u) => {
      marcadoresRef.current[u.id] = L.marker([u.telemetria.lat, u.telemetria.lng], { icon: icono(u.placa, u.estado, u.id === seleccionadaId) })
        .bindPopup(popup(u, !!onVerLinea, zonaHoraria), { className: "popup-oscuro" })
        .on("click", () => onSeleccionar(u.id))
        .addTo(grupo);
    });
    return () => {
      grupo.remove();
    };
  }, [mapa, conPosicion, seleccionadaId, onSeleccionar, onVerLinea, zonaHoraria]);

  // El recuadro es HTML de Leaflet: el enlace navega con el router en vez de recargar la página
  useEffect(() => {
    if (!mapa || !onVerLinea) return;
    const alAbrir = (e: L.PopupEvent) => {
      e.popup.getElement()?.querySelector("[data-ver-linea]")?.addEventListener("click", (ev) => {
        ev.preventDefault();
        onVerLinea();
      });
    };
    mapa.on("popupopen", alAbrir);
    return () => {
      mapa.off("popupopen", alAbrir);
    };
  }, [mapa, onVerLinea]);

  // Encuadre: al cargar y al cambiar la selección (el refresco periódico no mueve el mapa)
  const encuadradoRef = useRef<string | null>(null);
  useEffect(() => {
    if (!mapa) return;
    const clave = seleccionadaId ? `u${seleccionadaId}` : `todas:${conPosicion.map((u) => u.id).join(",")}`;
    if (encuadradoRef.current === clave) return;
    const sel = seleccionadaId ? conPosicion.find((u) => u.id === seleccionadaId) : undefined;
    if (sel) {
      encuadradoRef.current = clave;
      mapa.flyTo([sel.telemetria.lat, sel.telemetria.lng], 15, { duration: 0.8 });
      marcadoresRef.current[sel.id]?.openPopup();
      return;
    }
    const puntos: [number, number][] = [
      ...conPosicion.map((u) => [u.telemetria.lat, u.telemetria.lng] as [number, number]),
      ...activas.flatMap((g) => (g.centro ? [g.centro] : g.puntos)),
    ];
    if (puntos.length === 0) return;
    encuadradoRef.current = clave;
    mapa.closePopup();
    // Margen arriba para que los camiones no queden bajo el panel de estado
    // En pantallas medianas y grandes el panel de estado ocupa la esquina superior: se deja margen
    const conPanel = mapa.getSize().x >= 600;
    ajustarVista(mapa, puntos, 15, { paddingTopLeft: [40, conPanel ? 150 : 40], paddingBottomRight: [40, conPanel ? 40 : 60] });
  }, [mapa, seleccionadaId, conPosicion, activas]);

  const sinPosicion = unidades.length - conPosicion.length;

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden bg-[#0A1C2B] ${pantallaCompleta ? "h-screen" : "h-[60vh] min-h-[340px] sm:h-[580px] lg:h-[640px]"}`}
    >
      <MapaControles capa={capa} onCapa={setCapa} pantallaCompleta={pantallaCompleta} onPantallaCompleta={alternarPantallaCompleta} />
      {superpuestos}
      {sinPosicion > 0 && (
        <div className="pointer-events-none absolute bottom-12 left-3 z-[1000] rounded-md bg-[#02111C]/85 px-2.5 py-1 text-xs text-[#8FA3B8] sm:bottom-3.5 sm:left-4">
          {sinPosicion} camión{sinPosicion === 1 ? "" : "es"} sin posición GPS
        </div>
      )}
      <div ref={contenedorRef} className="h-full w-full" />
    </div>
  );
}
