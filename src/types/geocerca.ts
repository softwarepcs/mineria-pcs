export type GeocercaTipo = "circle" | "polygon" | "line";

export interface Geocerca {
  id: string;
  nombre: string;
  nombreColor: string;
  fontSize: string;
  recurso: string;
  descripcion: string;
  grupo: string;
  tipo: GeocercaTipo;
  lat: number;
  lng: number;
  radio: number; // en metros
  areaHa: number; // en hectáreas
  perimetroKm: number; // en kilómetros
  puntos?: [number, number][]; // para polígonos o líneas
  icono: string;
  color: string;
  colorVisible: boolean;
  visibilidadDe: number;
  visibilidadA: number;
  activa: boolean;
  empresaId?: number | null;
}

export interface GeocercaGrupo {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  geocercasCount?: number;
}
