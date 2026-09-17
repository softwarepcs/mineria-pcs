// Roles del sistema
// 1 = Administrador principal
// 2 = Administrador
// 3 = Empresa
export type Rol = 1 | 2 | 3;

export interface Usuario {
  id: number;
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
  empresaId: number | null;
  empresaNombre?: string;
}

export type UsuarioSesion = Omit<Usuario, "password">;

export interface MenuItem {
  id: string;
  label: string;
  path?: string;       // si no tiene children, es un link
  icon?: string;        // nombre del ícono (ver Icon.tsx)
  children?: MenuItem[];
}

export interface Empresa {
  id: number;
  nombre: string;
  estado: "activa" | "inactiva";
  indicadores?: {
    unidades: number;
    alertas: number;
    disponibilidad: number;
  };
  menu?: MenuItem[];
  homeView?: "flota" | "default";
  flota?: {
    resumen: FlotaResumen;
    maquinarias: Maquinaria[];
  };
}

export interface Permisos {
  verTodasLasEmpresas: boolean;
  gestionarUsuarios: boolean;
  verConfiguracion: boolean;
  verReportes: boolean;
}

export interface Sesion {
  usuario: UsuarioSesion;
  permisos: Permisos;
  fechaInicio: string;
}

export interface MenuItemLegacy {
  label: string;
  path: string;
  icon?: string;
}

export interface Maquinaria {
  id: string;
  placa: string;
  km: number;
  litros: number;
  l100km: number;
  desvioPct: number;
  ralentiPct: number;
  horas: number;
  pctGasto: number;
    co2Ton: number;
  estado: "conduccion" | "offline" | "ralenti" | "revisar";
  lat: number;
  lng: number;
}

export interface FlotaResumen {
  equipos: number;
  periodo: string;
  objetivoL100km: number;
  reportando: number;
  kmTotal: number;
  consumoTotalL: number;
  costoUsd: number;
  precioUsdPorL: number;
  rendimientoMedioL100km: number;
  desvioVsObjetivoPct: number;
  ralentiFlotaPct: number;
  ralentiLitros: number;
  ralentiUsd: number;
  emisionesCo2Ton: number;
  horasMotor: number;
}