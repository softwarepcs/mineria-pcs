import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarUsuarios } from "@/features/usuarios/api";
import { etiquetaRol } from "@/auth/permisos";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Badge } from "@/shared/ui/Badge";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Paginacion } from "@/shared/ui/Paginacion";
import { Panel } from "@/shared/ui/Panel";

const LIMITE = 10;

type Usuario = { id: number; email: string | null; nombre: string; roles: string[]; empresa: string | null; estado: string };

const columnas: Columna<Usuario>[] = [
  { key: "email", encabezado: "Correo", render: (u) => u.email ?? <span className="text-slate-500">Sin acceso</span> },
  { key: "nombre", encabezado: "Nombre", render: (u) => <span className="text-slate-300">{u.nombre}</span> },
  { key: "rol", encabezado: "Rol", render: (u) => <Badge etiqueta={etiquetaRol(u.roles)} variante="info" tamano="md" /> },
  { key: "empresa", encabezado: "Empresa", render: (u) => <span className="text-slate-400">{u.empresa ?? "—"}</span> },
  { key: "estado", encabezado: "Estado", render: (u) => <span className="text-slate-400">{u.estado}</span> },
];

export function Usuarios() {
  const [pagina, setPagina] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["usuarios", pagina, LIMITE],
    queryFn: () => listarUsuarios(pagina, LIMITE),
    placeholderData: keepPreviousData,
  });

  const usuarios = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: pagina, lastPage: 1 };

  return (
    <div>
      <PageHeader titulo="Usuarios" descripcion="Usuarios con acceso a la plataforma (solo lectura)" />

      {error && <div className="mt-4"><ErrorCarga error={error} onReintentar={() => void refetch()} /></div>}

      <Panel padding="none" className="mt-6">
        {isLoading ? (
          <Cargando texto="Cargando usuarios..." />
        ) : (
          <DataTable columnas={columnas} datos={usuarios} keyExtractor={(u) => u.id} />
        )}
      </Panel>

      <Paginacion pagina={meta.page} ultimaPagina={meta.lastPage} total={meta.total} porPagina={LIMITE} onCambiar={setPagina} />
    </div>
  );
}
