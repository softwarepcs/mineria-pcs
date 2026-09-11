import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { listarEmpresas } from "../../services/empresaService";
import type { Empresa } from "../../types";
import { IndicatorCard } from "../../components/IndicatorCard";
import { MapPlaceholder } from "../../components/MapPlaceholder";

export function Dashboard() {
  const { sesion } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState(true);

  const esGlobal = sesion?.permisos.verTodasLasEmpresas ?? false;

  useEffect(() => {
    async function cargar() {
      if (!sesion || !esGlobal) return;
      setCargando(true);
      const data = await listarEmpresas();
      setEmpresas(data);
      setCargando(false);
    }
    cargar();
  }, [sesion, esGlobal]);

  // Rol 3 (Empresa): nunca se queda en /dashboard, va directo a la vista de su empresa
  if (!esGlobal) {
    if (sesion?.usuario.empresaId != null) {
      return <Navigate to={`/empresa/${sesion.usuario.empresaId}`} replace />;
    }
    return <div className="text-sm text-slate-400">No tienes una empresa asignada.</div>;
  }

  if (cargando) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        Cargando dashboard...
      </div>
    );
  }

  const totalUnidades = empresas.reduce((sum, e) => sum + (e.indicadores?.unidades ?? 0), 0);
  const totalAlertas = empresas.reduce((sum, e) => sum + (e.indicadores?.alertas ?? 0), 0);
  const activas = empresas.filter((e) => e.estado === "activa").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard general</h1>
      <p className="mt-1 text-sm text-slate-400">
        Información global de todas las empresas
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IndicatorCard label="Empresas activas" value={`${activas}/${empresas.length}`} accent="blue" />
        <IndicatorCard label="Unidades monitoreadas" value={totalUnidades} accent="green" />
        <IndicatorCard label="Alertas activas" value={totalAlertas} accent="red" />
      </div>

      <div className="mt-6">
        <MapPlaceholder titulo="Mapa general (pendiente de integración)" />
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-white">Empresas</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {empresas.map((e) => (
          <div
            key={e.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div className="text-sm font-medium text-white">{e.nombre}</div>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                e.estado === "activa"
                  ? "bg-green-500/10 text-green-400"
                  : e.estado === "inactiva"
                  ? "bg-slate-500/10 text-slate-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {e.estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}