import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useGeocercas } from "@/features/geocercas/hooks";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { useAuth } from "@/hooks/useAuth";
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
  const { sesion } = useAuth();
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
  const unidades = useUnidades(empresa.id);
  const { data: geocercas = [] } = useGeocercas(empresa.id);
  const onSeleccionar = useCallback((id: number) => setSeleccionadaId((actual) => (actual === id ? null : id)), []);
  const verLinea = useCallback(() => navigate(`${base}/consumo`), [navigate, base]);
  const puedeEditarGeocercas = sesion?.permisos.puede("GEOCERCAS", "GESTIONAR") ?? false;

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
          <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[3fr_1.15fr]">
            <HomeEstadoFlota unidades={unidades.data} />
            <HomeAlertas empresaId={empresa.id} zonaHoraria={empresa.zonaHoraria} rutaAlertas={`${base}/alertas`} />
          </div>
          <Panel padding="none" className="overflow-hidden">
            <div className="px-5 py-4">
              <h2 className="font-cond text-[21px] font-semibold text-[#F2F6FA]">
                Mapa en línea <span className="ml-2 font-sans text-sm font-normal text-[#8FA3B8]">Haz clic en un camión</span>
              </h2>
            </div>
            <HomeMapa
              unidades={unidades.data}
              geocercas={geocercas}
              seleccionadaId={seleccionadaId}
              onSeleccionar={onSeleccionar}
              alEditarGeocercas={puedeEditarGeocercas ? () => navigate(`${base}/configuracion?tab=geocercas`) : undefined}
              onVerLinea={verLinea}
              zonaHoraria={empresa.zonaHoraria}
            />
          </Panel>
          <HomeTabla unidades={unidades.data} zonaHoraria={empresa.zonaHoraria} seleccionadaId={seleccionadaId} onSeleccionar={onSeleccionar} />
        </>
      )}
    </div>
  );
}
