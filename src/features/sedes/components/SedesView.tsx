import { useState } from "react";
import { useSedes, useEliminarSede } from "../hooks";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Badge } from "@/shared/ui/Badge";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Modal } from "@/shared/ui/Modal";
import { SedeForm } from "./SedeForm";
import type { Sede } from "../api";
import { useAuth } from "@/hooks/useAuth";
import { useConfirmar } from "@/shared/ui/Avisos";

export function SedesView({ empresa }: { empresa: any }) {
  const { data: sedesAll = [], isLoading, error, refetch } = useSedes();
  const { mutateAsync: eliminar } = useEliminarSede();
  const { sesion } = useAuth();

  const sedesEmpresa = sedesAll.filter((s) => s.empresaId === empresa.id);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede | null>(null);
  const [confirmar, confirmDialog] = useConfirmar();

  const puedeGestionar = sesion?.permisos.gestionarSedes ?? false;

  const handleCrear = () => {
    setSedeSeleccionada(null);
    setModalAbierto(true);
  };

  const handleEditar = (e: React.MouseEvent, sede: Sede) => {
    e.stopPropagation();
    setSedeSeleccionada(sede);
    setModalAbierto(true);
  };

  const handleEliminar = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (await confirmar("¿Seguro que quieres eliminar esta sede?")) {
      await eliminar(id);
    }
  };

  const columnas: Columna<Sede>[] = [
    {
      key: "nombre",
      encabezado: "Nombre de Sede",
      render: (s) => <div className="font-medium text-white">{s.nombre}</div>,
    },
    {
      key: "ciudad",
      encabezado: "Ciudad",
      render: (s) => s.ciudad,
    },
    {
      key: "estado",
      encabezado: "Estado",
      render: (s) => <Badge etiqueta={s.estado ? "Activa" : "Inactiva"} variante={s.estado ? "success" : "neutral"} tamano="sm" />,
    },
    ...(puedeGestionar ? [{
      key: "acciones",
      encabezado: "",
      alinear: "right" as const,
      render: (s: Sede) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(ev) => handleEditar(ev, s)}
            className="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20"
          >
            Editar
          </button>
          <button
            onClick={(ev) => handleEliminar(ev, s.id)}
            className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
          >
            Eliminar
          </button>
        </div>
      ),
    }] : []),
  ];

  if (isLoading) return <Cargando texto="Cargando sedes..." />;
  if (error) return <ErrorCarga error={error} onReintentar={() => void refetch()} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader titulo="Sedes de la Empresa" descripcion={`Administración de sedes para ${empresa.nombre}`} />
        {puedeGestionar && (
          <button
            onClick={handleCrear}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
          >
            + Nueva Sede
          </button>
        )}
      </div>

      <DataTable
        columnas={columnas}
        datos={sedesEmpresa}
        keyExtractor={(s) => s.id}
      />

      {puedeGestionar && (
        <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo={sedeSeleccionada ? "Editar Sede" : "Nueva Sede"}>
          <SedeForm sede={sedeSeleccionada} empresaId={empresa.id} onClose={() => setModalAbierto(false)} />
        </Modal>
      )}

      {confirmDialog}
    </div>
  );
}
