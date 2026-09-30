import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * /empresa/:id — el SuperAdmin entra a cualquier empresa; el resto solo a la suya.
 * (El backend lo vuelve a comprobar en cada petición.)
 */
export function EmpresaRoute({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  const { id } = useParams();
  if (!sesion) return <Navigate to="/login" replace />;
  if (!sesion.permisos.verTodasLasEmpresas && Number(id) !== sesion.usuario.empresaId) {
    return <Navigate to="/no-autorizado" replace />;
  }
  return <>{children}</>;
}
