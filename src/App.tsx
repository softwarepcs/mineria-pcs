import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { EmpresaRoute } from "@/routes/EmpresaRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { Login } from "@/pages/Login/Login";
import { Dashboard } from "@/pages/Dashboard/Dashboard";
import { Empresas } from "@/pages/Empresas/Empresas";
import { EmpresaDetalle } from "@/pages/Empresa/EmpresaDetalle";
import { Usuarios } from "@/pages/Usuarios/Usuarios";
import { Configuracion } from "@/pages/Configuracion/Configuracion";
import { NotAuthorized } from "@/pages/NotAuthorized/NotAuthorized";
import { Avisos } from "@/shared/ui/Avisos";
import { useAuth } from "@/hooks/useAuth";

function RootRedirect() {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  if (sesion.permisos.verTodasLasEmpresas) return <Navigate to="/dashboard" replace />;
  if (sesion.usuario.empresaId) return <Navigate to={`/empresa/${sesion.usuario.empresaId}`} replace />;
  return <Navigate to="/no-autorizado" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/no-autorizado" element={<NotAuthorized />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permiso="verTodasLasEmpresas">
              <MainLayout><Dashboard /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/empresas"
          element={
            <ProtectedRoute permiso="verTodasLasEmpresas">
              <MainLayout><Empresas /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/empresa/:id/*"
          element={
            <ProtectedRoute>
              <EmpresaRoute>
                <MainLayout><EmpresaDetalle /></MainLayout>
              </EmpresaRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute permiso="gestionarUsuarios">
              <MainLayout><Usuarios /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute permiso="configurarMetas">
              <MainLayout><Configuracion /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <Avisos />
    </BrowserRouter>
  );
}

export default App;
