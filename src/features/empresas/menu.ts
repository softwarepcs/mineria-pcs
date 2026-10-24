import type { MenuItem } from "@/types";

/** Menú de cada empresa: Dispositivos y Sedes son exclusivos para SuperAdmin; Reportes requiere REPORTES:VER. */
export function menuEmpresa(basePath: string, esSuperAdmin = false, verReportes = esSuperAdmin): MenuItem[] {
  const items: MenuItem[] = [
    { id: `home-${basePath}`, label: "Inicio", path: basePath, icon: "home" },
    { id: `camiones-${basePath}`, label: "Unidades", path: `${basePath}/camiones`, icon: "truck" },
    { id: `operadores-${basePath}`, label: "Operadores", path: `${basePath}/operadores`, icon: "users" },
    { id: `geocercas-${basePath}`, label: "Geocercas", path: `${basePath}/geocercas`, icon: "mapPin" },
    { id: `alertas-${basePath}`, label: "Alertas", path: `${basePath}/alertas`, icon: "alert-triangle" },
  ];

  if (verReportes) {
    items.push({ id: `reportes-${basePath}`, label: "Reportes", path: `${basePath}/reportes`, icon: "activity" });
  }

  if (esSuperAdmin) {
    items.push({ id: `dispositivos-${basePath}`, label: "Dispositivos", path: `${basePath}/dispositivos`, icon: "monitor" });
  }

  items.push({ id: `database-${basePath}`, label: "Telemetría", path: `${basePath}/database`, icon: "database" });

  if (esSuperAdmin) {
    items.push({ id: `sedes-${basePath}`, label: "Sedes", path: `${basePath}/sedes`, icon: "building" });
  }

  return items;
}
