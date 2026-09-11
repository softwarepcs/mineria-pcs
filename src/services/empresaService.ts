import empresasData from "../data/empresas.json";
import type { Empresa } from "../types";

const empresas = empresasData as Empresa[];

/**
 * En una fase posterior este archivo se reemplaza por llamadas
 * a una API real (ej. GET /api/empresas, GET /api/empresas/:id),
 * manteniendo la misma firma de funciones.
 */
export async function listarEmpresas(): Promise<Empresa[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return empresas;
}

export async function obtenerEmpresaPorId(id: number): Promise<Empresa | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return empresas.find((e) => e.id === id);
}
