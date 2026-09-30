import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/Icon";
import { MenuTree } from "@/components/sidebar/MenuTree";
import { EmpresaAccordionItem } from "@/components/sidebar/EmpresaAccordionItem";
import { AdministracionMenu } from "@/components/sidebar/AdministracionMenu";
import { useEmpresa, useEmpresas } from "@/features/empresas/hooks";
import { menuEmpresa } from "@/features/empresas/menu";

function leerColapsado() {
  try {
    return localStorage.getItem("sidebar_collapsed") === "true";
  } catch {
    return false;
  }
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { sesion } = useAuth();
  const esGlobal = sesion?.permisos.verTodasLasEmpresas ?? false;
  const miEmpresaId = sesion?.usuario.empresaId ?? null;

  const { data: empresas = [] } = useEmpresas(esGlobal);
  const { data: miEmpresa } = useEmpresa(esGlobal ? null : miEmpresaId);

  const [collapsed, setCollapsed] = useState<boolean>(leerColapsado);
  const guardar = (v: boolean) => {
    setCollapsed(v);
    try {
      localStorage.setItem("sidebar_collapsed", String(v));
    } catch {
      // sin almacenamiento local: el estado vive solo en memoria
    }
  };
  const expandSidebar = () => guardar(false);

  return (
    <aside className={`sidebar-root ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
      <div className="sidebar-brand-area">
        {!collapsed ? (
          <>
            <button type="button" onClick={() => guardar(true)} title="Colapsar menú" className="sidebar-brand-btn">
              <span className="sidebar-logo-icon">
                <Icon name="monitor" className="h-5 w-5 text-[#0df5c6]" />
              </span>
              <span className="sidebar-brand-text">
                <span className="sidebar-brand-title">EDGE SMART</span>
              </span>
            </button>
            <button type="button" onClick={() => guardar(true)} title="Colapsar menú" className="sidebar-collapse-btn">
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center gap-2">
            <button type="button" onClick={expandSidebar} title="Expandir menú" className="sidebar-expand-btn">
              <Icon name="chevronRight" className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto">
        {esGlobal ? (
          <nav className="space-y-0.5">
            <NavLink
              to="/dashboard"
              title="Inicio"
              className={({ isActive }) => `sidebar-nav-link ${collapsed ? "sidebar-nav-link-collapsed-inline" : ""} ${isActive ? "sidebar-nav-link-active" : ""}`}
            >
              <Icon name="home" className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">Inicio</span>}
            </NavLink>
            <AdministracionMenu collapsed={collapsed} onExpandSidebar={expandSidebar} />
            <div className="sidebar-divider" />
            <div className="space-y-0.5">
              {empresas.map((e) => (
                <EmpresaAccordionItem key={e.id} empresaId={e.id} nombre={e.nombre} collapsed={collapsed} onExpandSidebar={expandSidebar} />
              ))}
            </div>
          </nav>
        ) : (
          <nav className="space-y-0.5">
            {!collapsed && <div className="sidebar-section-label">{miEmpresa?.nombre ?? "Mi empresa"}</div>}
            {miEmpresaId && <MenuTree items={menuEmpresa(miEmpresaId)} collapsed={collapsed} onExpandSidebar={expandSidebar} />}
            <AdministracionMenu collapsed={collapsed} onExpandSidebar={expandSidebar} />
          </nav>
        )}
      </div>

      <div className="sidebar-footer">
        <button type="button" onClick={onLogout} title="Cerrar sesión" className={`sidebar-logout-btn ${collapsed ? "sidebar-logout-collapsed" : ""}`}>
          <Icon name="logout" className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
