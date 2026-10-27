import { Link } from "react-router-dom";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useConfigAlertas, useGuardarDestinatario } from "@/features/alertas/hooks";
import type { TipoAlerta, UsuarioAviso } from "@/features/alertas/api";
import { etiquetaRol } from "@/auth/permisos";
import { mensajeError } from "@/shared/api/errores";
import { avisar } from "@/shared/ui/Avisos";
import { Badge } from "@/shared/ui/Badge";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { Panel } from "@/shared/ui/Panel";
import { fechaHora } from "@/shared/utils/formato";

function Interruptor({ activo, onCambiar, etiqueta, bloqueado }: { activo: boolean; onCambiar: (v: boolean) => void; etiqueta: string; bloqueado?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={bloqueado}
      onClick={() => onCambiar(!activo)}
      className={`relative h-5 w-9 rounded-full transition disabled:opacity-50 ${activo ? "bg-[#2BC4E8]" : "bg-slate-700"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${activo ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}
export { Interruptor };

/** Configuración › Usuarios: quién recibe avisos de consumo y de geocercas, y su último ingreso. */
export function TabUsuarios({ empresa, esSuperAdmin }: { empresa: EmpresaDetalle; esSuperAdmin: boolean }) {
  const cfg = useConfigAlertas(empresa.id);
  const guardar = useGuardarDestinatario(empresa.id);

  const cambiar = (tipo: TipoAlerta, u: UsuarioAviso, recibe: boolean) =>
    guardar.mutate({ tipo, usuarioId: u.id, recibe }, { onError: (e) => avisar.error(mensajeError(e)) });

  const columnas: Columna<UsuarioAviso>[] = [
    { key: "n", encabezado: "Usuario", render: (u) => <div><p className="font-semibold text-white">{u.nombre}</p><p className="text-[11px] text-slate-500">{u.email ?? "—"}</p></div> },
    { key: "r", encabezado: "Rol", render: (u) => etiquetaRol(u.roles) || "—" },
    { key: "e", encabezado: "Estado", render: (u) => <Badge etiqueta={u.estado} variante={u.estado === "ACTIVO" ? "success" : "neutral"} /> },
    { key: "c", encabezado: "Recibe consumo", alinear: "center", render: (u) => <Interruptor activo={u.recibeConsumo} etiqueta={`${u.nombre} recibe alertas de consumo`} onCambiar={(v) => cambiar("CONSUMO", u, v)} /> },
    { key: "g", encabezado: "Recibe geocercas", alinear: "center", render: (u) => <Interruptor activo={u.recibeGeocerca} etiqueta={`${u.nombre} recibe alertas de geocercas`} onCambiar={(v) => cambiar("GEOCERCA", u, v)} /> },
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
      <DataTable columnas={columnas} datos={cfg.data.usuarios} keyExtractor={(u) => u.id} minWidth="820px" vacio={<SinDatos titulo="Sin usuarios" />} />
    </Panel>
  );
}
