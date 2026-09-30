import { useQuery } from "@tanstack/react-query";
import { listarEmpresas, obtenerEmpresa } from "./api";

export const empresasKeys = {
  lista: ["empresas"] as const,
  detalle: (id: number) => ["empresas", id] as const,
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
