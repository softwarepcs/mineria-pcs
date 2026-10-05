import { useState } from "react";
import { Campo, Input, BotonPrimario, BotonSecundario, Select } from "@/shared/ui/Formulario";
import { useCrearSede, useActualizarSede } from "../hooks";

export function SedeForm({
  sede,
  empresaId,
  onClose,
}: {
  sede?: any;
  empresaId: number;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    nombre: sede?.nombre ?? "",
    ciudad: sede?.ciudad ?? "",
    estado: sede?.estado ?? true,
    empresaId,
  });

  const { mutateAsync: crear, isPending: isCreando } = useCrearSede();
  const { mutateAsync: actualizar, isPending: isActualizando } = useActualizarSede();

  const isPending = isCreando || isActualizando;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (sede?.id) {
        await actualizar({ id: sede.id, data: formData });
      } else {
        await crear(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Campo etiqueta="Nombre de la Sede" requerido>
        <Input
          required
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
      </Campo>
      
      <Campo etiqueta="Ciudad" requerido>
        <Input
          required
          value={formData.ciudad}
          onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
        />
      </Campo>

      {sede && (
        <Campo etiqueta="Estado">
          <Select
            value={formData.estado ? "1" : "0"}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value === "1" })}
          >
            <option value="1">Activa</option>
            <option value="0">Inactiva</option>
          </Select>
        </Campo>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <BotonSecundario onClick={onClose}>Cancelar</BotonSecundario>
        <BotonPrimario type="submit" cargando={isPending}>Guardar</BotonPrimario>
      </div>
    </form>
  );
}
