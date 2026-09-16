import { useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { Sidebar } from "../components/Sidebar";
import { Menu, X } from "lucide-react";

const NOMBRE_ROL: Record<number, string> = {
  1: "Administrador principal",
  2: "Administrador",
  3: "Empresa",
};

export function MainLayout({ children }: { children: ReactNode }) {
  const { sesion, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b1220]">
      {/* Sidebar para Escritorio */}
      <div className="hidden md:block">
        <Sidebar onLogout={logout} />
      </div>

      {/* Menú móvil tipo cajón (drawer) */}
      {menuAbierto && (
        <div className="fixed inset-0 z-[9999] flex md:hidden">
          {/* Fondo oscuro */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMenuAbierto(false)}></div>
          {/* Contenedor del Sidebar */}
          <div className="relative flex w-[260px] flex-col bg-[#0e1b2e] shadow-2xl transition-transform" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuAbierto(false)}
              className="absolute -right-12 top-3 rounded-full bg-white/10 p-2 text-white hover:bg-red-500/80"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-full overflow-y-auto" onClick={() => setMenuAbierto(false)}>
              <Sidebar onLogout={logout} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden relative">
        <header className="shrink-0 flex items-center justify-between md:justify-end border-b border-white/10 px-4 md:px-6 py-3 bg-[#0b1220]/90 backdrop-blur-sm z-10">
          <button 
            className="md:hidden rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white ring-1 ring-white/20"
            onClick={() => setMenuAbierto(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="text-right">
            <div className="text-sm font-medium text-white">{sesion?.usuario.nombre}</div>
            <div className="text-xs text-slate-400">
              {sesion ? NOMBRE_ROL[sesion.usuario.rol] : ""}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 min-w-0 sidebar-scroll relative">{children}</main>
      </div>
    </div>
  );
}