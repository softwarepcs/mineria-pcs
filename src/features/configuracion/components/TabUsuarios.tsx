import { Link } from "react-router-dom";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useConfigAlertas } from "@/features/alertas/hooks";
import type { UsuarioAviso } from "@/features/alertas/api";
import { etiquetaRol } from "@/auth/permisos";
import { Badge } from "@/shared/ui/Badge";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { Panel } from "@/shared/ui/Panel";
import { fechaHora } from "@/shared/utils/formato";

/** Configuración › Usuarios: listado de usuarios de la empresa con rol, estado y último ingreso. */
export function TabUsuarios({ empresa, esSuperAdmin }: { empresa: EmpresaDetalle; esSuperAdmin: boolean }) {
  const cfg = useConfigAlertas(empresa.id);

  const columnas: Columna<UsuarioAviso>[] = [
    { key: "n", encabezado: "Usuario", render: (u) => <div><p className="font-semibold text-white">{u.nombre}</p><p className="text-[11px] text-slate-500">{u.email ?? "—"}</p></div> },
    { key: "r", encabezado: "Rol", render: (u) => etiquetaRol(u.roles) || "—" },
    { key: "e", encabezado: "Estado", render: (u) => <Badge etiqueta={u.estado} variante={u.estado === "ACTIVO" ? "success" : "neutral"} /> },
    { key: "i", encabezado: "Último ingreso", render: (u) => (u.ultimoIngresoEn ? fechaHora(u.ultimoIngresoEn) : <span className="text-slate-500">Nunca</span>) },
  ];

  if (cfg.isLoading) return <Cargando />;
  if (cfg.isError || !cfg.data) return <ErrorCarga error={cfg.error} onReintentar={() => void cfg.refetch()} />;

  return (
    <Panel padding="sm">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white">Usuarios ({cfg.data.usuarios.length})</h2>
        {esSuperAdmin ? <Link to="/usuarios" className="rounded-lg bg-[#2BC4E8] px-4 py-2 text-sm font-semibold text-slate-900">Invitar / crear usuario</Link> : <span className="text-[11px] text-slate-500">Solo un SuperAdmin puede crear usuarios.</span>}
      </div>
      <DataTable columnas={columnas} datos={cfg.data.usuarios} keyExtractor={(u) => u.id} minWidth="560px" vacio={<SinDatos titulo="Sin usuarios" />} />
    </Panel>
  );
}
