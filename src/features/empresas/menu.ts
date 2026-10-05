import type { MenuItem } from "@/types";

/** Menú de cada empresa: una sola definición para el sidebar del SuperAdmin y el del usuario de empresa. */
export function menuEmpresa(basePath: string): MenuItem[] {
  return [
    { id: `home-${basePath}`, label: "Inicio", path: basePath, icon: "home" },
    { id: `camiones-${basePath}`, label: "Unidades", path: `${basePath}/camiones`, icon: "truck" },
    { id: `operadores-${basePath}`, label: "Operadores", path: `${basePath}/operadores`, icon: "users" },
    { id: `geocercas-${basePath}`, label: "Geocercas", path: `${basePath}/geocercas`, icon: "mapPin" },
    { id: `alertas-${basePath}`, label: "Alertas", path: `${basePath}/alertas`, icon: "alert-triangle" },
    { id: `dispositivos-${basePath}`, label: "Dispositivos", path: `${basePath}/dispositivos`, icon: "monitor" },
    { id: `database-${basePath}`, label: "Telemetría", path: `${basePath}/database`, icon: "database" },
    { id: `sedes-${basePath}`, label: "Sedes", path: `${basePath}/sedes`, icon: "building" },
  ];
}
