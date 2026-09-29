import { apiClient } from "@/utils/apiClient";

export interface Operador {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  licencia: string;
  categoriaLicencia: string;
  vencimientoLicencia: string;
  telefono: string;
  estado: string; // 'activo' | 'inactivo' | 'vacaciones'
  // Campos mock legados para la UI:
  nombre?: string;
  legajo?: string;
  maquinariaId?: string;
  indice?: number;
  kmPeriodo?: number;
  horas?: number;
  conduccionBrusca?: number;
  atribucion?: number;
  [key: string]: any;
}

export async function getOperadores(): Promise<Operador[]> {
  const response = await apiClient.get("/operadores");
  return response.data.data || response.data || [];
}

export async function getOperadorById(id: string | number): Promise<Operador | null> {
  try {
    const response = await apiClient.get(`/operadores/${id}`);
    return response.data.data || response.data;
  } catch {
    return null;
  }
}

export async function crearOperador(data: Partial<Operador>): Promise<Operador> {
  const response = await apiClient.post("/operadores", data);
  return response.data.data || response.data;
}

export async function actualizarOperador(id: string, data: Partial<Operador>): Promise<Operador> {
  const response = await apiClient.patch(`/operadores/${id}`, data);
  return response.data.data || response.data;
}

export async function eliminarOperador(id: string): Promise<void> {
  await apiClient.delete(`/operadores/${id}`);
}
