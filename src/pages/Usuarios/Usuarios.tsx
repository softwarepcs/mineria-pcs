import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarUsuarios } from "@/features/usuarios/api";
import { useEliminarUsuario } from "@/features/usuarios/hooks";
import { etiquetaRol } from "@/auth/permisos";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Badge } from "@/shared/ui/Badge";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Paginacion } from "@/shared/ui/Paginacion";
import { Panel } from "@/shared/ui/Panel";
import { Modal } from "@/shared/ui/Modal";
import { UsuarioForm } from "@/features/usuarios/components/UsuarioForm";

const LIMITE = 10;

type Usuario = { id: number; email: string | null; nombre: string; roles: string[]; empresa: string | null; estado: string };

export function Usuarios() {
  const [pagina, setPagina] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["usuarios", pagina, LIMITE],
    queryFn: () => listarUsuarios(pagina, LIMITE),
    placeholderData: keepPreviousData,
  });

  const { mutateAsync: eliminar } = useEliminarUsuario();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  const usuarios = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: pagina, lastPage: 1 };

  const handleCrear = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditar = (e: React.MouseEvent, usuario: Usuario) => {
    e.stopPropagation();
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  };

  const handleEliminar = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que quieres eliminar a este usuario?")) {
      await eliminar(id);
      refetch();
    }
  };

  const columnas: Columna<Usuario>[] = [
    { key: "email", encabezado: "Correo", render: (u) => u.email ?? <span className="text-slate-500">Sin acceso</span> },
    { key: "nombre", encabezado: "Nombre", render: (u) => <span className="text-slate-300">{u.nombre}</span> },
    { key: "rol", encabezado: "Rol", render: (u) => <Badge etiqueta={etiquetaRol(u.roles)} variante="info" tamano="md" /> },
    { key: "empresa", encabezado: "Empresa", render: (u) => <span className="text-slate-400">{u.empresa ?? "—"}</span> },
    { key: "estado", encabezado: "Estado", render: (u) => <span className="text-slate-400">{u.estado}</span> },
    {
      key: "acciones",
      encabezado: "",
      alinear: "right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(ev) => handleEditar(ev, u)}
            className="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20"
          >
            Editar
          </button>
          <button
            onClick={(ev) => handleEliminar(ev, u.id)}
            className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader titulo="Usuarios" descripcion="Administración de cuentas y permisos del sistema" />
        <button
          onClick={handleCrear}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && <div className="mt-4"><ErrorCarga error={error} onReintentar={() => void refetch()} /></div>}

      <Panel padding="none" className="mt-6">
        {isLoading ? (
          <Cargando texto="Cargando usuarios..." />
        ) : (
          <DataTable columnas={columnas} datos={usuarios} keyExtractor={(u) => u.id} />
        )}
      </Panel>

      <Paginacion pagina={meta.page} ultimaPagina={meta.lastPage} total={meta.total} porPagina={LIMITE} onCambiar={setPagina} />

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo={usuarioSeleccionado ? "Editar Usuario" : "Nuevo Usuario"}>
        <UsuarioForm usuario={usuarioSeleccionado} onClose={() => setModalAbierto(false)} />
      </Modal>
    </div>
  );
}
