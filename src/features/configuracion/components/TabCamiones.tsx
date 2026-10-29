import { FUNCIONES } from "@/app/funciones";
import { useState } from "react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import type { Unidad } from "@/features/camiones/api";
import { EditarUnidadModal } from "@/features/camiones/components/EditarUnidadModal";
import { CrearUnidadModal } from "@/features/camiones/components/CrearUnidadModal";
import { useAsignarUnidad, useLiberarUnidad, useOperadores } from "@/features/operadores/hooks";
import { useAuth } from "@/hooks/useAuth";
import { mensajeError } from "@/shared/api/errores";
import { Badge } from "@/shared/ui/Badge";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { BotonPrimario, BotonSecundario, MensajeError, Select } from "@/shared/ui/Formulario";
import { Panel } from "@/shared/ui/Panel";
import { ESTADO_UNIDAD } from "@/features/flota/estado";

/** Configuración › Camiones: lista, edición (placa, marca, modelo, estado operativo), conductor asignado (si el módulo de operadores está activo) y alta. */
export function TabCamiones({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const esSuperAdmin = sesion?.permisos.verTodasLasEmpresas ?? false;
  const unidades = useUnidades(empresa.id);
  const operadores = useOperadores(empresa.id, FUNCIONES.operadores);
  const asignar = useAsignarUnidad();
  const liberar = useLiberarUnidad();
  const [editando, setEditando] = useState<Unidad | null>(null);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

  const conductor = (u: Unidad) => u.operadorActual;
  const cambiarConductor = (u: Unidad, valor: string) => {
    setError("");
    const actual = conductor(u);
    const alFallar = (e: unknown) => setError(mensajeError(e));
    if (!valor) {
      if (actual) liberar.mutate(actual.id, { onError: alFallar });
      return;
    }
    asignar.mutate({ id: Number(valor), maquinariaId: u.id }, { onError: alFallar });
  };

  const columnaConductor: Columna<Unidad> = {
      key: "cond",
      encabezado: "Conductor asignado",
      render: (u) =>
        puedeEditar ? (
          <Select value={conductor(u)?.id ?? ""} onChange={(e) => cambiarConductor(u, e.target.value)} className="!py-1 text-xs">
            <option value="">Sin conductor</option>
            {(operadores.data ?? []).filter((o) => o.estado === "ACTIVO" || o.id === conductor(u)?.id).map((o) => (
              <option key={o.id} value={o.id}>{o.nombreCompleto}</option>
            ))}
          </Select>
        ) : (
          conductor(u)?.nombre ?? "—"
        ),
    };

  const columnas: Columna<Unidad>[] = [
    { key: "placa", encabezado: "Placa", ordenable: true, valorOrden: (u) => u.placa, render: (u) => <span className="font-semibold text-white">{u.placa}</span> },
    { key: "mm", encabezado: "Marca / modelo", render: (u) => [u.marca, u.modelo].filter(Boolean).join(" ") || "—" },
    { key: "op", encabezado: "Estado operativo", render: (u) => <Badge etiqueta={u.estadoOperativo} variante={u.estadoOperativo === "Activo" ? "success" : u.estadoOperativo === "Mantenimiento" ? "warning" : "danger"} /> },
    ...(FUNCIONES.operadores ? [columnaConductor] : []),
    // El equipo instalado (modelo e IMEI) es información interna de PCS: solo lo ve el SuperAdmin
    ...(esSuperAdmin
      ? [{ key: "eq", encabezado: "Equipo instalado", render: (u: Unidad) => (u.dispositivo ? <span className="font-mono text-[11px]">{u.dispositivo.modelo ?? "FMC125"} · {u.dispositivo.imei}</span> : <span className="text-slate-500">Sin equipo</span>) }]
      : []),
    { key: "est", encabezado: "Ahora", render: (u) => <span className="inline-flex items-center gap-1.5 text-xs"><span className="h-2 w-2 rounded-full" style={{ background: ESTADO_UNIDAD[u.estado].color }} />{ESTADO_UNIDAD[u.estado].etiqueta}</span> },
    ...(puedeEditar ? [{ key: "acc", encabezado: "", alinear: "right" as const, render: (u: Unidad) => <BotonSecundario onClick={() => setEditando(u)}>Editar</BotonSecundario> }] : []),
  ];

  if (unidades.isLoading) return <Cargando texto="Cargando camiones..." />;
  if (unidades.isError || !unidades.data) return <ErrorCarga error={unidades.error} onReintentar={() => void unidades.refetch()} />;

  return (
    <Panel padding="sm">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white">Camiones ({unidades.data.length})</h2>
        {puedeEditar && <BotonPrimario onClick={() => setCreando(true)}>Agregar camión</BotonPrimario>}
      </div>
      <MensajeError>{error}</MensajeError>
      <DataTable columnas={columnas} datos={unidades.data} keyExtractor={(u) => u.id} minWidth="860px" vacio={<SinDatos titulo="Sin camiones">Agrega el primero con “Agregar camión”.</SinDatos>} />
      {editando && <EditarUnidadModal unidad={editando} abierto onCerrar={() => setEditando(null)} sedes={empresa.sedes} />}
      <CrearUnidadModal abierto={creando} onCerrar={() => setCreando(false)} sedes={empresa.sedes} onCreada={() => setCreando(false)} />
    </Panel>
  );
}
