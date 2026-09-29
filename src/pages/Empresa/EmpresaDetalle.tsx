import { useEffect } from "react";
import { Link, useParams, Routes, Route } from "react-router-dom";
import { useEmpresaStore } from "@/store/empresaStore";
import { useAuth } from "@/hooks/useAuth";

import { FlotaHome } from "@/features/flota/components/FlotaHome";
import { MotorPrincipal } from "@/features/motor/components/MotorPrincipal";
import { AlertasView } from "@/features/alertas/components/AlertasView";
import { OperadoresView } from "@/features/operadores/components/OperadoresView";
import { OperadorDetalleView } from "@/features/operadores/components/OperadorDetalleView";
import { CamionesListaView } from "@/features/camiones/components/CamionesListaView";
import { CamionesDetalleView } from "@/features/camiones/components/CamionesDetalleView";
import { GeocercasView } from "@/features/geocercas/components/GeocercasView";

function MonitoreoWrapper({ empresaNombre }: { empresaNombre: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Monitoreo - {empresaNombre}</h2>
      <p className="mt-2 text-sm text-slate-400">
        Panel de monitoreo general para {empresaNombre}.
      </p>
    </div>
  );
}

export function EmpresaDetalle() {
  const { id } = useParams();
  const { sesion } = useAuth();
  const { empresaActual: empresa, cargandoActual: cargando, cargarEmpresaPorId } = useEmpresaStore();
  
  const esAdministrador = sesion?.usuario.rol === 1 || sesion?.usuario.rol === 2;
  const empresaIdNum = Number(id);

  useEffect(() => {
    if (!id) return;
    cargarEmpresaPorId(empresaIdNum);
  }, [id, empresaIdNum, cargarEmpresaPorId]);

  if (cargando) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        Cargando empresa...
      </div>
    );
  }

  if (!empresa) {
    return <div className="text-sm text-slate-400">Empresa no encontrada.</div>;
  }

  const renderRutasAnidadas = () => {
    return (
      <Routes>
        <Route index element={<FlotaHome empresa={empresa} />} />
        <Route path="motor-principal" element={<MotorPrincipal empresaNombre={empresa.nombre} />} />
        <Route path="database" element={<MotorPrincipal empresaNombre={empresa.nombre} />} />
        <Route path="alertas" element={<AlertasView empresaNombre={empresa.nombre} />} />
        <Route path="monitoreo" element={<MonitoreoWrapper empresaNombre={empresa.nombre} />} />
        <Route path="tanques" element={<MonitoreoWrapper empresaNombre={empresa.nombre} />} />
        <Route path="achiques" element={<MonitoreoWrapper empresaNombre={empresa.nombre} />} />
        <Route path="combustible" element={<MonitoreoWrapper empresaNombre={empresa.nombre} />} />
        <Route path="operadores" element={<OperadoresView empresa={empresa} />} />
        <Route path="operadores-detalle" element={<OperadorDetalleView />} />
        <Route path="camiones" element={<CamionesListaView empresa={empresa} />} />
        <Route path="camiones-detalle" element={<CamionesDetalleView empresa={empresa} />} />
        <Route path="geocercas" element={<GeocercasView empresa={empresa} />} />
        <Route path="*" element={<FlotaHome empresa={empresa} />} />
      </Routes>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {esAdministrador && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-blue-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al panel principal
          </Link>
        )}

        {/* {subruta && (
          <Link
            to={`/empresa/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Volver al Home de {empresa.nombre}
          </Link>
        )} */}
      </div>

      {renderRutasAnidadas()}
    </div>
  );
}