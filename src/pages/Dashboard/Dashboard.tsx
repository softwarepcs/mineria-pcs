import { Link } from "react-router-dom";
import { useEmpresas } from "@/features/empresas/hooks";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatCard } from "@/shared/ui/StatCard";
import { Badge } from "@/shared/ui/Badge";

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
      <PageHeader titulo="Dashboard general" descripcion="Información global de todas las empresas" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard titulo="Empresas activas" valor={`${activas}/${empresas.length}`} color="text-blue-400" />
        <StatCard titulo="Unidades registradas" valor={totalUnidades} color="text-green-400" />
        <StatCard titulo="Alertas sin atender" valor={totalAlertas} color={totalAlertas > 0 ? "text-red-400" : "text-white"} />
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
                <Badge etiqueta={e.estado ? "Activa" : "Inactiva"} variante={e.estado ? "success" : "danger"} tamano="md" />
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

