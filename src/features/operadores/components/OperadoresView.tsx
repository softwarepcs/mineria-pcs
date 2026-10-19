import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { Modal } from "@/shared/ui/Modal";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { avisar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { StatCard } from "@/shared/ui/StatCard";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Badge } from "@/shared/ui/Badge";
import { useCrearOperador, useOperadores } from "../hooks";
import { ESTADO_OPERADOR } from "../estado";
import { OperadorFormulario, aDto, valoresDesde, type ValoresOperador } from "./OperadorFormulario";

export function OperadoresView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const basePath = useEmpresaPath();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const { data: operadores = [], isLoading, error, refetch } = useOperadores(empresa.id);
  const { data: unidades = [] } = useUnidades(empresa.id);
  const crear = useCrearOperador();
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const inicial = useMemo(() => valoresDesde(null), []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return operadores.filter(
      (o) =>
        !q ||
        [o.nombreCompleto, o.legajo, o.asignacion?.maquinaria, o.sede?.nombre].some((c) =>
          c?.toLowerCase().includes(q),
        ),
    );
  }, [operadores, busqueda]);

  const onGuardar = (v: ValoresOperador) => {
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
  const sinUnidad = operadores.filter((o) => o.estado === "ACTIVO" && !o.asignacion).length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tipo inferido del hook
  const columnas: Columna<any>[] = [
    {
      key: "codigo",
      encabezado: "Código",
      render: (o) => <span className="font-mono text-xs font-semibold text-slate-300">{o.legajo || "—"}</span>,
    },
    {
      key: "operador",
      encabezado: "Operador",
      render: (o) => (
        <Link to={`${basePath}/operadores/${o.id}`} className="font-medium text-white hover:text-[#0df5c6]">
          {o.nombreCompleto}
        </Link>
      ),
    },
    {
      key: "unidad",
      encabezado: "Unidad",
      render: (o) =>
        o.asignacion ? (
          <Link to={`${basePath}/camiones/${o.asignacion.maquinariaId}`} className="font-mono text-cyan-300 hover:underline">
            {o.asignacion.maquinaria}
          </Link>
        ) : (
          <span className="text-slate-500">Sin asignar</span>
        ),
    },
    { key: "sede", encabezado: "Sede", render: (o) => o.sede?.nombre ?? "—" },
    {
      key: "estado",
      encabezado: "Estado",
      render: (o) => {
        const est = ESTADO_OPERADOR[o.estado as keyof typeof ESTADO_OPERADOR] ?? {
          etiqueta: o.estado,
          clase: "border-slate-500/30 bg-slate-500/10 text-slate-400",
        };
        return <Badge etiqueta={est.etiqueta} className={est.clase} />;
      },
    },
  ];

  return (
    <div className="space-y-5 rounded-xl border border-white/5 bg-[#0a0e17] p-3.5 font-sans text-slate-300 sm:p-6">
      <PageHeader
        titulo="Operadores"
        contador={operadores.length}
        accion={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              valor={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar nombre, código, sede o unidad..."
              className="sm:w-72"
            />
            {puedeEditar && (
              <button
                type="button"
                onClick={() => {
                  crear.reset();
                  setModalAbierto(true);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#0df5c6] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#0be0b5]"
              >
                <Plus className="h-4 w-4" /> Registrar operador
              </button>
            )}
          </div>
        }
      />

      {/* Solo operadores activos y sin unidad */}
      <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-5 max-w-lg">
        <StatCard titulo="Operadores activos" valor={activos} variante="compact" />
        <StatCard
          titulo="Sin unidad"
          valor={sinUnidad}
          color={sinUnidad > 0 ? "text-amber-400" : "text-white"}
          variante="compact"
        />
      </div>

      <DataTable
        columnas={columnas}
        datos={filtrados}
        keyExtractor={(o) => o.id}
        vacio={
          <SinDatos
            titulo={
              operadores.length
                ? "Ningún operador coincide con la búsqueda"
                : "Todavía no hay operadores registrados"
            }
          />
        }
        minWidth="700px"
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
