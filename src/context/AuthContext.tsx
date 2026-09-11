import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Sesion, UsuarioSesion } from "../types";
import { login as loginService, obtenerPermisos } from "../services/authService";
import { guardarSesion, obtenerSesion, limpiarSesion } from "../utils/session";

interface AuthContextType {
  sesion: Sesion | null;
  cargando: boolean;
  error: string | null;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sesionGuardada = obtenerSesion();
    if (sesionGuardada) {
      setSesion(sesionGuardada);
    }
    setCargando(false);
  }, []);

  async function login(usuario: string, password: string): Promise<boolean> {
    setError(null);
    try {
      const usuarioSesion: UsuarioSesion = await loginService(usuario, password);
      const nuevaSesion: Sesion = {
        usuario: usuarioSesion,
        permisos: obtenerPermisos(usuarioSesion.rol),
        fechaInicio: new Date().toISOString(),
      };
      setSesion(nuevaSesion);
      guardarSesion(nuevaSesion);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      return false;
    }
  }

  function logout() {
    setSesion(null);
    limpiarSesion();
  }

  return (
    <AuthContext.Provider value={{ sesion, cargando, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
