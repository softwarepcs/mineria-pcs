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
  const [v, setV] = useState({ imei: "", modelo: "FMC125", maquinariaId: "", sistemaId: "" });

  useEffect(() => {
    if (!abierto) return;
    setV({ imei: "", modelo: "FMC125", maquinariaId: unidadInicialId ? String(unidadInicialId) : "", sistemaId: sistemas.length === 1 ? String(sistemas[0].id) : "" });
    instalar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, unidadInicialId]);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const unidadElegida = unidades.find((u) => u.id === Number(v.maquinariaId));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    instalar.mutate(
      { imei: v.imei.trim(), modelo: v.modelo.trim() || undefined, maquinariaId: Number(v.maquinariaId), sistemaId: Number(v.sistemaId) },
      { onSuccess: () => onInstalado?.() },
    );
  };

  return (
    <Modal abierto={abierto} titulo="Instalar dispositivo" onCerrar={onCerrar}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Campo etiqueta="IMEI" requerido ayuda="15 dígitos. Debe coincidir con el CN del certificado del equipo.">
          <Input required inputMode="numeric" pattern="\d{15}" maxLength={15} value={v.imei} onChange={set("imei")} placeholder="356307042441013" className="font-mono" />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Modelo">
            <Input maxLength={50} value={v.modelo} onChange={set("modelo")} />
          </Campo>
          <Campo etiqueta="Sistema" requerido>
            <Select required value={v.sistemaId} onChange={set("sistemaId")}>
              <option value="">Selecciona…</option>
              {sistemas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </Select>
          </Campo>
        </div>
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
            Si eliges el mismo sistema, el equipo {unidadElegida.dispositivo.imei} quedará retirado y reemplazado por el nuevo.
          </p>
        )}
        <MensajeError>{instalar.error ? mensajeError(instalar.error) : null}</MensajeError>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <BotonSecundario onClick={onCerrar}>{instalar.isSuccess ? "Cerrar" : "Ahora no"}</BotonSecundario>
          <BotonPrimario type="submit" cargando={instalar.isPending}>Instalar</BotonPrimario>
        </div>
      </form>
    </Modal>
  );
}
