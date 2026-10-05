import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * /empresa/:id — el SuperAdmin entra a cualquier empresa; el resto solo a la suya.
 * (El backend lo vuelve a comprobar en cada petición.)
 */
export function EmpresaRoute({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  if (!sesion.permisos.verTodasLasEmpresas) {
    return <Navigate to="/no-autorizado" replace />;
  }
  return <>{children}</>;
}
