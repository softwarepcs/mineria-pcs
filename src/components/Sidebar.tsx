import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/Icon";
import { MenuTree } from "@/components/sidebar/MenuTree";
import { EmpresaAccordionItem } from "@/components/sidebar/EmpresaAccordionItem";
import { AdministracionMenu } from "@/components/sidebar/AdministracionMenu";
import { useEmpresas } from "@/features/empresas/hooks";
import { seccionesEmpresa } from "@/features/empresas/menu";
import { useAlertasAbiertas } from "@/features/alertas/hooks";

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
  const abiertas = useAlertasAbiertas(esGlobal ? null : miEmpresaId);

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
      <div className={`mb-1 flex ${collapsed ? "justify-center" : "justify-end"}`}>
        <button
          type="button"
          onClick={() => (collapsed ? expandSidebar() : guardar(true))}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="sidebar-collapse-btn"
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
        </button>
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
                <EmpresaAccordionItem key={e.id} basePath={`/empresa/${e.token}`} nombre={e.nombre} collapsed={collapsed} onExpandSidebar={expandSidebar} />
              ))}
            </div>
          </nav>
        ) : (
          <nav aria-label="Menú principal">
            {miEmpresaId &&
              seccionesEmpresa("/panel", esGlobal, sesion?.permisos.puede("REPORTES", "VER") ?? false, abiertas).map((sec) => (
                <div key={sec.titulo}>
                  {!collapsed ? <div className="sidebar-section-label">{sec.titulo}</div> : <div className="sidebar-divider" />}
                  <MenuTree items={sec.items} collapsed={collapsed} onExpandSidebar={expandSidebar} />
                </div>
              ))}
            <AdministracionMenu collapsed={collapsed} onExpandSidebar={expandSidebar} />
          </nav>
        )}
      </div>

      {!collapsed && <div className="sidebar-version">EDGE SMART · PCS · v1.0</div>}
      <div className="sidebar-footer">
        <button type="button" onClick={onLogout} title="Cerrar sesión" className={`sidebar-logout-btn ${collapsed ? "sidebar-logout-collapsed" : ""}`}>
          <Icon name="logout" className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
