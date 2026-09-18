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
    { id: `geocercas-${id}`, label: "Geocercas", path: `/empresa/${id}/geocercas`, icon: "mapPin" },
    { id: `operadores-${id}`, label: "Operadores", path: `/empresa/${id}/operadores`, icon: "users" },
    { id: `alertas-${id}`, label: "Alertas", path: `/empresa/${id}/alertas`, icon: "alert-triangle" },
    { id: `camiones-${id}`, label: "Camiones", path: `/empresa/${id}/camiones`, icon: "truck" },
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
    flota: (() => {
      const fl = (analyticsData && (analyticsData.maquinarias || analyticsData.camiones)) ? analyticsData : (e.flota || {});
      const rawMaqs = fl.maquinarias || fl.camiones || [];
      const resumen = fl.resumen || {
        equipos: rawMaqs.length,
        periodo: "Septiembre 2026",
        objetivoL100km: 40.0,
        reportando: rawMaqs.length,
        kmTotal: 35150,
        consumoTotalL: 14430,
        costoUsd: 15873,
        precioUsdPorL: 1.10,
        rendimientoMedioL100km: 41.1,
        desvioVsObjetivoPct: 2.6,
        ralentiFlotaPct: 16.2,
        ralentiLitros: 2338,
        ralentiUsd: 2572,
        emisionesCo2Ton: 38.7,
        horasMotor: 1133
      };

      const normalizedMaqs = rawMaqs.map((m: any, idx: number) => ({
        id: String(m.id || `c${idx + 1}`),
        placa: m.placa || `TC-TRUCK-${String(idx + 1).padStart(2, '0')}`,
        km: m.km ?? 6500,
        litros: m.litros ?? 2800,
        l100km: m.l100km ?? 38.5,
        desvioPct: m.desvioPct ?? 0,
        ralentiPct: m.ralentiPct ?? 14,
        horas: m.horas ?? 180,
        pctGasto: m.pctGasto ?? 16,
        co2Ton: m.co2Ton ?? 3.5,
        estado: m.estado === "conduccion" || m.estado === "en_linea"
          ? "conduccion"
          : m.estado === "ralenti" || m.estado === "revisar"
          ? "ralenti"
          : "offline",
        lat: m.lat ?? (-34.588 + (idx * 0.015)),
        lng: m.lng ?? (-58.41 - (idx * 0.018))
      }));

      return {
        resumen,
        maquinarias: normalizedMaqs
      };
    })(),
    indicadores: { 
      unidades: analyticsData?.resumen?.equipos || e.indicadores?.unidades || 0, 
      alertas: e.indicadores?.alertas || 0, 
      disponibilidad: e.indicadores?.disponibilidad || 100 
    }
  };
}
