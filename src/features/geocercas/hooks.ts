import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarGeocerca, crearGeocerca, eliminarGeocerca, getGeocercas, type Geocerca, type GeocercaDto } from "./api";

export const geocercasKeys = {
  todas: ["geocercas"] as const,
  lista: (empresaId: number) => ["geocercas", empresaId] as const,
};

export function useGeocercas(empresaId: number) {
  return useQuery({ queryKey: geocercasKeys.lista(empresaId), queryFn: () => getGeocercas(empresaId) });
}

export function useCrearGeocerca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: GeocercaDto) => crearGeocerca(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: geocercasKeys.todas }),
  });
}

export function useActualizarGeocerca(empresaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: GeocercaDto }) => actualizarGeocerca(id, dto),
    // Actualización optimista solo para activar/desactivar, que es instantáneo en la UI
    onMutate: async ({ id, dto }) => {
      if (Object.keys(dto).length !== 1 || dto.activa === undefined) return;
      await qc.cancelQueries({ queryKey: geocercasKeys.lista(empresaId) });
      const previa = qc.getQueryData<Geocerca[]>(geocercasKeys.lista(empresaId));
      qc.setQueryData<Geocerca[]>(geocercasKeys.lista(empresaId), (l) => l?.map((g) => (g.id === id ? { ...g, activa: dto.activa! } : g)));
      return { previa };
    },
    onError: (_e, _v, ctx) => ctx?.previa && qc.setQueryData(geocercasKeys.lista(empresaId), ctx.previa),
    onSettled: () => qc.invalidateQueries({ queryKey: geocercasKeys.todas }),
  });
}

export function useEliminarGeocerca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarGeocerca(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: geocercasKeys.todas }),
  });
}
