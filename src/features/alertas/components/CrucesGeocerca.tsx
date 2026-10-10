import { Link } from "react-router-dom";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { fechaHora } from "@/shared/utils/formato";
import { useAlertasGeocerca } from "../hooks";

export function CrucesGeocerca({ empresaId }: { empresaId: number }) {
  const { data = [], isLoading, error } = useAlertasGeocerca(empresaId);
  const basePath = useEmpresaPath();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tipo inferido del hook
  const columnas: Columna<any>[] = [
    { key: "fecha", encabezado: "Fecha", render: (c) => <span className="font-mono text-xs">{fechaHora(c.fechaHora)}</span> },
    { key: "evento", encabezado: "Evento", render: (c) => <span className={`text-xs font-bold ${c.tipoEvento === "ENTRADA" ? "text-emerald-400" : "text-amber-400"}`}>{c.tipoEvento}</span> },
    { key: "geocerca", encabezado: "Geocerca", render: (c) => c.geocerca },
    { key: "unidad", encabezado: "Unidad", render: (c) => <Link to={`${basePath}/camiones/${c.maquinariaId}`} className="font-mono text-cyan-300 hover:underline">{c.maquinaria}</Link> },
  ];

  if (isLoading) return <Cargando />;
  if (error) return <ErrorCarga error={error} />;

  return (
    <DataTable
      columnas={columnas}
      datos={data}
      keyExtractor={(c) => c.id}
      vacio={<SinDatos titulo="Sin entradas ni salidas de geocercas registradas" />}
      minWidth="600px"
    />
  );
}
