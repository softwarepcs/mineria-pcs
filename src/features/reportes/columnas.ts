import type { FilaLectura } from "./api";

/**
 * Tabla de lecturas de Base de datos (pantalla y Excel). Mismo orden que la tabla:
 * placa, latitud, longitud, fecha, odómetro, gal/h, total_gal, caudal_ingreso, caudal_retorno, horómetro.
 * El horómetro son las horas acumuladas de motor.
 */
export const ENCABEZADOS_LECTURA = [
  "Placa", "Latitud", "Longitud", "Fecha", "Odómetro (km)", "Gal/h", "Total Gal", "Caudal Ingreso", "Caudal Retorno", "Horómetro (h)",
] as const;

/** Fila lista para Excel / tabla: la placa va primero, como en la tabla de origen. */
export const conPlaca = (placa: string, f: FilaLectura): (string | number | null)[] => [placa, ...f];
