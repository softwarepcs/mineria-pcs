import { useState } from "react";
import { Plus } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { avisar, useConfirmar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { fechaHora } from "@/shared/utils/formato";
import { PageHeader } from "@/shared/ui/PageHeader";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { useInstalaciones, useRetirarDispositivo } from "../hooks";
import { InstalarDispositivoModal } from "./InstalarDispositivoModal";
import { EditarSistemasModal } from "./EditarSistemasModal";

export function DispositivosView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const [soloActivas, setSoloActivas] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const instalaciones = useInstalaciones(empresa.id, soloActivas);
  const { data: unidades = [] } = useUnidades(empresa.id);
  const [editando, setEditando] = useState<{ imei: string; unidad: string } | null>(null);
  const retirar = useRetirarDispositivo();
  const [confirmar, dialogo] = useConfirmar();

  const onRetirar = async (id: number, imei: string, unidad: string) => {
    if (!(await confirmar(`¿Retirar el equipo ${imei} de ${unidad}?`, "Desde ese momento el ingestor dejará de guardar sus lecturas. Para impedir que se conecte, revoca también su certificado."))) return;
    retirar.mutate(id, {
      onSuccess: () => avisar.exito("Dispositivo retirado"),
      onError: (e) => avisar.error(mensajeError(e)),
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tipo inferido del hook
  const columnas: Columna<any>[] = [
    { key: "imei", encabezado: "IMEI", render: (i) => <span className="font-mono text-white">{i.dispositivo.imei}</span> },
    { key: "modelo", encabezado: "Modelo", render: (i) => i.dispositivo.modelo ?? "—" },
    { key: "unidad", encabezado: "Unidad", render: (i) => <>{i.maquinaria.identificador} <span className="text-xs text-slate-500">· {i.sede.nombre}</span></> },
    { key: "sistema", encabezado: "Sistema", render: (i) => i.sistema.nombre },
    { key: "instalado", encabezado: "Instalado", render: (i) => <span className="text-xs">{fechaHora(i.fechaInicio)}</span> },
    {
      key: "estado",
      encabezado: "Estado",
      render: (i) => i.activa
        ? <span className="text-xs text-emerald-400">Instalado</span>
        : <span className="text-xs text-slate-500">Retirado el {fechaHora(i.fechaFin)}</span>,
    },
    ...(puedeEditar
      ? [{
          key: "acciones",
          encabezado: "",
          alinear: "right" as const,
          render: (i: any) => i.activa ? (
            <span className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditando({ imei: i.dispositivo.imei, unidad: i.maquinaria.identificador })} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
                Editar sistemas
              </button>
              <button type="button" onClick={() => onRetirar(i.id, i.dispositivo.imei, i.maquinaria.identificador)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                Retirar
              </button>
            </span>
          ) : null,
        }]
      : []),
  ];

  return (
    <div className="space-y-5 rounded-xl border border-white/5 bg-[#0a0e17] p-4 text-slate-300 sm:p-6">
      <PageHeader
        titulo="Dispositivos"
        accion={
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={!soloActivas} onChange={(e) => setSoloActivas(!e.target.checked)} />
              Mostrar historial
            </label>
            {puedeEditar && (
              <button type="button" onClick={() => setModalAbierto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#0df5c6] px-3.5 py-2 text-sm font-semibold text-slate-900 hover:bg-[#0be0b5]">
                <Plus className="h-4 w-4" /> Instalar dispositivo
              </button>
            )}
          </div>
        }
      />

      {instalaciones.isLoading ? (
        <Cargando />
      ) : instalaciones.error ? (
        <ErrorCarga error={instalaciones.error} onReintentar={() => void instalaciones.refetch()} />
      ) : !instalaciones.data?.length ? (
        <SinDatos titulo="No hay dispositivos instalados">Instala el FMC125 de cada unidad para que sus lecturas se guarden.</SinDatos>
      ) : (
        <DataTable columnas={columnas} datos={instalaciones.data} keyExtractor={(i) => i.id} minWidth="760px" />
      )}

      <InstalarDispositivoModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        unidades={unidades}
        onInstalado={() => {
          setModalAbierto(false);
          avisar.exito("Dispositivo instalado. Sus lecturas se guardarán desde ahora.");
        }}
      />
      <EditarSistemasModal
        equipo={editando}
        actuales={(instalaciones.data ?? []).filter((i) => i.activa && i.dispositivo.imei === editando?.imei).map((i) => i.sistema.id)}
        onCerrar={() => setEditando(null)}
        onGuardado={() => {
          setEditando(null);
          avisar.exito("Sistemas del dispositivo actualizados");
        }}
      />
      {dialogo}
    </div>
  );
}
