import { Link, useParams, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresa } from "@/features/empresas/hooks";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { FlotaHome } from "@/features/flota/components/FlotaHome";
import { MotorPrincipal } from "@/features/motor/components/MotorPrincipal";
import { AlertasView } from "@/features/alertas/components/AlertasView";
import { OperadoresView } from "@/features/operadores/components/OperadoresView";
import { OperadorDetalleView } from "@/features/operadores/components/OperadorDetalleView";
import { CamionesListaView } from "@/features/camiones/components/CamionesListaView";
import { CamionesDetalleView } from "@/features/camiones/components/CamionesDetalleView";
import { GeocercasView } from "@/features/geocercas/components/GeocercasView";
import { DispositivosView } from "@/features/dispositivos/components/DispositivosView";

export function EmpresaDetalle() {
  const { id } = useParams();
  const { sesion } = useAuth();
  const empresaId = Number(id);
  const { data: empresa, isLoading, error, refetch } = useEmpresa(empresaId);

  if (isLoading) return <Cargando texto="Cargando empresa..." />;
  if (error || !empresa) return <ErrorCarga error={error ?? new Error("Empresa no encontrada")} onReintentar={() => void refetch()} />;

  return (
    <div>
      {sesion?.permisos.verTodasLasEmpresas && (
        <div className="mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-blue-400">
            ← Volver al panel principal
          </Link>
        </div>
      )}
      <Routes>
        <Route index element={<FlotaHome empresa={empresa} />} />
        <Route path="camiones" element={<CamionesListaView empresa={empresa} />} />
        <Route path="camiones/:unidadId" element={<CamionesDetalleView empresa={empresa} />} />
        <Route path="operadores" element={<OperadoresView empresa={empresa} />} />
        <Route path="operadores/:operadorId" element={<OperadorDetalleView empresa={empresa} />} />
        <Route path="geocercas" element={<GeocercasView empresa={empresa} />} />
        <Route path="alertas" element={<AlertasView empresa={empresa} />} />
        <Route path="dispositivos" element={<DispositivosView empresa={empresa} />} />
        <Route path="database" element={<MotorPrincipal empresa={empresa} />} />
        <Route path="*" element={<Navigate to={`/empresa/${empresaId}`} replace />} />
      </Routes>
    </div>
  );
}
