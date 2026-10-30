import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConfigAlertas,
  getHistorial,
  getUltimasConsumo,
  guardarConfigAlerta,
  type FiltroHistorial,
  type TipoAlerta,
  type TipoConfig,
} from "./api";

export const alertasKeys = {
  todas: ["alertas"] as const,
  historial: (empresaId: number, f: FiltroHistorial, page: number) => ["alertas", "historial", empresaId, f, page] as const,
  ultimas: (empresaId: number, situacion?: string) => ["alertas", "ultimas", empresaId, situacion ?? "todas"] as const,
  config: (empresaId: number) => ["alertas", "config", empresaId] as const,
};

/** Historial paginado. El filtro no lleva fechas móviles: quien llama las fija para no cambiar la clave a cada render. */
export function useHistorialAlertas(empresaId: number, f: FiltroHistorial, page: number, limite = 25) {
  return useQuery({
    queryKey: [...alertasKeys.historial(empresaId, f, page), limite],
    queryFn: () => getHistorial(empresaId, f, page, limite),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: "always",
    placeholderData: keepPreviousData,
  });
}

export function useUltimasConsumo(empresaId: number, situacion?: "ABIERTO" | "CERRADO", habilitado = true) {
  return useQuery({
    enabled: habilitado && empresaId > 0,
    queryKey: alertasKeys.ultimas(empresaId, situacion),
    queryFn: () => getUltimasConsumo(empresaId, situacion),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: "always",
    placeholderData: keepPreviousData,
  });
}

export function useConfigAlertas(empresaId: number, habilitado = true) {
  return useQuery({ queryKey: alertasKeys.config(empresaId), queryFn: () => getConfigAlertas(empresaId), enabled: habilitado });
}

/** Actualiza la activación o canal de plataforma de un tipo de alerta para la empresa e invalida su caché. */
export function useGuardarConfigAlerta(empresaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tipo, cambios }: { tipo: TipoAlerta; cambios: Partial<Pick<TipoConfig, "activa" | "canalPlataforma">> }) =>
      guardarConfigAlerta(empresaId, tipo, cambios),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertasKeys.config(empresaId) }),
  });
}

/** Cuántos camiones tienen ahora una alerta de consumo ABIERTO (campana y menú). */
export function useAlertasAbiertas(empresaId: number | null | undefined): number {
  const q = useUltimasConsumo(empresaId ?? 0, "ABIERTO", !!empresaId);
  return (q.data ?? []).filter((u) => u.alerta).length;
}
