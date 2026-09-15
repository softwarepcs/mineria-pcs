import type { UsuarioSesion, Rol } from "../types";

const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function listarUsuarios(): Promise<UsuarioSesion[]> {
  const response = await fetch(`${API_URL}/usuarios`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error cargando usuarios desde el backend');
  }

  const data = await response.json();
  
  return data.map((u: any) => {
    // Mapeamos el rol del backend al rol numérico del frontend
    // Backend: roles = [{ rol: { id: 1, nombre: "SuperAdmin" } }]
    // Frontend: 1 = Admin Principal, 2 = Admin, 3 = Empresa
    let rolId: Rol = 3;
    if (u.roles && u.roles.length > 0) {
      const backendRolName = u.roles[0]?.rol?.nombre;
      if (backendRolName === 'SuperAdmin') rolId = 1;
      else if (backendRolName === 'Admin') rolId = 2;
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
}
