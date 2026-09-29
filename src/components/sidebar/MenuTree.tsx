import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { MenuItem } from "@/types";
import { Icon } from "@/components/Icon";

interface MenuTreeProps {
  items: MenuItem[];
  depth?: number;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
}

export function MenuTree({ items, depth = 0, collapsed = false, onExpandSidebar }: MenuTreeProps) {
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
                  <Icon name={item.icon ?? "dot"} className="h-4.5 w-4.5 shrink-0" />
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
                <Icon name={item.icon ?? "arrowRight"} className="h-4.5 w-4.5 shrink-0" />
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
                  <Icon name={item.icon ?? "dot"} className="h-4.5 w-4.5 shrink-0" />
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
                <Icon name={item.icon ?? "arrowRight"} className="h-4.5 w-4.5 shrink-0" />
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
