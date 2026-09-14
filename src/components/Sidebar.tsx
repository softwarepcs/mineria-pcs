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
                  className="flex h-10 w-full items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon name={item.icon ?? "dot"} className="h-4 w-4 shrink-0" />
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
                  `flex h-10 w-full items-center justify-center rounded-lg transition ${
                    isActive
                      ? "bg-blue-500/20 text-blue-300 shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon name={item.icon ?? "arrowRight"} className="h-4 w-4 shrink-0" />
              </NavLink>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className={depth === 0 ? "space-y-0.5" : "mt-0.5 space-y-0.5 border-l border-white/10 pl-3"}>
      {items.map((item) => {
        const hasChildren = (item.children?.length ?? 0) > 0;
        const isOpen = openIds.has(item.id);

        return (
          <li key={item.id}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  isOpen ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Icon name={item.icon ?? "dot"} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <Icon
                  name="chevronDown"
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            ) : (
              <NavLink
                to={item.path ?? "#"}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-blue-500/15 text-blue-300 font-medium"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon name={item.icon ?? "arrowRight"} className="h-4 w-4 shrink-0" />
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
          className="flex h-10 w-full items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-cyan-300"
        >
          <Icon name="building" className="h-4 w-4 shrink-0" />
        </button>
      );
    }

    return (
      <NavLink
        to={`/empresa/${empresa.id}`}
        title={empresa.nombre}
        className={({ isActive }) =>
          `flex h-10 w-full items-center justify-center rounded-lg transition ${
            isActive
              ? "bg-blue-500/20 text-blue-300 shadow-sm"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <Icon name="building" className="h-4 w-4 shrink-0" />
      </NavLink>
    );
  }

  if (!tieneMenu) {
    return (
      <NavLink
        to={`/empresa/${empresa.id}`}
        className={({ isActive }) =>
          `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive
              ? "bg-blue-500/15 text-blue-300"
              : "text-slate-200 hover:bg-white/5 hover:text-white"
          }`
        }
      >
        <Icon name="building" className="h-4 w-4 shrink-0" />
        <span className="truncate">{empresa.nombre}</span>
      </NavLink>
    );
  }

  return (
    <div className={`rounded-lg transition ${open ? "bg-white/5 ring-1 ring-cyan-500/40" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
          open ? "text-cyan-300" : "text-slate-200 hover:bg-white/5"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Icon name="building" className="h-4 w-4 shrink-0" />
          <span className="truncate">{empresa.nombre}</span>
        </span>
        <Icon
          name="chevronDown"
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-2 pb-2">
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
        className="flex h-10 w-full items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <Icon name="wrench" className="h-4 w-4 shrink-0" />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
          open ? "text-white" : "text-slate-200 hover:bg-white/5"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Icon name="wrench" className="h-4 w-4 shrink-0" />
          <span className="truncate">Administración</span>
        </span>
        <Icon name="chevronDown" className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-blue-500/15 text-blue-300 font-medium" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon name={item.icon} className="h-4 w-4 shrink-0" />
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
      className={`flex h-full ${
        collapsed ? "w-16 px-2" : "w-64 px-3"
      } shrink-0 flex-col border-r border-white/10 bg-[#0e1b2e] py-4 transition-all duration-300 ease-in-out`}
    >
      {/* Header con Peru Controls y la flecha para colapsar / desocultar */}
      <div className="mb-4 flex items-center justify-between px-1">
        {!collapsed ? (
          <>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Colapsar menú"
              className="flex items-center gap-2 truncate text-left transition hover:opacity-80"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px] shadow-blue-500" />
              <span className="truncate text-sm font-bold tracking-wide text-white">
                Peru Controls
              </span>
            </button>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Colapsar menú"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
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
              className="group flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/15 hover:text-blue-300"
            >
              <Icon name="chevronRight" className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Lista de navegación con su propio scroll interno */}
      <div className="sidebar-scroll flex-1 overflow-y-auto min-h-0 space-y-1">
        {esGlobal ? (
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              title="Tablero administrador"
              className={`flex items-center ${
                collapsed ? "h-10 justify-center px-0" : "gap-2 px-3 py-2"
              } rounded-lg text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white`}
            >
              <Icon name="home" className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">Tablero administrador</span>}
            </Link>

            <AdministracionMenu collapsed={collapsed} onExpandSidebar={expandSidebar} />

            <div className="my-3 border-t border-white/10" />

            <div className="space-y-1">
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
          <nav className="space-y-1">
            {!collapsed && (
              <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-slate-500 truncate">
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

      {/* Cerrar sesión: siempre fijado al pie del sidebar */}
      <div className="mt-auto shrink-0 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          title="Cerrar sesión"
          className={`flex w-full items-center ${
            collapsed ? "h-10 justify-center px-0" : "gap-2 px-3 py-2"
          } rounded-lg text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400`}
        >
          <Icon name="logout" className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}