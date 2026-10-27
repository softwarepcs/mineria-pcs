import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getLecturas, getRecorrido, getReporteEventos, type PeriodoReporte } from "./api";

export const reportesKeys = {
  eventos: (empresaId: number, periodo: PeriodoReporte, maquinariaId: number | null) =>
    ["reportes", "eventos", empresaId, periodo, maquinariaId] as const,
  recorrido: (empresaId: number, maquinariaId: number, desde: string, hasta: string) =>
    ["reportes", "recorrido", empresaId, maquinariaId, desde, hasta] as const,
};

/** La ventana termina "ahora" en el servidor: cada refetch (60 s) la desplaza. */
export function useReporteEventos(empresaId: number, periodo: PeriodoReporte, maquinariaId: number | null) {
  return useQuery({
    queryKey: reportesKeys.eventos(empresaId, periodo, maquinariaId),
    queryFn: () => getReporteEventos(empresaId, periodo, maquinariaId),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: "always",
    placeholderData: keepPreviousData,
  });
}

/** Solo se consulta al pulsar "Buscar": `buscar` es null hasta entonces. */
export function useRecorrido(empresaId: number, buscar: { maquinariaId: number; desde: string; hasta: string } | null) {
  return useQuery({
    queryKey: buscar ? reportesKeys.recorrido(empresaId, buscar.maquinariaId, buscar.desde, buscar.hasta) : ["reportes", "recorrido", "nada"],
    queryFn: () => getRecorrido(empresaId, buscar!.maquinariaId, buscar!.desde, buscar!.hasta),
    enabled: !!buscar,
  });
}

/** Tabla de lecturas de la consulta, de a `limite` filas. */
export function useLecturas(empresaId: number, buscar: { maquinariaId: number; desde: string; hasta: string } | null, pagina: number, limite: number) {
  return useQuery({
    queryKey: ["reportes", "lecturas", empresaId, buscar, pagina, limite],
    queryFn: () => getLecturas(empresaId, buscar!.maquinariaId, buscar!.desde, buscar!.hasta, pagina, limite),
    enabled: !!buscar,
    placeholderData: keepPreviousData,
  });
}
