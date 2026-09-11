import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { Sidebar } from "../components/Sidebar";

const NOMBRE_ROL: Record<number, string> = {
  1: "Administrador principal",
  2: "Administrador",
  3: "Empresa",
};

export function MainLayout({ children }: { children: ReactNode }) {
  const { sesion, logout } = useAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b1220]">
      <Sidebar onLogout={logout} />

      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden">
        <header className="shrink-0 flex items-center justify-end border-b border-white/10 px-6 py-3 bg-[#0b1220]/80 backdrop-blur-sm z-10">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{sesion?.usuario.nombre}</div>
            <div className="text-xs text-slate-400">
              {sesion ? NOMBRE_ROL[sesion.usuario.rol] : ""}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 min-w-0 sidebar-scroll">{children}</main>
      </div>
    </div>
  );
}