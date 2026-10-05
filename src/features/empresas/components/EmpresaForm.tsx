import { useState } from "react";
import { Campo, Input, BotonPrimario, BotonSecundario, Select } from "@/shared/ui/Formulario";
import { useCrearEmpresa, useActualizarEmpresa } from "../hooks";

export function EmpresaForm({
  empresa,
  onClose,
}: {
  empresa?: any;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    nombreRazonSocial: empresa?.nombre ?? "",
    numeroDocumento: empresa?.numeroDocumento ?? "",
    tipoDocumentoId: empresa?.tipoDocumentoId ?? 1,
    zonaHoraria: empresa?.zonaHoraria ?? "America/Lima",
    estado: empresa?.estado ?? true,
  });

  const { mutateAsync: crear, isPending: isCreando } = useCrearEmpresa();
  const { mutateAsync: actualizar, isPending: isActualizando } = useActualizarEmpresa();

  const isPending = isCreando || isActualizando;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (empresa?.id) {
        await actualizar({ id: empresa.id, data: formData });
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
      <Campo etiqueta="Razón Social" requerido>
        <Input
          required
          value={formData.nombreRazonSocial}
          onChange={(e) => setFormData({ ...formData, nombreRazonSocial: e.target.value })}
        />
      </Campo>
      
      <div className="grid grid-cols-2 gap-4">
        <Campo etiqueta="Tipo Documento" requerido>
          <Select
            value={formData.tipoDocumentoId}
            onChange={(e) => setFormData({ ...formData, tipoDocumentoId: Number(e.target.value) })}
          >
            <option value={1}>RUC</option>
            <option value={2}>NIT</option>
            <option value={3}>DNI / RUT</option>
          </Select>
        </Campo>
        
        <Campo etiqueta="Nº Documento" requerido>
          <Input
            required
            value={formData.numeroDocumento}
            onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
          />
        </Campo>
      </div>

      <Campo etiqueta="Zona Horaria">
        <Input
          value={formData.zonaHoraria}
          onChange={(e) => setFormData({ ...formData, zonaHoraria: e.target.value })}
        />
      </Campo>

      {empresa && (
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
