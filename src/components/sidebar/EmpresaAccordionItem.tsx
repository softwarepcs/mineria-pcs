import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { menuEmpresa } from "@/features/empresas/menu";
import { Icon } from "@/components/Icon";
import { MenuTree } from "@/components/sidebar/MenuTree";

export function EmpresaAccordionItem({
  empresaId,
  nombre,
  collapsed,
  onExpandSidebar,
}: {
  empresaId: number;
  nombre: string;
  collapsed: boolean;
  onExpandSidebar: () => void;
}) {
  const empresa = { id: empresaId, nombre, menu: menuEmpresa(empresaId) };
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
          <Icon name="building" className="h-4.5 w-4.5 shrink-0" />
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
        <Icon name="building" className="h-4.5 w-4.5 shrink-0" />
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
        <Icon name="building" className="h-4.5 w-4.5 shrink-0" />
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
          <Icon name="building" className="h-4.5 w-4.5 shrink-0" />
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
