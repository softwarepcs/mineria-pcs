import type { Empresa } from "../types";

const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function generarMenuDefault(id: number) {
  return [
    { id: `home-${id}`, label: "Home", path: `/empresa/${id}`, icon: "home" },
    { id: `alertas-${id}`, label: "Alertas", path: `/empresa/${id}/alertas`, icon: "alert-triangle" },
    { id: `database-${id}`, label: "Data Base", path: `/empresa/${id}/database`, icon: "database" }
  ];
}

// Función eliminada porque ahora obtenemos estos datos directo de nuestro backend Analytics

/**
 * Llama al backend para listar las empresas (Empresas)
 */
export async function listarEmpresas(): Promise<Empresa[]> {
  const response = await fetch(`${API_URL}/empresas`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Error cargando empresas desde el backend');
  }
  
  const data = await response.json();
  return data.map((e: any) => ({
    id: e.id,
    nombre: e.nombreRazonSocial,
    estado: e.estado,
    menu: generarMenuDefault(e.id),
    // En el listado global no cargamos toda la data pesada de analíticas
    indicadores: { unidades: 0, alertas: 0, disponibilidad: 0 }
  }));
}

/**
 * Llama al backend para obtener detalle de una empresa
 */
export async function obtenerEmpresaPorId(id: number): Promise<Empresa | undefined> {
  const response = await fetch(`${API_URL}/empresas/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error('Error cargando detalle de empresa');
  }

  const e = await response.json();
  
  // Llamamos al nuevo endpoint de analíticas
  let analyticsData: any = null;
  try {
    const analyticsRes = await fetch(`${API_URL}/analytics/flota/dashboard?empresaId=${id}`, {
      headers: getAuthHeaders()
    });
    if (analyticsRes.ok) {
      analyticsData = await analyticsRes.json();
    }
  } catch (error) {
    console.error("Error obteniendo analíticas:", error);
  }

  return {
    id: e.id,
    nombre: e.nombreRazonSocial,
    estado: e.estado,
    menu: generarMenuDefault(e.id),
    homeView: "flota", // Mantenemos la vista por defecto
    flota: (analyticsData && analyticsData.maquinarias) ? analyticsData : {
      resumen: {
        equipos: 0, periodo: "N/A", objetivoL100km: 0, reportando: 0, kmTotal: 0,
        consumoTotalL: 0, costoUsd: 0, precioUsdPorL: 0, rendimientoMedioL100km: 0,
        desvioVsObjetivoPct: 0, ralentiFlotaPct: 0, ralentiLitros: 0, ralentiUsd: 0,
        emisionesCo2Ton: 0, horasMotor: 0
      },
      maquinarias: []
    },
    indicadores: { 
      unidades: analyticsData?.resumen?.equipos || 0, 
      alertas: 0, // Próximo paso: leer alertas de la BD
      disponibilidad: 100 
    }
  };
}
