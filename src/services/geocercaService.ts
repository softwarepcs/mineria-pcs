import { apiClient } from "@/utils/apiClient";

// Usaremos el tipo del frontend
import type { Geocerca } from "@/types/geocerca";

// Mapear backend a frontend
function mapBackendToGeocerca(data: any): Geocerca {
  const coord = typeof data.coordenadas === 'string' ? JSON.parse(data.coordenadas) : (data.coordenadas || {});
  
  let lat = 0;
  let lng = 0;
  let puntos: [number, number][] = [];

  if (coord.type === "Point" && Array.isArray(coord.coordinates)) {
    lng = coord.coordinates[0];
    lat = coord.coordinates[1];
  } else if (coord.type === "Polygon" && Array.isArray(coord.coordinates)) {
    const ring = coord.coordinates[0] || [];
    puntos = ring.map((pt: number[]) => [pt[1], pt[0]]);
    if (puntos.length > 0) {
      lat = puntos[0][0];
      lng = puntos[0][1];
    }
  } else if (coord.type === "LineString" && Array.isArray(coord.coordinates)) {
    puntos = coord.coordinates.map((pt: number[]) => [pt[1], pt[0]]);
    if (puntos.length > 0) {
      lat = puntos[0][0];
      lng = puntos[0][1];
    }
  }

  // Parse dates back to local input format "YYYY-MM-DDThh:mm"
  const formatForInput = (isoDate?: string) => {
    if (!isoDate) return "";
    return isoDate.substring(0, 16); // Extract "YYYY-MM-DDThh:mm"
  };

  return {
    id: data.id.toString(),
    nombre: data.nombre,
    sedeId: data.sedeId || 1,
    descripcion: data.descripcion || "",
    tipo: data.tipo === "POLIGONO" ? "polygon" : (data.tipo === "LINEA" ? "line" : "circle"),
    lat,
    lng,
    radio: Number(data.radio) || 0,
    areaHa: 0,
    perimetroKm: 0,
    puntos: puntos.length > 0 ? puntos : undefined,
    color: data.color || "#00c4cc",
    fechaInicio: formatForInput(data.fechaInicio),
    fechaExpiracion: formatForInput(data.fechaExpiracion),
    activa: data.activa ?? true,
    empresaId: data.sedeId
  };
}

// Mapear frontend a backend
function mapGeocercaToBackend(data: Partial<Geocerca>) {
  let coordenadas: any = {};
  const isPolygon = data.tipo === "polygon";
  const isLine = data.tipo === "line";
  
  if (isPolygon) {
    const ring = data.puntos?.map(pt => [pt[1], pt[0]]) || [];
    coordenadas = {
      type: "Polygon",
      coordinates: [ring]
    };
  } else if (isLine) {
    const lineCoords = data.puntos?.map(pt => [pt[1], pt[0]]) || [];
    coordenadas = {
      type: "LineString",
      coordinates: lineCoords
    };
  } else {
    coordenadas = {
      type: "Point",
      coordinates: [data.lng || 0, data.lat || 0]
    };
  }

  return {
    sedeId: data.sedeId || data.empresaId || 1,
    nombre: data.nombre,
    descripcion: data.descripcion,
    tipo: data.tipo === "polygon" ? "POLIGONO" : (data.tipo === "line" ? "LINEA" : "CIRCULO"),
    color: data.color,
    radio: data.radio ? Number(data.radio) : null,
    coordenadas,
    fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString() : undefined,
    fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion).toISOString() : undefined,
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
