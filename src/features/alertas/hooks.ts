import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoAlerta,
  cambiarEstadoMasivo,
  getAlertaDetalle,
  getAlertasEventos,
  getAlertasGeocerca,
  getAlertasOperador,
  type EstadoAlerta,
  type FiltrosAlertas,
} from "./api";
import { empresasKeys } from "@/features/empresas/hooks";

export const alertasKeys = {
  todas: ["alertas"] as const,
  /** Prefijo de todas las listas de eventos (cualquier filtro) de una empresa. */
  eventosDe: (empresaId: number) => ["alertas", "eventos", empresaId] as const,
  eventos: (empresaId: number, filtros: FiltrosAlertas) => ["alertas", "eventos", empresaId, filtros] as const,
  detalle: (id: string) => ["alertas", "detalle", id] as const,
  geocercas: (empresaId: number) => ["alertas", "geocercas", empresaId] as const,
  operador: (id: number) => ["alertas", "operador", id] as const,
};

/** Lista paginada: cada `fetchNextPage` trae 50 más con los mismos filtros. */
export function useAlertasEventos(empresaId: number, filtros: FiltrosAlertas) {
  return useInfiniteQuery({
    queryKey: alertasKeys.eventos(empresaId, filtros),
    queryFn: ({ pageParam }) => getAlertasEventos(empresaId, filtros, pageParam),
    initialPageParam: 1,
    getNextPageParam: (ultima) => (ultima.hayMas ? ultima.page + 1 : undefined),
    refetchInterval: 60_000,
    // Al cambiar de filtro se sigue viendo la lista anterior hasta que llega la nueva
    placeholderData: (previa) => previa,
  });
}

export function useAlertaDetalle(id: string | null) {
  return useQuery({ queryKey: alertasKeys.detalle(id ?? ""), queryFn: () => getAlertaDetalle(id!), enabled: !!id });
}

export function useAlertasGeocerca(empresaId: number) {
  return useQuery({ queryKey: alertasKeys.geocercas(empresaId), queryFn: () => getAlertasGeocerca(empresaId), refetchInterval: 60_000 });
}

export function useAlertasOperador(operadorId: number | null) {
  return useQuery({ queryKey: alertasKeys.operador(operadorId ?? 0), queryFn: () => getAlertasOperador(operadorId!), enabled: !!operadorId });
}

/** Un cambio de estado mueve alertas entre listas (y cambia contadores): se recargan todas. */
function useRefrescarAlertas(empresaId: number) {
  const qc = useQueryClient();
  return (ids: string[]) => {
    void qc.invalidateQueries({ queryKey: alertasKeys.eventosDe(empresaId) });
    ids.forEach((id) => void qc.invalidateQueries({ queryKey: alertasKeys.detalle(id) }));
    // El contador de alertas abiertas del dashboard cambia
    void qc.invalidateQueries({ queryKey: empresasKeys.lista });
  };
}

export function useCambiarEstadoAlerta(empresaId: number) {
  const refrescar = useRefrescarAlertas(empresaId);
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoAlerta }) => cambiarEstadoAlerta(id, estado),
    onSuccess: ({ id }) => refrescar([id]),
  });
}

export function useCambiarEstadoMasivo(empresaId: number) {
  const refrescar = useRefrescarAlertas(empresaId);
  return useMutation({
    mutationFn: ({ ids, estado }: { ids: string[]; estado: EstadoAlerta }) => cambiarEstadoMasivo(ids, estado),
    onSuccess: (_r, { ids }) => refrescar(ids),
  });
}
