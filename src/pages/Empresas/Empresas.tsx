import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmpresas, useEliminarEmpresa } from "@/features/empresas/hooks";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Badge } from "@/shared/ui/Badge";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Modal } from "@/shared/ui/Modal";
import { EmpresaForm } from "@/features/empresas/components/EmpresaForm";
import type { EmpresaResumen } from "@/features/empresas/api";

export function Empresas() {
  const { data: empresas = [], isLoading, error, refetch } = useEmpresas();
  const { mutateAsync: eliminar } = useEliminarEmpresa();
  const navigate = useNavigate();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any>(null);

  const handleCrear = () => {
    setEmpresaSeleccionada(null);
    setModalAbierto(true);
  };

  const handleEditar = (e: React.MouseEvent, empresa: EmpresaResumen) => {
    e.stopPropagation();
    setEmpresaSeleccionada(empresa);
    setModalAbierto(true);
  };

  const handleEliminar = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que quieres eliminar esta empresa?")) {
      await eliminar(id);
    }
  };

  const columnas: Columna<EmpresaResumen>[] = [
    {
      key: "nombre",
      encabezado: "Nombre de la Empresa",
      render: (e) => <div className="font-medium text-white">{e.nombre}</div>,
    },
    {
      key: "estado",
      encabezado: "Estado",
      render: (e) => <Badge etiqueta={e.estado ? "Activa" : "Inactiva"} variante={e.estado ? "success" : "neutral"} tamano="sm" />,
    },
    {
      key: "unidades",
      encabezado: "Unidades",
      render: (e) => e.indicadores?.unidades || 0,
    },
    {
      key: "alertas",
      encabezado: "Alertas Activas",
      render: (e) => (
        <span className={e.indicadores?.alertasAbiertas ? "text-red-400 font-bold" : "text-slate-400"}>
          {e.indicadores?.alertasAbiertas || 0}
        </span>
      ),
    },
    {
      key: "acciones",
      encabezado: "",
      alinear: "right",
      render: (e) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(ev) => handleEditar(ev, e)}
            className="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20"
          >
            Editar
          </button>
          <button
            onClick={(ev) => handleEliminar(ev, e.id)}
            className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Cargando texto="Cargando empresas..." />;
  if (error) return <ErrorCarga error={error} onReintentar={() => void refetch()} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader titulo="Empresas" descripcion="Listado de empresas registradas en el sistema" />
        <button
          onClick={handleCrear}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
        >
          + Nueva Empresa
        </button>
      </div>

      <DataTable
        columnas={columnas}
        datos={empresas}
        keyExtractor={(e) => e.id}
        onClickFila={(e) => navigate(`/empresa/${e.token}`)}
      />

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo={empresaSeleccionada ? "Editar Empresa" : "Nueva Empresa"}>
        <EmpresaForm empresa={empresaSeleccionada} onClose={() => setModalAbierto(false)} />
      </Modal>
    </div>
  );
}
