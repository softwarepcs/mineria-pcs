import type { UsuarioSesion, Rol } from "@/types";

import { apiClient } from "@/utils/apiClient";

export async function listarUsuarios(page = 1, limit = 10): Promise<{ data: UsuarioSesion[], meta: any }> {
  const response = await apiClient.get(`/usuarios?page=${page}&limit=${limit}`);
  const data = response.data.data || response.data;
  
  const mappedData = data.map((u: any) => {
    // Mapeamos el rol del backend al rol numérico del frontend
    // Backend: roles = [{ rol: { id: 1, nombre: "SuperAdmin" } }]
    // Frontend: 1 = Admin Principal, 2 = Admin, 3 = Empresa
    let rolId: Rol = 3;
    if (u.roles && u.roles.length > 0) {
      const backendRolName = u.roles[0]?.rol?.nombre;
      if (backendRolName === 'SuperAdmin') rolId = 1;
      else if (backendRolName === 'Administrador' || backendRolName === 'Admin') rolId = 2;
      else if (backendRolName === 'User') rolId = 3;
    }

    return {
      id: u.id,
      email: u.email,
      nombre: u.nombres,
      rol: rolId,
      empresaId: u.empresaId || null,
      empresaNombre: u.empresa?.nombreRazonSocial,
    };
  });

  return {
    data: mappedData,
    meta: response.data.meta || { page, limit, total: mappedData.length }
  };
}
