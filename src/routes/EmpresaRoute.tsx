import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * /empresa/:token — solo el SuperAdmin entra a empresas por token; el resto va a su panel.
 * No se muestra "no autorizado" para no revelar si el token existe.
 * (El backend lo vuelve a comprobar en cada petición.)
 */
export function EmpresaRoute({ children }: { children: ReactNode }) {
  const { sesion, listo } = useAuth();
  if (!listo) return null;
  if (!sesion) return <Navigate to="/login" replace />;
  if (!sesion.permisos.verTodasLasEmpresas) {
    return <Navigate to="/panel" replace />;
  }
  return <>{children}</>;
}
