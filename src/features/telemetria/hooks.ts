import { useQuery } from "@tanstack/react-query";
import { getLecturas, getLecturasSistema } from "./api";

export const telemetriaKeys = {
  rango: (id: number, desde: string, hasta: string) => ["telemetria", id, desde, hasta] as const,
  ultimasHoras: (id: number, horas: number) => ["telemetria", id, "ultimas", horas] as const,
};

/** Consulta manual (botón Buscar): se ejecuta solo cuando `params` no es null. */
export function useLecturas(params: { maquinariaId: number; desde: string; hasta: string } | null) {
  return useQuery({
    queryKey: params ? telemetriaKeys.rango(params.maquinariaId, params.desde, params.hasta) : ["telemetria", "inactiva"],
    queryFn: () => getLecturas(params!.maquinariaId, params!.desde, params!.hasta),
    enabled: !!params,
  });
}

/** Últimas N horas de una unidad, refrescadas cada minuto (gráficos del detalle). */
export function useLecturasRecientes(maquinariaId: number | null, horas: number) {
  return useQuery({
    queryKey: telemetriaKeys.ultimasHoras(maquinariaId ?? 0, horas),
    queryFn: () => {
      const hasta = new Date();
      const desde = new Date(hasta.getTime() - horas * 3600_000);
      return getLecturas(maquinariaId!, desde.toISOString(), hasta.toISOString(), 2000);
    },
    enabled: !!maquinariaId,
    refetchInterval: 60_000,
  });
}

/** Lecturas de un sistema de la unidad (motor, frío, fluidos…), refrescadas cada minuto. */
export function useLecturasSistema(maquinariaId: number | null, sistemaId: number | null, horas: number) {
  return useQuery({
    queryKey: ["telemetria", maquinariaId, "sistema", sistemaId, horas] as const,
    queryFn: () => getLecturasSistema(maquinariaId!, sistemaId!, horas),
    enabled: !!maquinariaId && !!sistemaId,
    refetchInterval: 60_000,
  });
}
