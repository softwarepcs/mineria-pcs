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

/* ───────────── Coordenadas escritas a mano ───────────── */

export const latValida = (n: number) => Number.isFinite(n) && n >= -90 && n <= 90;
export const lngValida = (n: number) => Number.isFinite(n) && n >= -180 && n <= 180;

/** "-12.0464", "−12.0464" (signo unicode) o " 12.5 " → número; null si no es un número. */
export function parsearNumero(texto: string): number | null {
  const t = texto.trim().replace(/[−–]/g, "-");
  if (t === "" || !/^[-+]?\d+(\.\d+)?$|^[-+]?\.\d+$|^[-+]?\d+\.$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export interface ResultadoCoordenadas {
  puntos: LatLng[];
  errores: string[];
}

/**
 * Lee una lista de coordenadas, una por línea, en orden «latitud, longitud»
 * (el formato que copia Google Maps). Acepta coma, punto y coma, tabulador o espacio,
 * paréntesis/corchetes y el signo menos unicode. Si el último punto repite el primero
 * (polígono «cerrado») lo descarta.
 */
export function parsearCoordenadas(texto: string): ResultadoCoordenadas {
  const puntos: LatLng[] = [];
  const errores: string[] = [];
  texto.split(/\r?\n/).forEach((linea, i) => {
    if (!linea.trim()) return;
    const nums = linea.replace(/[−–]/g, "-").match(/[-+]?\d+(?:\.\d+)?|[-+]?\.\d+/g)?.map(Number) ?? [];
    if (nums.length !== 2) {
      errores.push(`Línea ${i + 1}: se esperaban 2 números (latitud, longitud) y hay ${nums.length}.`);
      return;
    }
    const [a, b] = nums;
    if (latValida(a) && lngValida(b)) puntos.push([a, b]);
    else if (latValida(b) && lngValida(a)) errores.push(`Línea ${i + 1}: parece «longitud, latitud». Escribe primero la latitud (entre −90 y 90).`);
    else errores.push(`Línea ${i + 1}: coordenada fuera de rango (latitud −90 a 90, longitud −180 a 180).`);
  });
  if (puntos.length > 3 && puntos[0][0] === puntos[puntos.length - 1][0] && puntos[0][1] === puntos[puntos.length - 1][1]) puntos.pop();
  return { puntos, errores };
}

const orientacion = (a: LatLng, b: LatLng, c: LatLng) => Math.sign((b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]));

function ladosSeCruzan(p1: LatLng, p2: LatLng, p3: LatLng, p4: LatLng): boolean {
  return orientacion(p1, p2, p3) !== orientacion(p1, p2, p4) && orientacion(p3, p4, p1) !== orientacion(p3, p4, p2);
}

/** true si dos lados no contiguos del polígono se cruzan (forma de «moño»): la geocerca detectaría mal. */
export function poligonoSeCruza(puntos: LatLng[]): boolean {
  const n = puntos.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue; // lados contiguos
      if (ladosSeCruzan(puntos[i], puntos[(i + 1) % n], puntos[j], puntos[(j + 1) % n])) return true;
    }
  }
  return false;
}
