import { Link } from "react-router-dom";
import { useEmpresas } from "@/features/empresas/hooks";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";

export function Empresas() {
  const { data: empresas = [], isLoading, error, refetch } = useEmpresas();

  if (isLoading) return <Cargando texto="Cargando empresas..." />;
  if (error) return <ErrorCarga error={error} onReintentar={() => void refetch()} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Empresas</h1>
      <p className="mt-1 text-sm text-slate-400">Listado de empresas registradas en el sistema</p>

      {empresas.length === 0 ? (
        <div className="mt-6"><SinDatos titulo="No hay empresas registradas" /></div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((e) => (
            <Link
              key={e.id}
              to={`/empresa/${e.id}`}
              className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-blue-500/40 hover:bg-white/[0.07]"
            >
              <div className="text-sm font-medium text-white group-hover:text-blue-300">{e.nombre}</div>
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${e.estado ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"}`}>
                {e.estado ? "Activa" : "Inactiva"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
