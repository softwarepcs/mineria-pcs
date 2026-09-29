import { create } from 'zustand';
import type { Sesion } from '@/types';
import { login as loginService, obtenerPermisos } from '@/services/authService';
import { guardarSesion, obtenerSesion, limpiarSesion } from '@/utils/session';

interface AuthState {
  sesion: Sesion | null;
  cargando: boolean;
  error: string | null;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Inicializar sesión desde utils si existe
const sesionInicial = obtenerSesion();

export const useAuthStore = create<AuthState>((set) => ({
  sesion: sesionInicial,
  cargando: false, // Ya cargamos síncronamente desde localstorage
  error: null,

  login: async (usuario: string, password: string) => {
    set({ error: null });
    try {
      const { usuario: usuarioSesion, token } = await loginService(usuario, password);
      const nuevaSesion: Sesion = {
        usuario: usuarioSesion,
        permisos: obtenerPermisos(usuarioSesion.rol),
        fechaInicio: new Date().toISOString(),
        token: token,
      };
      set({ sesion: nuevaSesion });
      guardarSesion(nuevaSesion);
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || (err instanceof Error ? err.message : "Error al iniciar sesión") });
      return false;
    }
  },

  logout: () => {
    set({ sesion: null });
    limpiarSesion();
    
  }
}));
