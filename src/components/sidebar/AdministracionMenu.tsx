import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/Icon";

export function AdministracionMenu({
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
        <Icon name="wrench" className="h-4.5 w-4.5 shrink-0" />
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
          <Icon name="wrench" className="h-4.5 w-4.5 shrink-0" />
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
                <Icon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
