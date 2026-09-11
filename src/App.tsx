import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { EmpresaRoute } from "./routes/EmpresaRoute";
import { MainLayout } from "./layouts/MainLayout";

import { Login } from "./pages/Login/Login";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Empresas } from "./pages/Empresas/Empresas";
import { EmpresaDetalle } from "./pages/Empresa/EmpresaDetalle";
import { Usuarios } from "./pages/Usuarios/Usuarios";
import { NotAuthorized } from "./pages/NotAuthorized/NotAuthorized";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-autorizado" element={<NotAuthorized />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/empresas"
            element={
              <ProtectedRoute rolesPermitidos={[1, 2]}>
                <MainLayout>
                  <Empresas />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/empresa/:id"
            element={
              <ProtectedRoute>
                <EmpresaRoute>
                  <MainLayout>
                    <EmpresaDetalle />
                  </MainLayout>
                </EmpresaRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/empresa/:id/:subruta"
            element={
              <ProtectedRoute>
                <EmpresaRoute>
                  <MainLayout>
                    <EmpresaDetalle />
                  </MainLayout>
                </EmpresaRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <ProtectedRoute rolesPermitidos={[1]}>
                <MainLayout>
                  <Usuarios />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
