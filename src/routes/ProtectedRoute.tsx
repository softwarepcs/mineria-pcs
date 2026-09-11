import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Rol } from "../types";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  rolesPermitidos?: Rol[];
}

export function ProtectedRoute({ children, rolesPermitidos }: ProtectedRouteProps) {
  const { sesion, cargando } = useAuth();

  if (cargando) {
    return <div className="p-5 text-center text-light">Cargando...</div>;
  }

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(sesion.usuario.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
}
