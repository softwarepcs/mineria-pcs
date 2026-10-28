import { Link, useParams, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresa, useEmpresaPorToken } from "@/features/empresas/hooks";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { HomeView } from "@/features/flota/components/HomeView";
import { AlertasView } from "@/features/alertas/components/AlertasView";
import { FUNCIONES } from "@/app/funciones";
import { OperadoresView } from "@/features/operadores/components/OperadoresView";
import { OperadorDetalleView } from "@/features/operadores/components/OperadorDetalleView";
import { DispositivosView } from "@/features/dispositivos/components/DispositivosView";
import { SedesView } from "@/features/sedes/components/SedesView";
import { ConsumoView } from "@/features/consumo/components/ConsumoView";
import { ExportarView } from "@/features/baseDatos/components/ExportarView";
import { ConsultaView } from "@/features/baseDatos/components/ConsultaView";
import { ConfiguracionView } from "@/features/configuracion/components/ConfiguracionView";

export function EmpresaDetalle() {
  const { token } = useParams();
  const { sesion } = useAuth();
  const esSuperAdmin = sesion?.permisos.esSuperAdmin ?? false;
  const puedeVerReportes = sesion?.permisos.puede("REPORTES", "VER") ?? false;
  
  const isPanel = !token;
  const empresaId = isPanel ? sesion?.usuario.empresaId : null;

  const queryToken = useEmpresaPorToken(token);
  const queryId = useEmpresa(empresaId);

  const isLoading = isPanel ? queryId.isLoading : queryToken.isLoading;
  const error = isPanel ? queryId.error : queryToken.error;
  const empresa = isPanel ? queryId.data : queryToken.data;
  const refetch = isPanel ? queryId.refetch : queryToken.refetch;

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
        <Route index element={<HomeView empresa={empresa} />} />
        <Route path="consumo" element={<ConsumoView empresa={empresa} />} />
        {FUNCIONES.operadores && <Route path="operadores" element={<OperadoresView empresa={empresa} />} />}
        {FUNCIONES.operadores && <Route path="operadores/:operadorId" element={<OperadorDetalleView empresa={empresa} />} />}
        <Route path="geocercas" element={<Navigate to="../configuracion?tab=geocercas" replace />} />
        <Route path="camiones/*" element={<Navigate to="../configuracion?tab=camiones" replace />} />
        <Route path="configuracion" element={<ConfiguracionView empresa={empresa} />} />
        <Route path="alertas" element={<AlertasView empresa={empresa} />} />
        {puedeVerReportes && <Route path="exportar" element={<ExportarView empresa={empresa} />} />}
        {puedeVerReportes && <Route path="consulta" element={<ConsultaView empresa={empresa} />} />}
        {esSuperAdmin && <Route path="dispositivos" element={<DispositivosView empresa={empresa} />} />}
        {/* Telemetría se retiró (duplicaba Base de datos): los enlaces viejos van a Consulta y mapa */}
        <Route path="database" element={<Navigate to="../consulta" replace />} />
        {esSuperAdmin && <Route path="sedes" element={<SedesView empresa={empresa} />} />}
        <Route path="*" element={<Navigate to={isPanel ? "/panel" : `/empresa/${token}`} replace />} />
      </Routes>
    </div>
  );
}
