import type { MenuItem, Rol } from "../types";
import { useAuth } from "./useAuth";

const MENU_ROL_1: MenuItem[] = [
  { id: "m1-dash", label: "Dashboard", path: "/dashboard", icon: "home" },
  { id: "m1-emp", label: "Empresas", path: "/empresas", icon: "building" },
  { id: "m1-usr", label: "Usuarios", path: "/usuarios", icon: "dot" },
  { id: "m1-rep", label: "Reportes", path: "/reportes", icon: "activity" },
  { id: "m1-cfg", label: "Configuración", path: "/configuracion", icon: "wrench" },
];

const MENU_ROL_2: MenuItem[] = [
  { id: "m2-dash", label: "Dashboard", path: "/dashboard", icon: "home" },
  { id: "m2-emp", label: "Empresas", path: "/empresas", icon: "building" },
  { id: "m2-rep", label: "Reportes", path: "/reportes", icon: "activity" },
  { id: "m2-cfg", label: "Configuración", path: "/configuracion", icon: "wrench" },
];

function menuRol3(): MenuItem[] {
  return [
    { id: "m3-dash", label: "Dashboard", path: "/dashboard", icon: "home" },
    { id: "m3-info", label: "Información", path: "/informacion", icon: "building" },
    { id: "m3-rep", label: "Reportes", path: "/reportes", icon: "activity" },
  ];
}

function menuPorRol(rol: Rol): MenuItem[] {
  if (rol === 1) return MENU_ROL_1;
  if (rol === 2) return MENU_ROL_2;
  return menuRol3();
}

export function useMenu(): MenuItem[] {
  const { sesion } = useAuth();
  if (!sesion) return [];
  return menuPorRol(sesion.usuario.rol);
}
