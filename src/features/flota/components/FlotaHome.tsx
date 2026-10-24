import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useFlotaDashboard } from "@/features/flota/hooks";
import { useGeocercas } from "@/features/geocercas/hooks";
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
];

export function FlotaHome({ empresa }: { empresa: EmpresaDetalle }) {
  const [dias, setDias] = useState<Periodo>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seleccionadasIds, setSeleccionadasIds] = useState<Set<string>>(new Set());
  const { data, isLoading, error, refetch } = useFlotaDashboard(empresa.id, dias);
  const { data: geocercas = [] } = useGeocercas(empresa.id);

  const maquinariasKey = data?.maquinarias.map((m) => m.id).join(",") ?? "";
  const prevMaquinariasKeyRef = useRef<string>("");

  // Selección predeterminada: todas las maquinarias deben aparecer seleccionadas al ingresar a la vista
  useEffect(() => {
    if (data && data.maquinarias.length > 0) {
      if (prevMaquinariasKeyRef.current !== maquinariasKey) {
        prevMaquinariasKeyRef.current = maquinariasKey;
        setSeleccionadasIds(new Set(data.maquinarias.map((m) => m.id)));
      }
    }
  }, [data, maquinariasKey]);

  const onSelect = useCallback((id: string | null) => setSelectedId(id || null), []);

  const onToggleSeleccion = useCallback((id: string) => {
    setSeleccionadasIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const onToggleTodas = useCallback((todas: boolean) => {
    if (!data) return;
    if (todas) {
      setSeleccionadasIds(new Set(data.maquinarias.map((m) => m.id)));
    } else {
      setSeleccionadasIds(new Set());
    }
  }, [data]);

  // Maquinarias que se deben visualizar en mapa y gráfico
  const maquinariasVisibles = useMemo(() => {
    if (!data) return [];
    return data.maquinarias.filter((m) => seleccionadasIds.has(m.id));
  }, [data, seleccionadasIds]);

  // Si la maquinaria enfocada individualmente se deselecciona, limpiar foco
  useEffect(() => {
    if (selectedId && !seleccionadasIds.has(selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, seleccionadasIds]);

  // Recálculo dinámico de KPIs para la flota visible
  const resumenVisible = useMemo(() => {
    if (!data) return null;
    if (seleccionadasIds.size === data.maquinarias.length) {
      return data.resumen;
    }
    const kmTotal = maquinariasVisibles.reduce((s, m) => s + m.km, 0);
    const consumoTotalL = maquinariasVisibles.reduce((s, m) => s + m.litros, 0);
    const ralentiLitros = maquinariasVisibles.reduce((s, m) => s + m.ralentiLitros, 0);
    const ralentiHoras = maquinariasVisibles.reduce((s, m) => s + m.ralentiHoras, 0);
    const sobrecargaLitros = maquinariasVisibles.reduce((s, m) => s + m.sobrecargaLitros, 0);
    const sobrecargaHoras = maquinariasVisibles.reduce((s, m) => s + m.sobrecargaHoras, 0);
    const horasMotor = maquinariasVisibles.reduce((s, m) => s + m.horas, 0);
    const consumoMedioL100km = kmTotal > 0 ? (consumoTotalL / kmTotal) * 100 : 0;
    const objetivo = data.resumen.objetivoL100km;
    const desvioVsObjetivoPct = objetivo > 0 ? ((consumoMedioL100km - objetivo) / objetivo) * 100 : 0;
    const co2Ton = (consumoTotalL * 2.68) / 1000;
    const co2Kg = consumoTotalL * 2.68;
    const reportando = maquinariasVisibles.filter((m) => m.estado !== "offline").length;

    return {
      ...data.resumen,
      equipos: maquinariasVisibles.length,
      reportando,
      kmTotal: parseFloat(kmTotal.toFixed(0)),
      consumoTotalL: parseFloat(consumoTotalL.toFixed(0)),
      consumoMedioL100km: parseFloat(consumoMedioL100km.toFixed(1)),
      desvioVsObjetivoPct: parseFloat(desvioVsObjetivoPct.toFixed(1)),
      ralentiLitros: parseFloat(ralentiLitros.toFixed(0)),
      ralentiHoras: parseFloat(ralentiHoras.toFixed(1)),
      sobrecargaLitros: parseFloat(sobrecargaLitros.toFixed(0)),
      sobrecargaHoras: parseFloat(sobrecargaHoras.toFixed(1)),
      emisionesCo2Ton: parseFloat(co2Ton.toFixed(2)),
      emisionesCo2Kg: parseFloat(co2Kg.toFixed(0)),
      horasMotor: parseFloat(horasMotor.toFixed(0)),
    };
  }, [data, seleccionadasIds, maquinariasVisibles]);

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
              Ninguna unidad tiene metas configuradas: el objetivo de consumo medio es el valor por defecto.
            </p>
          )}
          <FlotaKpis
            resumen={resumenVisible ?? data.resumen}
            maquinarias={maquinariasVisibles}
            selectedId={selectedId}
            onReset={() => setSelectedId(null)}
          />
          <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
            <div className="w-full min-w-0">
              <FlotaMap maquinarias={maquinariasVisibles} selectedId={selectedId} onSelect={onSelect} geocercas={geocercas} />
            </div>
            <div className="w-full min-w-0">
              <FlotaTable maquinarias={maquinariasVisibles} selectedId={selectedId} onSelect={onSelect} mode="alerts" />
            </div>
          </div>
          <FlotaTable
            maquinarias={data.maquinarias}
            selectedId={selectedId}
            onSelect={onSelect}
            mode="full"
            seleccionadasIds={seleccionadasIds}
            onToggleSeleccion={onToggleSeleccion}
            onToggleTodas={onToggleTodas}
          />
          <FlotaDesvioChart
            maquinarias={maquinariasVisibles}
            objetivo={data.resumen.objetivoL100km}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </>
      )}
    </div>
  );
}
