import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarSedes, crearSede, actualizarSede, eliminarSede } from "./api";

export const sedesKeys = {
  lista: ["sedes"] as const,
};

export function useSedes() {
  return useQuery({
    queryKey: sedesKeys.lista,
    queryFn: listarSedes,
  });
}

export function useCrearSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crearSede,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sedesKeys.lista });
    },
  });
}

export function useActualizarSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => actualizarSede(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sedesKeys.lista });
    },
  });
}

export function useEliminarSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eliminarSede,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sedesKeys.lista });
    },
  });
}
