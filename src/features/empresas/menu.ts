import type { MenuItem } from "@/types";

/** Menú de cada empresa: una sola definición para el sidebar del SuperAdmin y el del usuario de empresa. */
export function menuEmpresa(id: number): MenuItem[] {
  return [
    { id: `home-${id}`, label: "Inicio", path: `/empresa/${id}`, icon: "home" },
    { id: `camiones-${id}`, label: "Unidades", path: `/empresa/${id}/camiones`, icon: "truck" },
    { id: `operadores-${id}`, label: "Operadores", path: `/empresa/${id}/operadores`, icon: "users" },
    { id: `geocercas-${id}`, label: "Geocercas", path: `/empresa/${id}/geocercas`, icon: "mapPin" },
    { id: `alertas-${id}`, label: "Alertas", path: `/empresa/${id}/alertas`, icon: "alert-triangle" },
    { id: `dispositivos-${id}`, label: "Dispositivos", path: `/empresa/${id}/dispositivos`, icon: "monitor" },
    { id: `database-${id}`, label: "Telemetría", path: `/empresa/${id}/database`, icon: "database" },
  ];
}
