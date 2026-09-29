import { apiClient } from "@/utils/apiClient";
export async function getAlertasEventos() {
  try {
    const response = await apiClient.get(`/alertas/eventos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alertas eventos:', error);
    throw error;
  }
}

export async function getEvidenciaEvento(eventoId: string) {
  try {
    const response = await apiClient.get(`/alertas/${eventoId}/evidencia`);
    return response.data;
  } catch (error) {
    console.error('Error fetching evidencia evento:', error);
    throw error;
  }
}

export async function getAlertaEventoById(eventoId: string) {
  try {
    const response = await apiClient.get(`/alertas/eventos/${eventoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching detalle alerta:', error);
    throw error;
  }
}
