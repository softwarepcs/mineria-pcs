/**
 * Matriz única de permisos del frontend. Replica lo que exige el backend con
 * @Roles(...) para que menú, rutas y botones muestren lo mismo que la API permite.
 * La seguridad real la sigue aplicando el backend.
 */
export type RolBackend = "SuperAdmin" | "Administrador" | "Gerente" | "Operador" | "Trabajador";

export interface Permisos {
  /** Ve y navega todas las empresas (solo SuperAdmin). */
  verTodasLasEmpresas: boolean;
  /** /usuarios — backend: SuperAdmin, Administrador. */
  gestionarUsuarios: boolean;
  /** Métricas y metas (configuración por máquina) — backend: SuperAdmin, Administrador. */
  configurarMetas: boolean;
  /** Crear/editar unidades, operadores, geocercas y dispositivos — backend: SuperAdmin, Administrador. */
  editarFlota: boolean;
  /** Cambiar el estado de una alerta — backend: SuperAdmin, Administrador, Gerente. */
  atenderAlertas: boolean;
}

const tiene = (roles: string[], ...buscados: RolBackend[]) => buscados.some((r) => roles.includes(r));

export function calcularPermisos(roles: string[]): Permisos {
  const superAdmin = tiene(roles, "SuperAdmin");
  const admin = superAdmin || tiene(roles, "Administrador");
  return {
    verTodasLasEmpresas: superAdmin,
    gestionarUsuarios: admin,
    configurarMetas: admin,
    editarFlota: admin,
    atenderAlertas: admin || tiene(roles, "Gerente"),
  };
}

const PRIORIDAD: RolBackend[] = ["SuperAdmin", "Administrador", "Gerente", "Operador", "Trabajador"];
const ETIQUETA: Record<RolBackend, string> = {
  SuperAdmin: "Administrador principal",
  Administrador: "Administrador",
  Gerente: "Gerente",
  Operador: "Operador",
  Trabajador: "Trabajador",
};

/** Rol de mayor jerarquía, para mostrar en la cabecera o en listas. */
export function etiquetaRol(roles: string[]): string {
  const principal = PRIORIDAD.find((r) => roles.includes(r));
  return principal ? ETIQUETA[principal] : "Sin rol";
}
