const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getMaquinarias(): Promise<any[]> {
  const response = await fetch(`${API_URL}/maquinarias`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Error cargando maquinarias');
  return await response.json();
}

export async function getTelemetriaByMaquinaria(maquinariaId: string, fechaInicio: string, fechaFin: string) {
  const response = await fetch(`${API_URL}/telemetria/maquinaria/${maquinariaId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Error cargando telemetria');
  return await response.json();
}
