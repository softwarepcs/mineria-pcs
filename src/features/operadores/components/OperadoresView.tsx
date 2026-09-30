import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, AlertTriangle } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/shared/ui/Modal";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { avisar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { fecha } from "@/shared/utils/formato";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { StatCard } from "@/shared/ui/StatCard";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Badge } from "@/shared/ui/Badge";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tipo inferido del hook
  const columnas: Columna<any>[] = [
    {
      key: "operador", encabezado: "Operador", render: (o) => (
        <>
          <Link to={`/empresa/${empresa.id}/operadores/${o.id}`} className="font-medium text-white hover:text-[#0df5c6]">{o.nombreCompleto}</Link>
          <div className="font-mono text-xs text-slate-500">{o.legajo ?? "Sin legajo"}</div>
        </>
      ),
    },
    {
      key: "unidad", encabezado: "Unidad asignada", render: (o) => o.asignacion
        ? <Link to={`/empresa/${empresa.id}/camiones/${o.asignacion.maquinariaId}`} className="font-mono text-cyan-300 hover:underline">{o.asignacion.maquinaria}</Link>
        : <span className="text-slate-500">Sin asignar</span>,
    },
    { key: "sede", encabezado: "Sede", render: (o) => o.sede?.nombre ?? "—" },
    {
      key: "estado", encabezado: "Estado", render: (o) => {
        const est = ESTADO_OPERADOR[o.estado as keyof typeof ESTADO_OPERADOR];
        return <Badge etiqueta={est.etiqueta} className={est.clase} />;
      },
    },
    {
      key: "licencia", encabezado: "Licencia", render: (o) => {
        const lic = ESTADO_LICENCIA[(o.licencia?.estado ?? "SIN_LICENCIA") as keyof typeof ESTADO_LICENCIA];
        return (
          <>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${lic.punto}`} />
              <span className="text-xs">{o.licencia ? fecha(o.licencia.vencimiento) : "—"}</span>
              <span className={`text-[10px] ${lic.texto}`}>{lic.etiqueta}</span>
            </div>
            {o.licencia && <div className="font-mono text-[10px] text-slate-500">{o.licencia.numero}{o.licencia.categoria ? ` · ${o.licencia.categoria}` : ""}</div>}
          </>
        );
      },
    },
    { key: "atribucion", encabezado: "Atribución", render: (o) => o.asignacion?.atribucion ?? "—" },
  ];

  return (
    <div className="space-y-5 rounded-xl border border-white/5 bg-[#0a0e17] p-3.5 font-sans text-slate-300 sm:p-6">
      <PageHeader
        titulo="Operadores"
        contador={operadores.length}
        accion={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput valor={busqueda} onChange={setBusqueda} placeholder="Buscar nombre, legajo o unidad..." className="sm:w-72" />
            {puedeEditar && (
              <button type="button" onClick={() => { crear.reset(); setModalAbierto(true); }} className="flex items-center justify-center gap-2 rounded-lg bg-[#0df5c6] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#0be0b5]">
                <Plus className="h-4 w-4" /> Registrar operador
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-5 lg:grid-cols-4">
        <StatCard titulo="Activos" valor={activos} variante="compact" />
        <StatCard titulo="De licencia" valor={deLicencia} variante="compact" />
        <StatCard titulo="Licencias por vencer o vencidas" valor={porVencer.length} color={porVencer.length ? "text-amber-500" : "text-white"} variante="compact" />
        <StatCard titulo="Activos sin unidad" valor={sinUnidad} variante="compact" />
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

      <DataTable
        columnas={columnas}
        datos={filtrados}
        keyExtractor={(o) => o.id}
        vacio={<SinDatos titulo={operadores.length ? "Ningún operador coincide con la búsqueda" : "Todavía no hay operadores registrados"} />}
        minWidth="820px"
      />

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

