import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarEmpresas, obtenerEmpresa, obtenerEmpresaPorToken } from "./api";

export const empresasKeys = {
  lista: ["empresas"] as const,
  detalle: (id: number) => ["empresas", id] as const,
  detalleToken: (token: string) => ["empresas", "token", token] as const,
};

export function useEmpresas(habilitado = true) {
  return useQuery({ queryKey: empresasKeys.lista, queryFn: listarEmpresas, enabled: habilitado });
}

export function useEmpresa(id: number | null | undefined) {
  return useQuery({
    queryKey: empresasKeys.detalle(id ?? 0),
    queryFn: () => obtenerEmpresa(id!),
    enabled: !!id,
  });
}

export function useEmpresaPorToken(token: string | null | undefined) {
  return useQuery({
    queryKey: empresasKeys.detalleToken(token ?? ""),
    queryFn: () => obtenerEmpresaPorToken(token!),
    enabled: !!token,
  });
}

export function useCrearEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => import("./api").then((m) => m.crearEmpresa(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: empresasKeys.lista });
    },
  });
}

export function useActualizarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => import("./api").then((m) => m.actualizarEmpresa(id, data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: empresasKeys.lista });
      qc.invalidateQueries({ queryKey: empresasKeys.detalle(id) });
    },
  });
}

export function useCambiarEstadoEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: boolean }) => import("./api").then((m) => m.cambiarEstadoEmpresa(id, estado)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: empresasKeys.lista });
      qc.invalidateQueries({ queryKey: empresasKeys.detalle(id) });
    },
  });
}

export function useEliminarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => import("./api").then((m) => m.eliminarEmpresa(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: empresasKeys.lista });
    },
  });
}
