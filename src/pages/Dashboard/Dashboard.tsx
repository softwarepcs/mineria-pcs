import { Link } from "react-router-dom";
import { useEmpresas } from "@/features/empresas/hooks";
import { IndicatorCard } from "@/components/IndicatorCard";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";

/** Panel del SuperAdmin: indicadores reales por empresa (unidades, alertas abiertas, disponibilidad). */
export function Dashboard() {
  const { data: empresas = [], isLoading, error, refetch } = useEmpresas();

  if (isLoading) return <Cargando texto="Cargando dashboard..." />;
  if (error) return <ErrorCarga error={error} onReintentar={() => void refetch()} />;

  const totalUnidades = empresas.reduce((s, e) => s + e.indicadores.unidades, 0);
  const totalAlertas = empresas.reduce((s, e) => s + e.indicadores.alertasAbiertas, 0);
  const activas = empresas.filter((e) => e.estado).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard general</h1>
      <p className="mt-1 text-sm text-slate-400">Información global de todas las empresas</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IndicatorCard label="Empresas activas" value={`${activas}/${empresas.length}`} accent="blue" />
        <IndicatorCard label="Unidades registradas" value={totalUnidades} accent="green" />
        <IndicatorCard label="Alertas sin atender" value={totalAlertas} accent="red" />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-white">Empresas</h2>
      {empresas.length === 0 ? (
        <SinDatos titulo="No hay empresas registradas" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((e) => (
            <Link
              key={e.id}
              to={`/empresa/${e.id}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium text-white">{e.nombre}</div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.estado ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {e.estado ? "Activa" : "Inactiva"}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <dt className="text-slate-500">Unidades</dt>
                  <dd className="font-mono text-base font-bold text-white">{e.indicadores.unidades}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Alertas</dt>
                  <dd className={`font-mono text-base font-bold ${e.indicadores.alertasAbiertas > 0 ? "text-red-400" : "text-white"}`}>{e.indicadores.alertasAbiertas}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Operativas</dt>
                  <dd className="font-mono text-base font-bold text-white">
                    {e.indicadores.disponibilidadPct === null ? "—" : `${e.indicadores.disponibilidadPct}%`}
                  </dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
