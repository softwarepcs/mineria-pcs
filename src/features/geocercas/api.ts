import { apiClient } from "@/shared/api/client";
import type { LatLng } from "@/shared/utils/geometria";

export type TipoGeocerca = "CIRCULO" | "POLIGONO";

/** Geocerca en el frontend: coordenadas como [lat, lng] (formato Leaflet). */
export interface Geocerca {
  id: number;
  sedeId: number;
  sede: string;
  empresaId: number;
  nombre: string;
  descripcion: string;
  tipo: TipoGeocerca;
  color: string;
  /** Centro del círculo; null en polígonos. */
  centro: LatLng | null;
  radio: number | null;
  /** Vértices del polígono, sin repetir el primero al final. */
  puntos: LatLng[];
  fechaInicio: string | null;
  fechaExpiracion: string | null;
  activa: boolean;
}

/** Lo que edita el formulario. */
export interface GeocercaValores {
  nombre: string;
  descripcion: string;
  sedeId: number | null;
  tipo: TipoGeocerca;
  color: string;
  centro: LatLng | null;
  radio: number | null;
  puntos: LatLng[];
  fechaInicio: string | null;
  fechaExpiracion: string | null;
}

interface GeoJsonPunto { type: "Point"; coordinates: [number, number] }
interface GeoJsonPoligono { type: "Polygon"; coordinates: [number, number][][] }

interface GeocercaApi {
  id: number;
  sedeId: number;
  nombre: string;
  descripcion: string | null;
  tipo: TipoGeocerca;
  color: string | null;
  radio: number | null;
  coordenadas: GeoJsonPunto | GeoJsonPoligono | Record<string, never>;
  fechaInicio: string | null;
  fechaExpiracion: string | null;
  activa: boolean;
  sede: { nombre: string; empresaId: number };
}

/** Cuerpo que acepta el backend (CreateGeocercaDto / UpdateGeocercaDto). */
export interface GeocercaDto {
  sedeId?: number;
  nombre?: string;
  descripcion?: string;
  tipo?: TipoGeocerca;
  color?: string;
  radio?: number | null;
  coordenadas?: GeoJsonPunto | GeoJsonPoligono;
  fechaInicio?: string | null;
  fechaExpiracion?: string | null;
  activa?: boolean;
}

function desdeApi(g: GeocercaApi): Geocerca {
  let centro: LatLng | null = null;
  let puntos: LatLng[] = [];
  const c = g.coordenadas as GeoJsonPunto | GeoJsonPoligono;
  if (c?.type === "Point") {
    centro = [c.coordinates[1], c.coordinates[0]];
  } else if (c?.type === "Polygon") {
    const anillo = c.coordinates[0] ?? [];
    puntos = anillo.map(([lng, lat]) => [lat, lng] as LatLng);
    const [p0, pN] = [puntos[0], puntos[puntos.length - 1]];
    if (puntos.length > 1 && p0[0] === pN[0] && p0[1] === pN[1]) puntos.pop();
  }
  return {
    id: g.id,
    sedeId: g.sedeId,
    sede: g.sede.nombre,
    empresaId: g.sede.empresaId,
    nombre: g.nombre,
    descripcion: g.descripcion ?? "",
    tipo: g.tipo,
    color: g.color ?? "#00c4cc",
    centro,
    radio: g.radio,
    puntos,
    fechaInicio: g.fechaInicio,
    fechaExpiracion: g.fechaExpiracion,
    activa: g.activa,
  };
}

/** Geometría en GeoJSON ([lng, lat]); el anillo del polígono se cierra repitiendo el primer vértice. */
export function geometriaDto(v: Pick<GeocercaValores, "tipo" | "centro" | "radio" | "puntos">): Pick<GeocercaDto, "tipo" | "coordenadas" | "radio"> {
  if (v.tipo === "CIRCULO") {
    return {
      tipo: "CIRCULO",
      radio: v.radio,
      coordenadas: { type: "Point", coordinates: v.centro ? [v.centro[1], v.centro[0]] : [0, 0] },
    };
  }
  const anillo = v.puntos.map(([lat, lng]) => [lng, lat] as [number, number]);
  if (anillo.length) anillo.push(anillo[0]);
  return { tipo: "POLIGONO", radio: null, coordenadas: { type: "Polygon", coordinates: [anillo] } };
}

const aIso = (local: string | null) => (local ? new Date(local).toISOString() : null);

export function crearDto(v: GeocercaValores): GeocercaDto {
  return {
    sedeId: v.sedeId ?? undefined,
    nombre: v.nombre.trim(),
    descripcion: v.descripcion.trim() || undefined,
    color: v.color,
    fechaInicio: aIso(v.fechaInicio) ?? undefined,
    fechaExpiracion: aIso(v.fechaExpiracion) ?? undefined,
    activa: true,
    ...geometriaDto(v),
  };
}

/**
 * PATCH con solo lo que cambió. La geometría (tipo, coordenadas, radio) viaja junta
 * si cambió cualquiera de sus partes; si no, no se envía y el backend no la toca.
 */
export function cambiosDto(original: Geocerca, v: GeocercaValores): GeocercaDto {
  const dto: GeocercaDto = {};
  if (v.nombre.trim() !== original.nombre) dto.nombre = v.nombre.trim();
  if (v.descripcion.trim() !== original.descripcion) dto.descripcion = v.descripcion.trim();
  if (v.sedeId && v.sedeId !== original.sedeId) dto.sedeId = v.sedeId;
  if (v.color !== original.color) dto.color = v.color;

  const mismaFecha = (a: string | null, b: string | null) => (a ? new Date(a).getTime() : null) === (b ? new Date(b).getTime() : null);
  if (!mismaFecha(aIso(v.fechaInicio), original.fechaInicio)) dto.fechaInicio = aIso(v.fechaInicio);
  if (!mismaFecha(aIso(v.fechaExpiracion), original.fechaExpiracion)) dto.fechaExpiracion = aIso(v.fechaExpiracion);

  const geometriaCambio =
    v.tipo !== original.tipo ||
    v.radio !== original.radio ||
    JSON.stringify(v.centro) !== JSON.stringify(original.centro) ||
    JSON.stringify(v.puntos) !== JSON.stringify(original.puntos);
  if (geometriaCambio) Object.assign(dto, geometriaDto(v));
  return dto;
}

export async function getGeocercas(empresaId: number): Promise<Geocerca[]> {
  const { data } = await apiClient.get<GeocercaApi[]>("/geocercas", { params: { empresaId } });
  return data.map(desdeApi);
}

export async function crearGeocerca(dto: GeocercaDto): Promise<Geocerca> {
  const { data } = await apiClient.post<GeocercaApi>("/geocercas", dto);
  return desdeApi({ ...data, sede: data.sede ?? { nombre: "", empresaId: 0 } });
}

export async function actualizarGeocerca(id: number, dto: GeocercaDto): Promise<void> {
  await apiClient.patch(`/geocercas/${id}`, dto);
}

export async function eliminarGeocerca(id: number): Promise<void> {
  await apiClient.delete(`/geocercas/${id}`);
}
