import type { Geocerca } from "../types/geocerca";

export const DEFAULT_GEOCERCAS: Geocerca[] = [
  {
    id: "geo-1",
    nombre: "Avenida Central España",
    nombreColor: "#f97316",
    fontSize: "12 px",
    recurso: "rigel_teste_mgr",
    descripcion: "Avenida Central España, Panamá, Panama",
    grupo: "Ninguno",
    tipo: "circle",
    lat: 8.992859,
    lng: -79.554388,
    radio: 3475.78,
    areaHa: 3795.373,
    perimetroKm: 21.839,
    icono: "pin",
    color: "#00c4cc",
    colorVisible: true,
    visibilidadDe: 1,
    visibilidadA: 19,
    activa: true,
  },
  {
    id: "geo-2",
    nombre: "Cámara Playa",
    nombreColor: "#3b82f6",
    fontSize: "12 px",
    recurso: "rigel_teste_mgr",
    descripcion: "Monitoreo perimetral costero y zona de carga",
    grupo: "Ninguno",
    tipo: "circle",
    lat: 8.9482,
    lng: -79.5631,
    radio: 1520.0,
    areaHa: 725.833,
    perimetroKm: 9.55,
    icono: "camera",
    color: "#3b82f6",
    colorVisible: true,
    visibilidadDe: 1,
    visibilidadA: 19,
    activa: true,
  },
  {
    id: "geo-3",
    nombre: "Cámara Tráfico",
    nombreColor: "#10b981",
    fontSize: "12 px",
    recurso: "rigel_teste_mgr",
    descripcion: "Control de velocidad y flujo en cruce vial",
    grupo: "Ninguno",
    tipo: "circle",
    lat: 9.025,
    lng: -79.518,
    radio: 1100.0,
    areaHa: 380.132,
    perimetroKm: 6.911,
    icono: "camera",
    color: "#10b981",
    colorVisible: true,
    visibilidadDe: 1,
    visibilidadA: 19,
    activa: true,
  },
  {
    id: "geo-4",
    nombre: "Estadio",
    nombreColor: "#a855f7",
    fontSize: "12 px",
    recurso: "rigel_teste_mgr",
    descripcion: "Zona deportiva y perímetro de seguridad",
    grupo: "Ninguno",
    tipo: "circle",
    lat: 9.012,
    lng: -79.539,
    radio: 1950.0,
    areaHa: 1194.59,
    perimetroKm: 12.252,
    icono: "stadium",
    color: "#a855f7",
    colorVisible: true,
    visibilidadDe: 1,
    visibilidadA: 19,
    activa: true,
  },
  {
    id: "geo-5",
    nombre: "Expo",
    nombreColor: "#ec4899",
    fontSize: "12 px",
    recurso: "rigel_teste_mgr",
    descripcion: "Centro de convenciones y exposiciones mineras",
    grupo: "Ninguno",
    tipo: "circle",
    lat: 8.971,
    lng: -79.529,
    radio: 1350.0,
    areaHa: 572.555,
    perimetroKm: 8.482,
    icono: "building",
    color: "#ec4899",
    colorVisible: true,
    visibilidadDe: 1,
    visibilidadA: 19,
    activa: true,
  },
];

const STORAGE_KEY = "edge_smart_geocercas_v1";

export function getStoredGeocercas(): Geocerca[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GEOCERCAS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GEOCERCAS;
  } catch {
    return DEFAULT_GEOCERCAS;
  }
}

export function saveStoredGeocercas(geocercas: Geocerca[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(geocercas));
  } catch (err) {
    console.error("Error al guardar geocercas:", err);
  }
}

/** Calcula el área en hectáreas dado un radio en metros */
export function calcularAreaHa(radioMetros: number): number {
  if (!radioMetros || radioMetros <= 0) return 0;
  const areaM2 = Math.PI * Math.pow(radioMetros, 2);
  return Number((areaM2 / 10000).toFixed(3));
}

/** Calcula el perímetro en km dado un radio en metros */
export function calcularPerimetroKm(radioMetros: number): number {
  if (!radioMetros || radioMetros <= 0) return 0;
  const perimetroM = 2 * Math.PI * radioMetros;
  return Number((perimetroM / 1000).toFixed(3));
}
