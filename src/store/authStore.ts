import { create } from "zustand";
import type { Sesion } from "@/types";
import { login as loginApi, cerrarSesionEnServidor, usuarioDeRespuesta } from "@/features/auth/api";
import { calcularPermisos } from "@/auth/permisos";
import { guardarSesion, obtenerSesion, limpiarSesion, fijarAccessToken, CLAVE_SESION } from "@/utils/session";
import { mensajeError } from "@/shared/api/errores";
import { renovarSesion } from "@/shared/api/client";
import { queryClient } from "@/app/queryClient";

interface AuthState {
  sesion: Sesion | null;
  /** false mientras se restaura la sesión con la cookie al abrir/recargar la página. */
  listo: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const guardada = obtenerSesion();

export const useAuthStore = create<AuthState>((set) => ({
  sesion: guardada && { ...guardada, permisos: calcularPermisos(guardada.usuario.roles, guardada.usuario.permisos ?? []) },
  // Sin sesión guardada no hay nada que restaurar
  listo: !guardada,
  error: null,

  login: async (email, password) => {
    set({ error: null });
    try {
      const { usuario, token } = await loginApi(email, password);
      const datos = { usuario, fechaInicio: new Date().toISOString() };
      // La caché no puede sobrevivir a un cambio de usuario
      queryClient.clear();
      fijarAccessToken(token);
      guardarSesion(datos);
      set({ sesion: { ...datos, permisos: calcularPermisos(usuario.roles, usuario.permisos) }, listo: true });
      return true;
    } catch (err) {
      set({ error: mensajeError(err, "Error al iniciar sesión") });
      return false;
    }
  },

  logout: () => {
    // El servidor revoca la sesión y borra la cookie; el cierre local no espera la respuesta
    void cerrarSesionEnServidor();
    limpiarSesion();
    queryClient.clear();
    set({ sesion: null, listo: true });
  },
}));

// Al abrir o recargar la página el access token (en memoria) se perdió: se pide uno nuevo con la cookie.
// También refresca los roles guardados por si cambiaron.
if (guardada) {
  renovarSesion()
    .then((data) => {
      const usuario = usuarioDeRespuesta(data, guardada.usuario.email);
      const datos = { usuario, fechaInicio: guardada.fechaInicio };
      guardarSesion(datos);
      useAuthStore.setState({ sesion: { ...datos, permisos: calcularPermisos(usuario.roles, usuario.permisos) }, listo: true });
    })
    .catch(() => {
      limpiarSesion();
      useAuthStore.setState({ sesion: null, listo: true });
    });
}

// Si otra pestaña cierra la sesión, esta también se cierra
window.addEventListener("storage", (e) => {
  if (e.key === CLAVE_SESION && !e.newValue) {
    fijarAccessToken(null);
    queryClient.clear();
    useAuthStore.setState({ sesion: null, listo: true });
  }
});
