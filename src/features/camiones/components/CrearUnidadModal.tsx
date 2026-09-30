import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Campo, Input, Select, BotonPrimario, BotonSecundario, MensajeError } from "@/shared/ui/Formulario";
import { mensajeError } from "@/shared/api/errores";
import type { Sede } from "@/features/empresas/api";
import { useCrearUnidad, useTiposMaquinaria } from "../hooks";
import { ESTADOS_OPERATIVOS } from "../api";

/**
 * Alta de unidad: solo los 6 campos que guarda la tabla maquinaria.
 * El FMC125 (IMEI) se registra después con "Instalar dispositivo".
 */
export function CrearUnidadModal({ abierto, onCerrar, sedes, onCreada }: { abierto: boolean; onCerrar: () => void; sedes: Sede[]; onCreada: (id: number) => void }) {
  const { data: tipos = [] } = useTiposMaquinaria();
  const crear = useCrearUnidad();
  const vacio = { identificador: "", sedeId: "", tipoMaquinariaId: "", marca: "", modelo: "", estadoOperativo: "Activo" };
  const [v, setV] = useState(vacio);

  useEffect(() => {
    if (abierto) {
      setV({ ...vacio, sedeId: sedes.length === 1 ? String(sedes[0].id) : "" });
      crear.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  const set = (k: keyof typeof vacio) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    crear.mutate(
      {
        identificador: v.identificador.trim(),
        sedeId: Number(v.sedeId),
        tipoMaquinariaId: Number(v.tipoMaquinariaId),
        marca: v.marca.trim() || undefined,
        modelo: v.modelo.trim() || undefined,
        estadoOperativo: v.estadoOperativo,
      },
      { onSuccess: (u) => onCreada(u.id) },
    );
  };

  return (
    <Modal abierto={abierto} titulo="Registrar unidad" onCerrar={onCerrar}>
      {sedes.length === 0 ? (
        <p className="text-sm text-amber-300">La empresa no tiene sedes activas. Crea una sede antes de registrar unidades.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Campo etiqueta="Placa o código" requerido ayuda="Identificador único de la unidad dentro de la sede.">
            <Input required maxLength={100} value={v.identificador} onChange={set("identificador")} placeholder="Ej. ABC-123" />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Sede" requerido>
              <Select required value={v.sedeId} onChange={set("sedeId")}>
                <option value="">Selecciona…</option>
                {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </Select>
            </Campo>
            <Campo etiqueta="Tipo" requerido>
              <Select required value={v.tipoMaquinariaId} onChange={set("tipoMaquinariaId")}>
                <option value="">Selecciona…</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </Select>
            </Campo>
            <Campo etiqueta="Marca">
              <Input maxLength={100} value={v.marca} onChange={set("marca")} placeholder="Ej. Volvo" />
            </Campo>
            <Campo etiqueta="Modelo">
              <Input maxLength={100} value={v.modelo} onChange={set("modelo")} placeholder="Ej. FH 540" />
            </Campo>
            <Campo etiqueta="Estado operativo" requerido>
              <Select value={v.estadoOperativo} onChange={set("estadoOperativo")}>
                {ESTADOS_OPERATIVOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </Select>
            </Campo>
          </div>
          <MensajeError>{crear.error ? mensajeError(crear.error) : null}</MensajeError>
          <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
            <BotonSecundario onClick={onCerrar}>Cancelar</BotonSecundario>
            <BotonPrimario type="submit" cargando={crear.isPending}>Registrar</BotonPrimario>
          </div>
        </form>
      )}
    </Modal>
  );
}
