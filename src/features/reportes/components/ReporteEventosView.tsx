import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Cargando, ErrorCarga, SinDatos, Spinner } from "@/shared/ui/Estados";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Panel } from "@/shared/ui/Panel";
import { PeriodoSelector } from "@/shared/ui/PeriodoSelector";
import { num } from "@/shared/utils/formato";
import type { PeriodoReporte } from "../api";
import { useReporteEventos } from "../hooks";
import { tituloPeriodo } from "../ventana";
import { GanttEventos } from "./GanttEventos";
import { TablaEventos } from "./TablaEventos";

const PERIODOS: { valor: PeriodoReporte; etiqueta: string }[] = [
  { valor: "24h", etiqueta: "Últimas 24 h" },
  { valor: "7d", etiqueta: "Últimos 7 días" },
];

export function ReporteEventosView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeExportar = sesion?.permisos.puede("REPORTES", "EXPORTAR") ?? false;
  const [periodo, setPeriodo] = useState<PeriodoReporte>("24h");
  const [maquinariaId, setMaquinariaId] = useState<number | null>(null);

  const unidades = useUnidades(empresa.id).data ?? [];
  const q = useReporteEventos(empresa.id, periodo, maquinariaId);
  const reporte = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        titulo={tituloPeriodo(periodo)}
        accion={
          <>
            {q.isFetching && <Spinner />}
            <PeriodoSelector opciones={PERIODOS} valor={periodo} onCambiar={setPeriodo} />
            <div className="relative">
              <select
                aria-label="Maquinaria"
                value={maquinariaId ?? ""}
                onChange={(e) => setMaquinariaId(Number(e.target.value) || null)}
                className="cursor-pointer appearance-none rounded-md border border-white/10 bg-[#0e1420] py-1.5 pl-2.5 pr-7 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-[#0df5c6]"
              >
                <option value="">Toda la flota</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.identificador}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-500" />
            </div>
          </>
        }
      />

      {q.isLoading ? (
        <Cargando texto="Calculando reporte..." />
      ) : q.isError || !reporte ? (
        <ErrorCarga error={q.error} onReintentar={() => void q.refetch()} />
      ) : reporte.maquinarias.length === 0 ? (
        <SinDatos titulo="No hay unidades para mostrar." />
      ) : (
        <>
          <p className="text-xs text-slate-400">
            Flota: <span className="text-slate-200">{num(reporte.totales.consumoGal, 1)} gal</span> ·{" "}
            <span className="text-slate-200">{num(reporte.totales.distanciaKm, 1)} km</span> · conducción {num(reporte.totales.horasConduccion, 1)} h ·
            ralentí {num(reporte.totales.horasRalenti, 1)} h · offline {num(reporte.totales.horasOffline, 1)} h
          </p>
          <Panel>
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <GanttEventos reporte={reporte} periodo={periodo} />
              </div>
            </div>
          </Panel>
          <Panel>
            <TablaEventos reporte={reporte} periodo={periodo} puedeExportar={puedeExportar} />
          </Panel>
        </>
      )}
    </div>
  );
}
