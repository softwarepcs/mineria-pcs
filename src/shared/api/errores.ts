import { isAxiosError } from "axios";

/** Mensaje legible a partir de un error de la API (NestJS devuelve message como texto o lista). */
export function mensajeError(err: unknown, porDefecto = "Ocurrió un error inesperado."): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(". ");
    if (typeof msg === "string" && msg) return msg;
    if (!err.response) return "No se pudo conectar con el servidor.";
  }
  if (err instanceof Error && err.message) return err.message;
  return porDefecto;
}
