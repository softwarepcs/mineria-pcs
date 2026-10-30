import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useGeocercas } from "@/features/geocercas/hooks";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { Cargando, ErrorCarga, SinDatos, Spinner } from "@/shared/ui/Estados";
import { Panel } from "@/shared/ui/Panel";
import { haceCuanto } from "@/shared/utils/formato";
import { HomeAlertas } from "./HomeAlertas";
import { HomeEstadoFlota } from "./HomeEstadoFlota";
import { HomeMapa } from "./HomeMapa";
import { HomeTabla } from "./HomeTabla";

/** Pantalla Home: estado de la flota ahora, alertas abiertas, mapa en línea y tabla de camiones. */
export function HomeView({ empresa }: { empresa: EmpresaDetalle }) {
  const base = useEmpresaPath();
  const navigate = useNavigate();
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
  const unidades = useUnidades(empresa.id);
  const { data: geocercas = [] } = useGeocercas(empresa.id);
  const [ocultas, setOcultas] = useState<Set<number>>(() => leerOcultas(empresa.id));
  useEffect(() => guardarOcultas(empresa.id, ocultas), [empresa.id, ocultas]);
  const onSeleccionar = useCallback((id: number) => {
    setSeleccionadaId((actual) => (actual === id ? null : id));
    // Si se elige un camión oculto, se vuelve a mostrar para poder ubicarlo en el mapa
    setOcultas((prev) => (prev.has(id) ? new Set([...prev].filter((x) => x !== id)) : prev));
  }, []);
  const alternarVisible = useCallback((id: number) => {
    setOcultas((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);
  const mostrarTodas = useCallback((ids: number[], mostrar: boolean) => {
    setOcultas((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => (mostrar ? n.delete(id) : n.add(id)));
      return n;
    });
  }, []);
  const enMapa = useMemo(() => (unidades.data ?? []).filter((u) => !ocultas.has(u.id)), [unidades.data, ocultas]);
  const verLinea = useCallback(() => navigate(`${base}/consumo`), [navigate, base]);

  return (
    <div className="flex w-full max-w-full flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-cond text-[32px] font-bold leading-none text-white sm:text-[38px]">Home</h1>
          <p className="mt-1 text-base text-[#A9BBCC]">Estado de la flota ahora · {unidades.data?.length ?? 0} camiones</p>
        </div>
        <p className="flex items-center gap-2 text-sm text-[#8FA3B8]">
          {unidades.isFetching && <Spinner className="h-3 w-3" />}
          En línea <span className="punto-vivo" /> · actualizado {unidades.dataUpdatedAt ? haceCuanto(new Date(unidades.dataUpdatedAt)) : "—"}
        </p>
      </div>

      {unidades.isLoading ? (
        <Cargando texto="Cargando la flota..." />
      ) : unidades.isError || !unidades.data ? (
        <ErrorCarga error={unidades.error} onReintentar={() => void unidades.refetch()} />
      ) : unidades.data.length === 0 ? (
        <SinDatos titulo="Esta empresa todavía no tiene camiones">Regístralos en Configuración › Camiones y asígnales un equipo para empezar a recibir datos.</SinDatos>
      ) : (
        <>
          <Panel padding="none" className="overflow-hidden">
            <HomeEstadoFlota unidades={unidades.data} variante="franja" />
            <div className="px-4 py-3 sm:px-5 sm:py-4">
              <h2 className="font-cond text-[21px] font-semibold text-[#F2F6FA]">
                Mapa en línea <span className="ml-2 hidden font-sans text-sm font-normal text-[#8FA3B8] sm:inline">Haz clic en un camión</span>
              </h2>
            </div>
            <HomeMapa
              unidades={enMapa}
              geocercas={geocercas}
              seleccionadaId={seleccionadaId}
              onSeleccionar={onSeleccionar}
              onVerLinea={verLinea}
              zonaHoraria={empresa.zonaHoraria}
              superpuestos={
                <>
                  <HomeEstadoFlota unidades={unidades.data} />
                  <HomeAlertas empresaId={empresa.id} zonaHoraria={empresa.zonaHoraria} rutaAlertas={`${base}/alertas`} />
                </>
              }
            />
          </Panel>
          <HomeTabla unidades={unidades.data} zonaHoraria={empresa.zonaHoraria} ocultas={ocultas} onAlternarVisible={alternarVisible} onMostrarTodas={mostrarTodas} seleccionadaId={seleccionadaId} onSeleccionar={onSeleccionar} />
        </>
      )}
    </div>
  );
}

/* Camiones ocultos del mapa: preferencia de este navegador, por empresa (se guardan los ocultos, así un camión nuevo aparece). */
const claveOcultas = (empresaId: number) => `home_mapa_ocultos_${empresaId}`;

function leerOcultas(empresaId: number): Set<number> {
  try {
    const v = JSON.parse(localStorage.getItem(claveOcultas(empresaId)) ?? "[]") as unknown;
    return new Set(Array.isArray(v) ? v.filter((x): x is number => typeof x === "number") : []);
  } catch {
    return new Set();
  }
}

function guardarOcultas(empresaId: number, ocultas: Set<number>) {
  try {
    localStorage.setItem(claveOcultas(empresaId), JSON.stringify([...ocultas]));
  } catch {
    // sin almacenamiento local: la selección vive solo mientras la página esté abierta
  }
}
