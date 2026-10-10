import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Campo, BotonPrimario, BotonSecundario, MensajeError } from "@/shared/ui/Formulario";
import { mensajeError } from "@/shared/api/errores";
import { useActualizarSistemas, useSistemas } from "../hooks";

/** Agrega o quita sistemas de un equipo ya instalado. Quitar uno cierra esa instalación (queda en el historial). */
export function EditarSistemasModal({
  equipo,
  actuales,
  onCerrar,
  onGuardado,
}: {
  /** null = cerrado */
  equipo: { imei: string; unidad: string } | null;
  /** Ids de los sistemas donde está instalado hoy */
  actuales: number[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const { data: sistemas = [] } = useSistemas();
  const actualizar = useActualizarSistemas();
  const [elegidos, setElegidos] = useState<number[]>([]);

  useEffect(() => {
    if (!equipo) return;
    setElegidos(actuales);
    actualizar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipo?.imei]);

  const quita = actuales.filter((id) => !elegidos.includes(id));
  const agrega = elegidos.filter((id) => !actuales.includes(id));
  const nombre = (id: number) => sistemas.find((s) => s.id === id)?.nombre ?? `#${id}`;
  const sinCambios = quita.length === 0 && agrega.length === 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!equipo || sinCambios || elegidos.length === 0) return;
    actualizar.mutate({ imei: equipo.imei, sistemaIds: elegidos }, { onSuccess: onGuardado });
  };

  return (
    <Modal abierto={!!equipo} titulo="Sistemas del dispositivo" onCerrar={onCerrar}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-slate-400">
          Equipo <span className="font-mono text-white">{equipo?.imei}</span> en {equipo?.unidad}.
        </p>
        <Campo etiqueta="Sistemas" ayuda="Marca los sistemas a los que debe reportar el equipo.">
          <div className="space-y-1.5">
            {sistemas.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={elegidos.includes(s.id)}
                  onChange={(e) => setElegidos((p) => (e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id)))}
                  className="h-4 w-4 accent-cyan-400"
                />
                {s.nombre}
              </label>
            ))}
          </div>
        </Campo>
        {quita.length > 0 && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Dejará de guardar lecturas de: {quita.map(nombre).join(", ")}. Las ya guardadas se conservan.
          </p>
        )}
        {agrega.length > 0 && (
          <p className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
            Empezará a guardar lecturas de: {agrega.map(nombre).join(", ")}. Si otro equipo estaba en ese sistema, quedará retirado.
          </p>
        )}
        {elegidos.length === 0 && <p className="text-xs text-red-400">Deja al menos un sistema. Para quitar el equipo por completo, usa «Retirar».</p>}
        <MensajeError>{actualizar.error ? mensajeError(actualizar.error) : null}</MensajeError>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <BotonSecundario onClick={onCerrar}>Cancelar</BotonSecundario>
          <BotonPrimario type="submit" cargando={actualizar.isPending} disabled={sinCambios || elegidos.length === 0}>Guardar</BotonPrimario>
        </div>
      </form>
    </Modal>
  );
}
