import { apiClient } from "@/utils/apiClient";

// Usaremos el tipo del frontend
import type { Geocerca } from "@/types/geocerca";

// Mapear backend a frontend
function mapBackendToGeocerca(data: any): Geocerca {
  const coord = typeof data.coordenadas === 'string' ? JSON.parse(data.coordenadas) : (data.coordenadas || {});
  return {
    id: data.id.toString(),
    nombre: data.nombre,
    nombreColor: "#f97316",
    fontSize: "12 px",
    recurso: "N/A",
    descripcion: data.descripcion || "",
    grupo: "Ninguno",
    tipo: data.tipo === "POLIGONO" ? "polygon" : (data.tipo === "LINEA" ? "line" : "circle"),
    lat: coord.lat || 0,
    lng: coord.lng || 0,
    radio: data.radio || 0,
    areaHa: 0,
    perimetroKm: 0,
    puntos: coord.puntos,
    icono: "pin",
    color: data.color || "#00c4cc",
    colorVisible: true,
    visibilidadDe: 1,
    visibilidadA: 19,
    activa: data.activa ?? true,
    empresaId: data.sedeId
  };
}

// Mapear frontend a backend
function mapGeocercaToBackend(data: Partial<Geocerca>) {
  return {
    sedeId: data.empresaId || 1, // Por defecto
    nombre: data.nombre,
    descripcion: data.descripcion,
    tipo: data.tipo === "polygon" ? "POLIGONO" : "CIRCULO",
    color: data.color,
    radio: data.radio,
    coordenadas: {
      lat: data.lat,
      lng: data.lng,
      puntos: data.puntos
    },
    activa: data.activa
  };
}

export async function getGeocercas(): Promise<Geocerca[]> {
  const response = await apiClient.get("/geocercas");
  const list = response.data.data || response.data || [];
  return list.map(mapBackendToGeocerca);
}

export async function crearGeocerca(data: Omit<Geocerca, 'id'>): Promise<Geocerca> {
  const response = await apiClient.post("/geocercas", mapGeocercaToBackend(data));
  return mapBackendToGeocerca(response.data.data || response.data);
}

export async function actualizarGeocerca(id: string, data: Partial<Geocerca>): Promise<Geocerca> {
  const response = await apiClient.patch(`/geocercas/${id}`, mapGeocercaToBackend(data));
  return mapBackendToGeocerca(response.data.data || response.data);
}

export async function eliminarGeocerca(id: string): Promise<void> {
  await apiClient.delete(`/geocercas/${id}`);
}
