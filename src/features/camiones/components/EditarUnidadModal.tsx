import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Campo, Input, Select, BotonPrimario, BotonSecundario, MensajeError } from "@/shared/ui/Formulario";
import { mensajeError } from "@/shared/api/errores";
import type { Sede } from "@/features/empresas/api";
import { useActualizarUnidad, useTiposMaquinaria } from "../hooks";
import { ESTADOS_OPERATIVOS, type NuevaUnidad, type Unidad } from "../api";

export function EditarUnidadModal({ unidad, abierto, onCerrar, sedes }: { unidad: Unidad; abierto: boolean; onCerrar: () => void; sedes: Sede[] }) {
  const { data: tipos = [] } = useTiposMaquinaria();
  const actualizar = useActualizarUnidad();
  const inicial = () => ({
    identificador: unidad.identificador,
    sedeId: String(unidad.sedeId),
    tipoMaquinariaId: unidad.tipoMaquinariaId ? String(unidad.tipoMaquinariaId) : "",
    marca: unidad.marca ?? "",
    modelo: unidad.modelo ?? "",
    estadoOperativo: unidad.estadoOperativo,
  });
  const [v, setV] = useState(inicial);

  useEffect(() => {
    if (abierto) {
      setV(inicial());
      actualizar.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  const set = (k: keyof ReturnType<typeof inicial>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Solo los campos que cambiaron
    const dto: Partial<NuevaUnidad> = {};
    if (v.identificador.trim() !== unidad.identificador) dto.identificador = v.identificador.trim();
    if (Number(v.sedeId) !== unidad.sedeId) dto.sedeId = Number(v.sedeId);
    if (v.tipoMaquinariaId && Number(v.tipoMaquinariaId) !== unidad.tipoMaquinariaId) dto.tipoMaquinariaId = Number(v.tipoMaquinariaId);
    if (v.marca.trim() !== (unidad.marca ?? "")) dto.marca = v.marca.trim();
    if (v.modelo.trim() !== (unidad.modelo ?? "")) dto.modelo = v.modelo.trim();
    if (v.estadoOperativo !== unidad.estadoOperativo) dto.estadoOperativo = v.estadoOperativo;
    if (Object.keys(dto).length === 0) return onCerrar();
    actualizar.mutate({ id: unidad.id, dto }, { onSuccess: onCerrar });
  };

  return (
    <Modal abierto={abierto} titulo={`Editar ${unidad.identificador}`} onCerrar={onCerrar}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Campo etiqueta="Placa o código" requerido>
          <Input required maxLength={100} value={v.identificador} onChange={set("identificador")} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Sede" requerido>
            <Select required value={v.sedeId} onChange={set("sedeId")}>
              {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </Select>
          </Campo>
          <Campo etiqueta="Tipo" requerido>
            <Select required value={v.tipoMaquinariaId} onChange={set("tipoMaquinariaId")}>
              <option value="">Selecciona…</option>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </Select>
          </Campo>
          <Campo etiqueta="Marca"><Input maxLength={100} value={v.marca} onChange={set("marca")} /></Campo>
          <Campo etiqueta="Modelo"><Input maxLength={100} value={v.modelo} onChange={set("modelo")} /></Campo>
          <Campo etiqueta="Estado operativo">
            <Select value={v.estadoOperativo} onChange={set("estadoOperativo")}>
              {ESTADOS_OPERATIVOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Select>
          </Campo>
        </div>
        <MensajeError>{actualizar.error ? mensajeError(actualizar.error) : null}</MensajeError>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <BotonSecundario onClick={onCerrar}>Cancelar</BotonSecundario>
          <BotonPrimario type="submit" cargando={actualizar.isPending}>Guardar</BotonPrimario>
        </div>
      </form>
    </Modal>
  );
}
