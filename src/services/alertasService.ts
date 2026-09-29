import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function getAlertasEventos() {
  try {
    const response = await axios.get(`${API_URL}/alertas/eventos`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching alertas eventos:', error);
    throw error;
  }
}

export async function getEvidenciaEvento(eventoId: string) {
  try {
    const response = await axios.get(`${API_URL}/alertas/${eventoId}/evidencia`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching evidencia evento:', error);
    throw error;
  }
}

export async function getAlertaEventoById(eventoId: string) {
  try {
    const response = await axios.get(`${API_URL}/alertas/eventos/${eventoId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching detalle alerta:', error);
    throw error;
  }
}
