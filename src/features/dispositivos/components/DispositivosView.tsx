import { useState } from "react";
import { Cpu, Plus } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { avisar, useConfirmar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { fechaHora } from "@/shared/utils/formato";
import { useInstalaciones, useRetirarDispositivo } from "../hooks";
import { InstalarDispositivoModal } from "./InstalarDispositivoModal";

export function DispositivosView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const [soloActivas, setSoloActivas] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const instalaciones = useInstalaciones(empresa.id, soloActivas);
  const { data: unidades = [] } = useUnidades(empresa.id);
  const retirar = useRetirarDispositivo();
  const [confirmar, dialogo] = useConfirmar();

  const onRetirar = async (id: number, imei: string, unidad: string) => {
    if (!(await confirmar(`¿Retirar el equipo ${imei} de ${unidad}?`, "Desde ese momento el ingestor dejará de guardar sus lecturas. Para impedir que se conecte, revoca también su certificado."))) return;
    retirar.mutate(id, {
      onSuccess: () => avisar.exito("Dispositivo retirado"),
      onError: (e) => avisar.error(mensajeError(e)),
    });
  };

  return (
    <div className="space-y-5 rounded-xl border border-white/5 bg-[#0a0e17] p-4 text-slate-300 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Dispositivos</h2>
        </div>
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
      </div>

      {instalaciones.isLoading ? (
        <Cargando />
      ) : instalaciones.error ? (
        <ErrorCarga error={instalaciones.error} onReintentar={() => void instalaciones.refetch()} />
      ) : !instalaciones.data?.length ? (
        <SinDatos titulo="No hay dispositivos instalados">Instala el FMC125 de cada unidad para que sus lecturas se guarden.</SinDatos>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#0e1420]/60 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">IMEI</th>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3">Sistema</th>
                <th className="px-4 py-3">Instalado</th>
                <th className="px-4 py-3">Estado</th>
                {puedeEditar && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {instalaciones.data.map((i) => (
                <tr key={i.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-white">{i.dispositivo.imei}</td>
                  <td className="px-4 py-3">{i.dispositivo.modelo ?? "—"}</td>
                  <td className="px-4 py-3">{i.maquinaria.identificador} <span className="text-xs text-slate-500">· {i.sede.nombre}</span></td>
                  <td className="px-4 py-3">{i.sistema.nombre}</td>
                  <td className="px-4 py-3 text-xs">{fechaHora(i.fechaInicio)}</td>
                  <td className="px-4 py-3 text-xs">
                    {i.activa ? (
                      <span className="text-emerald-400">Instalado</span>
                    ) : (
                      <span className="text-slate-500">Retirado el {fechaHora(i.fechaFin)}</span>
                    )}
                  </td>
                  {puedeEditar && (
                    <td className="px-4 py-3 text-right">
                      {i.activa && (
                        <button type="button" onClick={() => onRetirar(i.id, i.dispositivo.imei, i.maquinaria.identificador)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                          Retirar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      {dialogo}
    </div>
  );
}
