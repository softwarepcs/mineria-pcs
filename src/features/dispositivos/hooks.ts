import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstalaciones, getSistemas, instalarDispositivo, retirarDispositivo, type NuevaInstalacion } from "./api";
import { unidadesKeys } from "@/features/camiones/hooks";

export const dispositivosKeys = {
  todos: ["dispositivos"] as const,
  sistemas: ["dispositivos", "sistemas"] as const,
  instalaciones: (empresaId: number, soloActivas: boolean) => ["dispositivos", empresaId, soloActivas] as const,
};

export function useSistemas() {
  return useQuery({ queryKey: dispositivosKeys.sistemas, queryFn: getSistemas, staleTime: 10 * 60_000 });
}

export function useInstalaciones(empresaId: number, soloActivas: boolean) {
  return useQuery({ queryKey: dispositivosKeys.instalaciones(empresaId, soloActivas), queryFn: () => getInstalaciones(empresaId, soloActivas) });
}

function useInvalidar() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: dispositivosKeys.todos });
    void qc.invalidateQueries({ queryKey: unidadesKeys.todas });
  };
}

export function useInstalarDispositivo() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (dto: NuevaInstalacion) => instalarDispositivo(dto), onSuccess: invalidar });
}

export function useRetirarDispositivo() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (id: number) => retirarDispositivo(id), onSuccess: invalidar });
}
