import type { MenuItem, MenuSeccion } from "@/types";
import { FUNCIONES } from "@/app/funciones";

/**
 * Menú de cada empresa según el diseño, por secciones:
 *  PLATAFORMA     Home · Alertas · Base de datos (Exportar a Excel, Consulta y mapa)
 *  COMBUSTIBLE    Consumo y eficiencia
 *  GESTIÓN        Configuración (+ Dispositivos y Sedes para el SuperAdmin; Operadores si FUNCIONES.operadores)
 * Telemetría se retiró: Base de datos › Consulta y mapa muestra lo mismo.
 * Los módulos no contratados y Reportes no se muestran en esta fase.
 */
export function seccionesEmpresa(basePath: string, esSuperAdmin = false, verBaseDatos = esSuperAdmin, alertasAbiertas = 0): MenuSeccion[] {
  const plataforma: MenuItem[] = [
    { id: `home-${basePath}`, label: "Home", path: basePath, icon: "home", end: true },
    { id: `alertas-${basePath}`, label: "Alertas", path: `${basePath}/alertas`, icon: "alert-triangle", badge: alertasAbiertas },
  ];
  if (verBaseDatos) {
    plataforma.push({
      id: `bd-${basePath}`,
      label: "Base de datos",
      path: `${basePath}/exportar`,
      icon: "database",
      children: [
        { id: `exportar-${basePath}`, label: "Exportar a Excel", path: `${basePath}/exportar`, icon: "dot" },
        { id: `consulta-${basePath}`, label: "Consulta y mapa", path: `${basePath}/consulta`, icon: "dot" },
      ],
    });
  }

  const administracion: MenuItem[] = [{ id: `config-${basePath}`, label: "Configuración", path: `${basePath}/configuracion`, icon: "wrench" }];
  if (esSuperAdmin) {
    if (FUNCIONES.operadores) administracion.push({ id: `operadores-${basePath}`, label: "Operadores", path: `${basePath}/operadores`, icon: "users" });
    administracion.push(
      { id: `dispositivos-${basePath}`, label: "Dispositivos", path: `${basePath}/dispositivos`, icon: "monitor" },
      { id: `sedes-${basePath}`, label: "Sedes", path: `${basePath}/sedes`, icon: "building" },
    );
  }

  return [
    { titulo: "PLATAFORMA", items: plataforma },
    { titulo: "COMBUSTIBLE", items: [{ id: `consumo-${basePath}`, label: "Consumo y eficiencia", path: `${basePath}/consumo`, icon: "activity" }] },
    { titulo: "GESTIÓN", items: administracion },
  ];
}

/** El mismo menú sin secciones (acordeón de empresas del SuperAdmin). */
export function menuEmpresa(basePath: string, esSuperAdmin = false, verBaseDatos = esSuperAdmin): MenuItem[] {
  return seccionesEmpresa(basePath, esSuperAdmin, verBaseDatos).flatMap((s) => s.items);
}
