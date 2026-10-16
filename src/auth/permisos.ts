/**
 * Matriz de permisos del frontend conectada a los permisos granulares del backend.
 * Soporta la función `puede(modulo, accion)` para permisos directos y mantiene
 * retrocompatibilidad con las propiedades booleanas existentes.
 */
export type RolBackend = "SuperAdmin" | "Administrador" | "Gerente" | "Operador" | "Trabajador";

export interface Permisos {
  /** Ve y navega todas las empresas (solo SuperAdmin). */
  verTodasLasEmpresas: boolean;
  /** /usuarios — backend: SuperAdmin, Administrador. */
  gestionarUsuarios: boolean;
  /** Crear/editar sedes — backend: SuperAdmin, Administrador, Gerente. */
  gestionarSedes: boolean;
  /** Métricas y metas (configuración por máquina) — backend: SuperAdmin, Administrador. */
  configurarMetas: boolean;
  /** Crear/editar unidades, operadores, geocercas y dispositivos — backend: SuperAdmin, Administrador. */
  editarFlota: boolean;
  /** Cambiar el estado de una alerta — backend: SuperAdmin, Administrador, Gerente. */
  atenderAlertas: boolean;
  /** Función dinámica para verificar cualquier tupla (modulo, accion). */
  puede: (modulo: string, accion: string) => boolean;
}

const tiene = (roles: string[], ...buscados: RolBackend[]) => buscados.some((r) => roles.includes(r));

/** Comprueba si el usuario tiene permiso para ejecutar una acción sobre un módulo. */
export function tienePermiso(permisos: string[] = [], roles: string[] = [], modulo: string, accion: string): boolean {
  if (roles.includes("SuperAdmin")) return true;
  return permisos.includes(`${modulo.toUpperCase()}:${accion.toUpperCase()}`);
}

export function calcularPermisos(roles: string[] = [], permisosBackend: string[] = []): Permisos {
  const superAdmin = tiene(roles, "SuperAdmin");
  
  const puedeFn = (modulo: string, accion: string) => tienePermiso(permisosBackend, roles, modulo, accion);

  // Si el backend envió la lista de permisos granulares, se evalúan directamente desde esa lista
  if (permisosBackend.length > 0) {
    return {
      verTodasLasEmpresas: superAdmin,
      gestionarUsuarios: puedeFn("USUARIOS", "GESTIONAR") || puedeFn("USUARIOS", "VER"),
      gestionarSedes: puedeFn("SEDES", "GESTIONAR"),
      configurarMetas: puedeFn("ALERTAS", "CONFIGURAR"),
      editarFlota: puedeFn("FLOTA", "EDITAR") || puedeFn("FLOTA", "CREAR"),
      atenderAlertas: puedeFn("ALERTAS", "ATENDER"),
      puede: puedeFn,
    };
  }

  // Fallback si no vinieran permisos del backend:
  // SuperAdmin gestiona todo. Administrador (cliente) solo atiende alertas y monitorea.
  return {
    verTodasLasEmpresas: superAdmin,
    gestionarUsuarios: superAdmin,
    gestionarSedes: superAdmin,
    configurarMetas: superAdmin,
    editarFlota: superAdmin,
    atenderAlertas: superAdmin || tiene(roles, "Administrador"),
    puede: puedeFn,
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
