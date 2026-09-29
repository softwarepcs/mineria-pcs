import type { Empresa } from "@/types";

import { apiClient } from "@/utils/apiClient";

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
  try {
    const response = await apiClient.get('/empresas');
    const data = response.data;
  return data.map((e: any) => ({
    id: e.id,
    nombre: e.nombreRazonSocial,
    estado: e.estado,
    menu: generarMenuDefault(e.id),
    // En el listado global no cargamos toda la data pesada de analíticas
    indicadores: { unidades: 0, alertas: 0, disponibilidad: 0 }
  }));
  } catch (error) {
    throw new Error('Error cargando empresas desde el backend');
  }
}

/**
 * Llama al backend para obtener detalle de una empresa
 */
export async function obtenerEmpresaPorId(id: number): Promise<Empresa | undefined> {
  try {
    const response = await apiClient.get(`/empresas/${id}`);
    const e = response.data;
  
  // Llamamos al nuevo endpoint de analíticas
  let analyticsData: any = null;
  try {
    const analyticsRes = await apiClient.get(`/analytics/flota/dashboard?empresaId=${id}`);
    analyticsData = analyticsRes.data;
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
        periodo: "Sin datos",
        objetivoL100km: 0,
        reportando: 0,
        kmTotal: 0,
        consumoTotalL: 0,
        costoUsd: 0,
        precioUsdPorL: 0,
        rendimientoMedioL100km: 0,
        desvioVsObjetivoPct: 0,
        ralentiFlotaPct: 0,
        ralentiLitros: 0,
        ralentiUsd: 0,
        emisionesCo2Ton: 0,
        horasMotor: 0
      };

      const normalizedMaqs = rawMaqs.map((m: any, idx: number) => ({
        id: String(m.id || `c${idx + 1}`),
        placa: m.placa || `Unidad ${String(idx + 1).padStart(2, '0')}`,
        km: m.km ?? 0,
        litros: m.litros ?? 0,
        l100km: m.l100km ?? 0,
        desvioPct: m.desvioPct ?? 0,
        ralentiPct: m.ralentiPct ?? 0,
        horas: m.horas ?? 0,
        pctGasto: m.pctGasto ?? 0,
        co2Ton: m.co2Ton ?? 0,
        estado: m.estado === "conduccion" || m.estado === "en_linea"
          ? "conduccion"
          : m.estado === "ralenti" || m.estado === "revisar"
          ? "ralenti"
          : "offline",
        lat: m.lat ?? 0,
        lng: m.lng ?? 0
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
  } catch (error: any) {
    if (error.response?.status === 404) return undefined;
    throw new Error('Error cargando detalle de empresa');
  }
}
