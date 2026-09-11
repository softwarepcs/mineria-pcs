import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Protege /empresa/:id.
 * - Rol 1 y 2: acceso a cualquier empresa.
 * - Rol 3: solo puede acceder a su propio empresaId. Si intenta
 *   acceder a otra empresa, se le redirige a "no autorizado".
 */
export function EmpresaRoute({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  const { id } = useParams();

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  const { rol, empresaId } = sesion.usuario;

  if (rol === 3) {
    const idSolicitado = Number(id);
    if (empresaId === null || idSolicitado !== empresaId) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  return <>{children}</>;
}
