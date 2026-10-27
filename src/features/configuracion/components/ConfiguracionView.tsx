import { useSearchParams } from "react-router-dom";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useAuth } from "@/hooks/useAuth";
import { GeocercasView } from "@/features/geocercas/components/GeocercasView";
import { PageHeader } from "@/shared/ui/PageHeader";
import { TabCamiones } from "./TabCamiones";
import { TabUsuarios } from "./TabUsuarios";
import { TabAlertas } from "./TabAlertas";

const TABS = [
  { id: "camiones", etiqueta: "Camiones" },
  { id: "geocercas", etiqueta: "Geocercas" },
  { id: "usuarios", etiqueta: "Usuarios" },
  { id: "alertas", etiqueta: "Alertas" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function ConfiguracionView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "camiones") as TabId;
  const esSuperAdmin = sesion?.permisos.esSuperAdmin ?? false;

  return (
    <div className="flex w-full max-w-full flex-col gap-4 sm:gap-5">
      <PageHeader titulo="Configuración" descripcion={`Camiones, geocercas, usuarios y avisos · ${empresa.nombre}`} />
      <div className="inline-flex w-fit rounded-lg border border-slate-800 bg-[#0C2133] p-0.5" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams({ tab: t.id }, { replace: true })}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === t.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>
      {tab === "camiones" && <TabCamiones empresa={empresa} />}
      {tab === "geocercas" && <GeocercasView empresa={empresa} />}
      {tab === "usuarios" && <TabUsuarios empresa={empresa} esSuperAdmin={esSuperAdmin} />}
      {tab === "alertas" && <TabAlertas empresa={empresa} />}
    </div>
  );
}
