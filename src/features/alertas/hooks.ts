import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cambiarEstadoAlerta, getAlertaDetalle, getAlertasEventos, getAlertasGeocerca, getAlertasOperador, type AlertaEvento, type EstadoAlerta } from "./api";
import { empresasKeys } from "@/features/empresas/hooks";

export const alertasKeys = {
  todas: ["alertas"] as const,
  eventos: (empresaId: number) => ["alertas", "eventos", empresaId] as const,
  detalle: (id: string) => ["alertas", "detalle", id] as const,
  geocercas: (empresaId: number) => ["alertas", "geocercas", empresaId] as const,
  operador: (id: number) => ["alertas", "operador", id] as const,
};

export function useAlertasEventos(empresaId: number) {
  return useQuery({ queryKey: alertasKeys.eventos(empresaId), queryFn: () => getAlertasEventos(empresaId), refetchInterval: 60_000 });
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

export function useCambiarEstadoAlerta(empresaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoAlerta }) => cambiarEstadoAlerta(id, estado),
    onSuccess: ({ id, estado }) => {
      qc.setQueryData<AlertaEvento[]>(alertasKeys.eventos(empresaId), (lista) => lista?.map((a) => (a.id === id ? { ...a, estado } : a)));
      void qc.invalidateQueries({ queryKey: alertasKeys.detalle(id) });
      // El contador de alertas abiertas del dashboard cambia
      void qc.invalidateQueries({ queryKey: empresasKeys.lista });
    },
  });
}
