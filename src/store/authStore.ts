import { create } from "zustand";
import type { Sesion } from "@/types";
import { login as loginApi } from "@/features/auth/api";
import { calcularPermisos } from "@/auth/permisos";
import { guardarSesion, obtenerSesion, limpiarSesion } from "@/utils/session";
import { mensajeError } from "@/shared/api/errores";
import { queryClient } from "@/app/queryClient";

interface AuthState {
  sesion: Sesion | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const sesionGuardada = obtenerSesion();

export const useAuthStore = create<AuthState>((set) => ({
  sesion: sesionGuardada && { ...sesionGuardada, permisos: calcularPermisos(sesionGuardada.usuario.roles) },
  error: null,

  login: async (email, password) => {
    set({ error: null });
    try {
      const { usuario, token } = await loginApi(email, password);
      const sesion: Sesion = { usuario, token, permisos: calcularPermisos(usuario.roles), fechaInicio: new Date().toISOString() };
      // La caché no puede sobrevivir a un cambio de usuario
      queryClient.clear();
      guardarSesion(sesion);
      set({ sesion });
      return true;
    } catch (err) {
      set({ error: mensajeError(err, "Error al iniciar sesión") });
      return false;
    }
  },

  logout: () => {
    limpiarSesion();
    queryClient.clear();
    set({ sesion: null });
  },
}));
