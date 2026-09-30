import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarOperador,
  asignarUnidad,
  crearOperador,
  darDeBajaOperador,
  getOperador,
  getOperadores,
  getRendimiento,
  liberarUnidad,
  type CambiosOperador,
  type NuevoOperador,
} from "./api";
import { unidadesKeys } from "@/features/camiones/hooks";

export const operadoresKeys = {
  todos: ["operadores"] as const,
  lista: (empresaId: number) => ["operadores", "lista", empresaId] as const,
  detalle: (id: number) => ["operadores", "detalle", id] as const,
  rendimiento: (id: number, dias: number) => ["operadores", "rendimiento", id, dias] as const,
};

export function useOperadores(empresaId: number) {
  return useQuery({ queryKey: operadoresKeys.lista(empresaId), queryFn: () => getOperadores(empresaId) });
}

export function useOperador(id: number | null) {
  return useQuery({ queryKey: operadoresKeys.detalle(id ?? 0), queryFn: () => getOperador(id!), enabled: !!id });
}

export function useRendimiento(id: number | null, dias: 7 | 30 | 90 | 365) {
  return useQuery({ queryKey: operadoresKeys.rendimiento(id ?? 0, dias), queryFn: () => getRendimiento(id!, dias), enabled: !!id });
}

/** Tras cualquier cambio se refrescan operadores y unidades (el operador actual se ve en ambas). */
function useInvalidar() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: operadoresKeys.todos });
    void qc.invalidateQueries({ queryKey: unidadesKeys.todas });
  };
}

export function useCrearOperador() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (dto: NuevoOperador) => crearOperador(dto), onSuccess: invalidar });
}

export function useActualizarOperador() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: ({ id, dto }: { id: number; dto: CambiosOperador }) => actualizarOperador(id, dto), onSuccess: invalidar });
}

export function useDarDeBajaOperador() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (id: number) => darDeBajaOperador(id), onSuccess: invalidar });
}

export function useAsignarUnidad() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, maquinariaId, atribucion }: { id: number; maquinariaId: number; atribucion?: string }) => asignarUnidad(id, maquinariaId, atribucion),
    onSuccess: invalidar,
  });
}

export function useLiberarUnidad() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (id: number) => liberarUnidad(id), onSuccess: invalidar });
}
