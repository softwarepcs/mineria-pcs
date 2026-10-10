import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearUnidad,
  actualizarUnidad,
  getConfiguracion,
  getHistorialOperadores,
  getSistemasUnidad,
  getTiposMaquinaria,
  getUnidades,
  guardarConfiguracion,
  type Configuracion,
  type NuevaUnidad,
} from "./api";

export const unidadesKeys = {
  todas: ["unidades"] as const,
  lista: (empresaId: number | undefined) => ["unidades", empresaId ?? "todas"] as const,
  tipos: ["unidades", "tipos"] as const,
  historial: (id: number) => ["unidades", "historial", id] as const,
  sistemas: (id: number) => ["unidades", "sistemas", id] as const,
  configuracion: (id: number) => ["unidades", "configuracion", id] as const,
};

/** Unidades con estado en vivo; se refresca cada 30 s. */
export function useUnidades(empresaId: number | undefined) {
  return useQuery({
    queryKey: unidadesKeys.lista(empresaId),
    queryFn: () => getUnidades(empresaId),
    refetchInterval: 30_000,
  });
}

export function useTiposMaquinaria() {
  return useQuery({ queryKey: unidadesKeys.tipos, queryFn: getTiposMaquinaria, staleTime: 10 * 60_000 });
}

export function useCrearUnidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: NuevaUnidad) => crearUnidad(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: unidadesKeys.todas }),
  });
}

export function useActualizarUnidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<NuevaUnidad> }) => actualizarUnidad(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: unidadesKeys.todas }),
  });
}

export function useHistorialOperadores(maquinariaId: number | null) {
  return useQuery({
    queryKey: unidadesKeys.historial(maquinariaId ?? 0),
    queryFn: () => getHistorialOperadores(maquinariaId!),
    enabled: !!maquinariaId,
  });
}

export function useConfiguracion(maquinariaId: number | null) {
  return useQuery({
    queryKey: unidadesKeys.configuracion(maquinariaId ?? 0),
    queryFn: () => getConfiguracion(maquinariaId!),
    enabled: !!maquinariaId,
  });
}

export function useGuardarConfiguracion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<Configuracion, "maquinariaId"> }) => guardarConfiguracion(id, dto),
    onSuccess: (data) => {
      qc.setQueryData(unidadesKeys.configuracion(data.maquinariaId), data);
      // Cambia el objetivo y el precio del dashboard
      void qc.invalidateQueries({ queryKey: ["flota"] });
    },
  });
}

/** Sistemas instalados en la unidad (motor, frío…) con los campos que reporta cada uno. */
export function useSistemasUnidad(maquinariaId: number | null) {
  return useQuery({ queryKey: unidadesKeys.sistemas(maquinariaId ?? 0), queryFn: () => getSistemasUnidad(maquinariaId!), enabled: !!maquinariaId });
}
