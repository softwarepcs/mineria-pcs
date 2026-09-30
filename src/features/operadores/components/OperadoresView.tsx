import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, AlertTriangle } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/shared/ui/Modal";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { avisar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { fecha } from "@/shared/utils/formato";
import { useCrearOperador, useOperadores } from "../hooks";
import { ESTADO_LICENCIA, ESTADO_OPERADOR } from "../estado";
import { OperadorFormulario, aDto, valoresDesde, type ValoresOperador } from "./OperadorFormulario";

export function OperadoresView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const { data: operadores = [], isLoading, error, refetch } = useOperadores(empresa.id);
  const { data: unidades = [] } = useUnidades(empresa.id);
  const crear = useCrearOperador();
  const [busqueda, setBusqueda] = useState("");
  const [soloPorVencer, setSoloPorVencer] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const inicial = useMemo(() => valoresDesde(null), []);

  const porVencer = operadores.filter((o) => o.licencia && (o.licencia.estado === "POR_VENCER" || o.licencia.estado === "VENCIDA"));
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return operadores.filter(
      (o) =>
        (!soloPorVencer || porVencer.includes(o)) &&
        (!q || [o.nombreCompleto, o.legajo, o.asignacion?.maquinaria, o.numeroDocumento].some((c) => c?.toLowerCase().includes(q))),
    );
  }, [operadores, busqueda, soloPorVencer, porVencer]);

  const onGuardar = (v: ValoresOperador) => {
    // El SuperAdmin no tiene empresa propia: se indica la que está viendo
    const dto = { ...aDto(v), empresaId: sesion?.permisos.verTodasLasEmpresas ? empresa.id : undefined };
    crear.mutate(dto, {
      onSuccess: () => {
        setModalAbierto(false);
        avisar.exito("Operador registrado");
      },
    });
  };

  if (isLoading) return <Cargando texto="Cargando operadores..." />;
  if (error) return <ErrorCarga error={error} onReintentar={() => void refetch()} />;

  const activos = operadores.filter((o) => o.estado === "ACTIVO").length;
  const deLicencia = operadores.filter((o) => o.estado === "DE_LICENCIA").length;
  const sinUnidad = operadores.filter((o) => o.estado === "ACTIVO" && !o.asignacion).length;

  return (
    <div className="space-y-5 rounded-xl border border-white/5 bg-[#0a0e17] p-3.5 font-sans text-slate-300 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Operadores</h2>
          <span className="rounded border border-teal-800/50 bg-[#042f2e] px-2.5 py-1 text-xs font-medium text-teal-400">{operadores.length}</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar nombre, legajo o unidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg bg-slate-800/50 py-2 pl-9 pr-4 text-sm text-white ring-1 ring-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          {puedeEditar && (
            <button type="button" onClick={() => { crear.reset(); setModalAbierto(true); }} className="flex items-center justify-center gap-2 rounded-lg bg-[#0df5c6] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#0be0b5]">
              <Plus className="h-4 w-4" /> Registrar operador
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-5 lg:grid-cols-4">
        {[
          { titulo: "Activos", valor: activos, color: "text-white" },
          { titulo: "De licencia", valor: deLicencia, color: "text-white" },
          { titulo: "Licencias por vencer o vencidas", valor: porVencer.length, color: porVencer.length ? "text-amber-500" : "text-white" },
          { titulo: "Activos sin unidad", valor: sinUnidad, color: "text-white" },
        ].map((k) => (
          <div key={k.titulo} className="rounded-lg bg-white/[0.02] p-3">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k.titulo}</span>
            <span className={`text-2xl font-bold ${k.color}`}>{k.valor}</span>
          </div>
        ))}
      </div>

      {porVencer.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2 text-sm font-medium text-amber-500">
            <AlertTriangle className="h-4 w-4" />
            {porVencer.length} operador{porVencer.length > 1 ? "es tienen" : " tiene"} la licencia vencida o por vencer en 30 días
          </span>
          <button type="button" onClick={() => setSoloPorVencer((s) => !s)} className="text-sm font-semibold text-amber-400 underline hover:text-amber-300">
            {soloPorVencer ? "Ver todos" : "Ver"}
          </button>
        </div>
      )}

      {filtrados.length === 0 ? (
        <SinDatos titulo={operadores.length ? "Ningún operador coincide con la búsqueda" : "Todavía no hay operadores registrados"} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#0e1420]/60 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 pl-4 pr-6">Operador</th>
                <th className="px-4 py-3">Unidad asignada</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Licencia</th>
                <th className="px-4 py-3">Atribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtrados.map((o) => {
                const lic = ESTADO_LICENCIA[o.licencia?.estado ?? "SIN_LICENCIA"];
                const est = ESTADO_OPERADOR[o.estado];
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 pr-6">
                      <Link to={`/empresa/${empresa.id}/operadores/${o.id}`} className="font-medium text-white hover:text-[#0df5c6]">{o.nombreCompleto}</Link>
                      <div className="font-mono text-xs text-slate-500">{o.legajo ?? "Sin legajo"}</div>
                    </td>
                    <td className="px-4 py-3">
                      {o.asignacion ? (
                        <Link to={`/empresa/${empresa.id}/camiones/${o.asignacion.maquinariaId}`} className="font-mono text-cyan-300 hover:underline">{o.asignacion.maquinaria}</Link>
                      ) : (
                        <span className="text-slate-500">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{o.sede?.nombre ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${est.clase}`}>{est.etiqueta}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${lic.punto}`} />
                        <span className="text-xs">{o.licencia ? fecha(o.licencia.vencimiento) : "—"}</span>
                        <span className={`text-[10px] ${lic.texto}`}>{lic.etiqueta}</span>
                      </div>
                      {o.licencia && <div className="font-mono text-[10px] text-slate-500">{o.licencia.numero}{o.licencia.categoria ? ` · ${o.licencia.categoria}` : ""}</div>}
                    </td>
                    <td className="px-4 py-3">{o.asignacion?.atribucion ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal abierto={modalAbierto} titulo="Registrar operador" onCerrar={() => setModalAbierto(false)} ancho="max-w-2xl">
        <OperadorFormulario
          inicial={inicial}
          sedes={empresa.sedes}
          unidades={unidades}
          conAsignacion
          guardando={crear.isPending}
          error={crear.error ? mensajeError(crear.error) : null}
          onGuardar={onGuardar}
          onCancelar={() => setModalAbierto(false)}
        />
      </Modal>
    </div>
  );
}
