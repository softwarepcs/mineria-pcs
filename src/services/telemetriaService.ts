import { apiClient } from "@/utils/apiClient";

export async function getMaquinarias(): Promise<any[]> {
  const response = await apiClient.get('/maquinarias');
  return response.data.data || response.data;
}

export async function getTelemetriaByMaquinaria(maquinariaId: string, fechaInicio?: string, fechaFin?: string, limite: number = 5000) {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio.includes('T') ? fechaInicio : `${fechaInicio}T00:00:00.000Z`);
  if (fechaFin) params.append('fechaFin', fechaFin.includes('T') ? fechaFin : `${fechaFin}T23:59:59.999Z`);
  params.append('limite', limite.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get(`/telemetria/maquinaria/${maquinariaId}${queryString}`);
  return response.data.data || response.data;
}
