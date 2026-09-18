import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { listarEmpresas, obtenerEmpresaPorId } from "../services/empresaService";
import type { Empresa, MenuItem } from "../types";
import { Icon } from "./Icon";

interface MenuTreeProps {
  items: MenuItem[];
  depth?: number;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
}

function MenuTree({ items, depth = 0, collapsed = false, onExpandSidebar }: MenuTreeProps) {
  const location = useLocation();
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const init = new Set<string>();
    items.forEach((item) => {
      if (item.children?.some((c) => c.path === location.pathname)) {
        init.add(item.id);
      }
    });
    return init;
  });

  useEffect(() => {
    items.forEach((item) => {
      if (item.children?.some((c) => c.path === location.pathname)) {
        setOpenIds((prev) => new Set([...prev, item.id]));
      }
    });
  }, [location.pathname, items]);

  const toggle = (id: string) => {
    if (collapsed && onExpandSidebar) {
      onExpandSidebar();
      setOpenIds(new Set([id]));
      return;
    }
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (collapsed) {
    return (
      <ul className="space-y-1">
        {items.map((item) => {
          const hasChildren = (item.children?.length ?? 0) > 0;

          if (hasChildren) {
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  title={item.label}
                  className="sidebar-nav-btn-collapsed"
                >
                  <Icon name={item.icon ?? "dot"} className="h-[18px] w-[18px] shrink-0" />
                </button>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <NavLink
                to={item.path ?? "#"}
                title={item.label}
                className={({ isActive }) =>
                  `sidebar-nav-link-collapsed ${isActive ? "sidebar-nav-active-collapsed" : ""}`
                }
              >
                <Icon name={item.icon ?? "arrowRight"} className="h-[18px] w-[18px] shrink-0" />
              </NavLink>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className={depth === 0 ? "space-y-0.5" : "mt-0.5 space-y-0.5 pl-6"}>
      {items.map((item) => {
        const hasChildren = (item.children?.length ?? 0) > 0;
        const isOpen = openIds.has(item.id);

        return (
          <li key={item.id}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={`sidebar-nav-parent ${isOpen ? "sidebar-nav-parent-open" : ""}`}
              >
                <span className="flex items-center gap-3 truncate">
                  <Icon name={item.icon ?? "dot"} className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <Icon
                  name="chevronDown"
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            ) : (
              <NavLink
                to={item.path ?? "#"}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? "sidebar-nav-link-active" : ""}`
                }
              >
                <Icon name={item.icon ?? "arrowRight"} className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )}
            {hasChildren && isOpen && (
              <MenuTree
                items={item.children!}
                depth={depth + 1}
                collapsed={false}
                onExpandSidebar={onExpandSidebar}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function EmpresaAccordionItem({
  empresa,
  collapsed,
  onExpandSidebar,
}: {
  empresa: Empresa;
  collapsed: boolean;
  onExpandSidebar: () => void;
}) {
  const location = useLocation();
  const estaEnEmpresa = location.pathname.startsWith(`/empresa/${empresa.id}`);
  const [open, setOpen] = useState(estaEnEmpresa);

  useEffect(() => {
    if (estaEnEmpresa) {
      setOpen(true);
    }
  }, [estaEnEmpresa]);

  const tieneMenu = (empresa.menu?.length ?? 0) > 0;

  if (collapsed) {
    if (tieneMenu) {
      return (
        <button
          type="button"
          onClick={() => {
            onExpandSidebar();
            setOpen(true);
          }}
          title={`${empresa.nombre} (Ver menú)`}
          className="sidebar-nav-btn-collapsed"
        >
          <Icon name="building" className="h-[18px] w-[18px] shrink-0" />
        </button>
      );
    }

    return (
      <NavLink
        to={`/empresa/${empresa.id}`}
        title={empresa.nombre}
        className={({ isActive }) =>
          `sidebar-nav-link-collapsed ${isActive ? "sidebar-nav-active-collapsed" : ""}`
        }
      >
        <Icon name="building" className="h-[18px] w-[18px] shrink-0" />
      </NavLink>
    );
  }

  if (!tieneMenu) {
    return (
      <NavLink
        to={`/empresa/${empresa.id}`}
        className={({ isActive }) =>
          `sidebar-nav-link ${isActive ? "sidebar-nav-link-active" : ""}`
        }
      >
        <Icon name="building" className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate">{empresa.nombre}</span>
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`sidebar-nav-parent ${open ? "sidebar-nav-parent-open" : ""}`}
      >
        <span className="flex items-center gap-3 truncate">
          <Icon name="building" className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{empresa.nombre}</span>
        </span>
        <Icon
          name="chevronDown"
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-1">
          <MenuTree
            items={empresa.menu!}
            depth={1}
            collapsed={false}
            onExpandSidebar={onExpandSidebar}
          />
        </div>
      )}
    </div>
  );
}

function AdministracionMenu({
  collapsed,
  onExpandSidebar,
}: {
  collapsed: boolean;
  onExpandSidebar: () => void;
}) {
  const { sesion } = useAuth();
  const [open, setOpen] = useState(true);
  const permisos = sesion?.permisos;

  const items: { label: string; path: string; icon: string }[] = [];
  if (permisos?.verTodasLasEmpresas) items.push({ label: "Empresas", path: "/empresas", icon: "building" });
  if (permisos?.gestionarUsuarios) items.push({ label: "Usuarios", path: "/usuarios", icon: "dot" });
  if (permisos?.gestionarUsuarios) items.push({ label: "Métricas y Metas", path: "/configuracion", icon: "dot" });

  if (items.length === 0) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => {
          onExpandSidebar();
          setOpen(true);
        }}
        title="Administración"
        className="sidebar-nav-btn-collapsed"
      >
        <Icon name="wrench" className="h-[18px] w-[18px] shrink-0" />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`sidebar-nav-parent ${open ? "sidebar-nav-parent-open" : ""}`}
      >
        <span className="flex items-center gap-3 truncate">
          <Icon name="wrench" className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">Administración</span>
        </span>
        <Icon name="chevronDown" className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-0.5 space-y-0.5 pl-6">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? "sidebar-nav-link-active" : ""}`
                }
              >
                <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { sesion } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [miEmpresa, setMiEmpresa] = useState<Empresa | null>(null);
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
      listarEmpresas().then(setEmpresas);
    } else if (sesion.usuario.empresaId !== null) {
      obtenerEmpresaPorId(sesion.usuario.empresaId).then((e) => setMiEmpresa(e ?? null));
    }
  }, [sesion, esGlobal]);

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