import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaStore } from "@/store/empresaStore";
import { Icon } from "@/components/Icon";
import { MenuTree } from "@/components/sidebar/MenuTree";
import { EmpresaAccordionItem } from "@/components/sidebar/EmpresaAccordionItem";
import { AdministracionMenu } from "@/components/sidebar/AdministracionMenu";

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { sesion } = useAuth();
  const { empresas, empresaActual: miEmpresa, cargarEmpresas, cargarEmpresaPorId } = useEmpresaStore();
  const esGlobal = sesion?.permisos.verTodasLasEmpresas ?? false;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const expandSidebar = () => {
    setCollapsed(false);
    try {
      localStorage.setItem("sidebar_collapsed", "false");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!sesion) return;
    if (esGlobal) {
      cargarEmpresas();
    } else if (sesion.usuario.empresaId !== null) {
      cargarEmpresaPorId(sesion.usuario.empresaId);
    }
  }, [sesion, esGlobal, cargarEmpresas, cargarEmpresaPorId]);

  return (
    <aside
      className={`sidebar-root ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}
    >
      {/* ─── Brand / Logo ─── */}
      <div className="sidebar-brand-area">
        {!collapsed ? (
          <>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Colapsar menú"
              className="sidebar-brand-btn"
            >
              <span className="sidebar-logo-icon">
                <Icon name="monitor" className="h-5 w-5 text-[#0df5c6]" />
              </span>
              <span className="sidebar-brand-text">
                <span className="sidebar-brand-title">EDGE SMART</span>
                {/* <span className="sidebar-brand-subtitle">PERU CONTROLS</span> */}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Colapsar menú"
              className="sidebar-collapse-btn"
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center gap-2">
            <button
              type="button"
              onClick={toggleCollapse}
              title="Peru Controls - Expandir menú"
              className="sidebar-expand-btn"
            >
              <Icon name="chevronRight" className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <div className="sidebar-scroll flex-1 overflow-y-auto min-h-0 space-y-1">
        {esGlobal ? (
          <nav className="space-y-0.5">
            <NavLink
              to="/dashboard"
              title="Inicio"
              className={({ isActive }) =>
                `sidebar-nav-link ${collapsed ? "sidebar-nav-link-collapsed-inline" : ""} ${isActive ? "sidebar-nav-link-active" : ""}`
              }
            >
              <Icon name="home" className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">Inicio</span>}
            </NavLink>

            <AdministracionMenu collapsed={collapsed} onExpandSidebar={expandSidebar} />

            <div className="sidebar-divider" />

            <div className="space-y-0.5">
              {empresas.map((e) => (
                <EmpresaAccordionItem
                  key={e.id}
                  empresa={e}
                  collapsed={collapsed}
                  onExpandSidebar={expandSidebar}
                />
              ))}
            </div>
          </nav>
        ) : (
          <nav className="space-y-0.5">
            {!collapsed && (
              <div className="sidebar-section-label">
                {miEmpresa?.nombre ?? "Mi empresa"}
              </div>
            )}
            {miEmpresa?.menu && (
              <MenuTree
                items={miEmpresa.menu}
                collapsed={collapsed}
                onExpandSidebar={expandSidebar}
              />
            )}
          </nav>
        )}
      </div>

      {/* ─── Cerrar sesión ─── */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={onLogout}
          title="Cerrar sesión"
          className={`sidebar-logout-btn ${collapsed ? "sidebar-logout-collapsed" : ""}`}
        >
          <Icon name="logout" className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}