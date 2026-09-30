export type GeocercaTipo = "circle" | "polygon" | "line";

export interface Geocerca {
  id: string;
  nombre: string;
  descripcion: string;
  sedeId: number | null;
  tipo: GeocercaTipo;
  lat: number;
  lng: number;
  radio: number; // en metros
  areaHa: number; // en hectáreas
  perimetroKm: number; // en kilómetros
  puntos?: [number, number][]; // para polígonos o líneas
  color: string;
  fechaInicio: string;
  fechaExpiracion: string;
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
