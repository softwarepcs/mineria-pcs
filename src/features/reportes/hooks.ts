import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getReporteEventos, type PeriodoReporte } from "./api";

export const reportesKeys = {
  eventos: (empresaId: number, periodo: PeriodoReporte, maquinariaId: number | null) =>
    ["reportes", "eventos", empresaId, periodo, maquinariaId] as const,
};

/** La ventana termina "ahora" en el servidor: cada refetch (60 s) la desplaza. */
export function useReporteEventos(empresaId: number, periodo: PeriodoReporte, maquinariaId: number | null) {
  return useQuery({
    queryKey: reportesKeys.eventos(empresaId, periodo, maquinariaId),
    queryFn: () => getReporteEventos(empresaId, periodo, maquinariaId),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}
