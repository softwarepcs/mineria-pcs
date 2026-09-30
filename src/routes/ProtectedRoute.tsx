import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Permisos } from "@/auth/permisos";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children, permiso }: { children: ReactNode; permiso?: keyof Permisos }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  if (permiso && !sesion.permisos[permiso]) return <Navigate to="/no-autorizado" replace />;
  return <>{children}</>;
}
