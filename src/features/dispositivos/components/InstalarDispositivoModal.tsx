import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Campo, Input, Select, BotonPrimario, BotonSecundario, MensajeError } from "@/shared/ui/Formulario";
import { mensajeError } from "@/shared/api/errores";
import type { Unidad } from "@/features/camiones/api";
import { useInstalarDispositivo, useSistemas } from "../hooks";

/**
 * Registra un FMC125 y lo vincula al sistema de una unidad. Desde ese momento el
 * ingestor guarda sus lecturas. El certificado (CN = IMEI) se emite aparte con la PKI.
 */
export function InstalarDispositivoModal({
  abierto,
  onCerrar,
  unidades,
  unidadInicialId,
  onInstalado,
}: {
  abierto: boolean;
  onCerrar: () => void;
  unidades: Unidad[];
  unidadInicialId?: number | null;
  onInstalado?: () => void;
}) {
  const { data: sistemas = [] } = useSistemas();
  const instalar = useInstalarDispositivo();
  const [v, setV] = useState({ imei: "", modelo: "FMC125", maquinariaId: "" });
  const [sistemaIds, setSistemaIds] = useState<number[]>([]);

  useEffect(() => {
    if (!abierto) return;
    setV({ imei: "", modelo: "FMC125", maquinariaId: unidadInicialId ? String(unidadInicialId) : "" });
    setSistemaIds(sistemas.length === 1 ? [sistemas[0].id] : []);
    instalar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, unidadInicialId]);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const unidadElegida = unidades.find((u) => u.id === Number(v.maquinariaId));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (sistemaIds.length === 0) return;
    instalar.mutate(
      { imei: v.imei.trim(), modelo: v.modelo.trim() || undefined, maquinariaId: Number(v.maquinariaId), sistemaIds },
      { onSuccess: () => onInstalado?.() },
    );
  };

  return (
    <Modal abierto={abierto} titulo="Instalar dispositivo" onCerrar={onCerrar}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Campo etiqueta="IMEI" requerido ayuda="15 dígitos. Debe coincidir con el CN del certificado del equipo.">
          <Input required inputMode="numeric" pattern="\d{15}" maxLength={15} value={v.imei} onChange={set("imei")} placeholder="356307042441013" className="font-mono" />
        </Campo>
        <Campo etiqueta="Modelo">
          <Input maxLength={50} value={v.modelo} onChange={set("modelo")} />
        </Campo>
        <Campo etiqueta="Sistemas" requerido ayuda="Un mismo equipo puede reportar a varios sistemas de la unidad.">
          <div className="space-y-1.5">
            {sistemas.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={sistemaIds.includes(s.id)}
                  onChange={(e) => setSistemaIds((p) => (e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id)))}
                  className="h-4 w-4 accent-cyan-400"
                />
                {s.nombre}
              </label>
            ))}
          </div>
        </Campo>
        <Campo etiqueta="Unidad" requerido>
          <Select required value={v.maquinariaId} onChange={set("maquinariaId")}>
            <option value="">Selecciona…</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.identificador} · {u.sede}{u.dispositivo ? ` (tiene ${u.dispositivo.imei})` : ""}
              </option>
            ))}
          </Select>
        </Campo>
        {unidadElegida?.dispositivo && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Si eliges un sistema que ya tiene equipo, el equipo {unidadElegida.dispositivo.imei} quedará retirado y reemplazado por el nuevo.
          </p>
        )}
        <MensajeError>{instalar.error ? mensajeError(instalar.error) : null}</MensajeError>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <BotonSecundario onClick={onCerrar}>{instalar.isSuccess ? "Cerrar" : "Ahora no"}</BotonSecundario>
          <BotonPrimario type="submit" cargando={instalar.isPending} disabled={sistemaIds.length === 0}>Instalar</BotonPrimario>
        </div>
      </form>
    </Modal>
  );
}
