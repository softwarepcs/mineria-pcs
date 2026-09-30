/** Coordenada [lat, lng]. */
export type LatLng = [number, number];

const R = 6_371_000; // radio medio de la Tierra en metros
const rad = (g: number) => (g * Math.PI) / 180;

/** Distancia haversine en metros. */
export function distanciaMetros([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Perímetro de un polígono cerrado (suma de lados, incluido el último → primero). */
export function perimetroPoligonoM(puntos: LatLng[]): number {
  if (puntos.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < puntos.length; i++) total += distanciaMetros(puntos[i], puntos[(i + 1) % puntos.length]);
  return total;
}

/**
 * Área de un polígono en m² sobre la esfera (fórmula de Chamberlain & Duquette,
 * la misma que usa Leaflet.draw). Error < 0,5 % para geocercas de pocos km.
 */
export function areaPoligonoM2(puntos: LatLng[]): number {
  if (puntos.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < puntos.length; i++) {
    const [lat1, lng1] = puntos[i];
    const [lat2, lng2] = puntos[(i + 1) % puntos.length];
    area += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((area * R * R) / 2);
}

export const areaCirculoM2 = (radioM: number) => Math.PI * radioM * radioM;
export const perimetroCirculoM = (radioM: number) => 2 * Math.PI * radioM;

/** Punto dentro de polígono (ray casting; válido para geocercas que no cruzan el antimeridiano). */
export function dentroDePoligono([lat, lng]: LatLng, puntos: LatLng[]): boolean {
  let dentro = false;
  for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
    const [yi, xi] = puntos[i];
    const [yj, xj] = puntos[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
