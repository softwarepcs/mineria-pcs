import { useCallback, useState } from "react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useFlotaDashboard } from "@/features/flota/hooks";
import type { Periodo } from "@/features/flota/api";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { PeriodoSelector } from "@/shared/ui/PeriodoSelector";
import { FlotaKpis } from "./FlotaKpis";
import { FlotaMap } from "./FlotaMap";
import { FlotaTable } from "./FlotaTable";
import { FlotaDesvioChart } from "./FlotaDesvioChart";

const PERIODOS: { valor: Periodo; etiqueta: string }[] = [
  { valor: 1, etiqueta: "Hoy" },
  { valor: 7, etiqueta: "7 días" },
  { valor: 30, etiqueta: "30 días" },
  { valor: 90, etiqueta: "90 días" },
];

export function FlotaHome({ empresa }: { empresa: EmpresaDetalle }) {
  const [dias, setDias] = useState<Periodo>(30);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useFlotaDashboard(empresa.id, dias);

  const onSelect = useCallback((id: string | null) => setSelectedId(id || null), []);

  return (
    <div className="flex w-full max-w-full flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-white">{empresa.nombre}</h1>
        <PeriodoSelector opciones={PERIODOS} valor={dias} onCambiar={setDias} />
      </div>

      {isLoading ? (
        <Cargando texto="Cargando indicadores de flota..." />
      ) : error ? (
        <ErrorCarga error={error} onReintentar={() => void refetch()} />
      ) : !data || data.maquinarias.length === 0 ? (
        <SinDatos titulo="Esta empresa todavía no tiene unidades">Regístralas en Unidades y asígnales un dispositivo para empezar a recibir datos.</SinDatos>
      ) : (
        <>
          {!data.resumen.configurado && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Ninguna unidad tiene metas configuradas: el objetivo y el precio son los valores por defecto. Ajústalos en Métricas y Metas.
            </p>
          )}
          <FlotaKpis resumen={data.resumen} maquinarias={data.maquinarias} selectedId={selectedId} onReset={() => setSelectedId(null)} />
          <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
            <div className="w-full min-w-0">
              <FlotaMap maquinarias={data.maquinarias} selectedId={selectedId} onSelect={onSelect} />
            </div>
            <div className="w-full min-w-0">
              <FlotaTable maquinarias={data.maquinarias} selectedId={selectedId} onSelect={onSelect} mode="alerts" />
            </div>
          </div>
          <FlotaTable maquinarias={data.maquinarias} selectedId={selectedId} onSelect={onSelect} mode="full" />
          <FlotaDesvioChart maquinarias={data.maquinarias} objetivo={data.resumen.objetivoL100km} selectedId={selectedId} onSelect={onSelect} />
        </>
      )}
    </div>
  );
}
