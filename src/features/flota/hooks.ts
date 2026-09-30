import { useQuery } from "@tanstack/react-query";
import { getFlotaDashboard, type Periodo } from "./api";

export const flotaKeys = {
  dashboard: (empresaId: number, dias: Periodo) => ["flota", empresaId, dias] as const,
};

export function useFlotaDashboard(empresaId: number, dias: Periodo) {
  return useQuery({
    queryKey: flotaKeys.dashboard(empresaId, dias),
    queryFn: () => getFlotaDashboard(empresaId, dias),
    refetchInterval: 60_000,
  });
}
