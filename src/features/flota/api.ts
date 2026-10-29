/**
 * Los 4 estados de una unidad (los calcula el backend, common/utils/estado-unidad.ts):
 * conduccion = "En ruta", ralenti, apagado (ignición apagada) y sin_senal ("Sin comunicación").
 */
export type EstadoFlota = "conduccion" | "ralenti" | "apagado" | "sin_senal";
