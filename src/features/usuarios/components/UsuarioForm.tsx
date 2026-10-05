import { useState } from "react";
import { Campo, Input, BotonPrimario, BotonSecundario, Select } from "@/shared/ui/Formulario";
import { useCrearUsuario, useActualizarUsuario } from "../hooks";
import { useEmpresas } from "@/features/empresas/hooks";
import { useAuth } from "@/hooks/useAuth";

export function UsuarioForm({
  usuario,
  onClose,
}: {
  usuario?: any;
  onClose: () => void;
}) {
  const { sesion } = useAuth();
  const { data: empresas = [] } = useEmpresas(sesion?.permisos.verTodasLasEmpresas);

  // If edit mode, split name back
  const [nombres, apellidos] = (usuario?.nombre ?? " ").split(" ", 2);

  const [formData, setFormData] = useState({
    email: usuario?.email ?? "",
    nombres: nombres ?? "",
    apellidos: apellidos ?? "",
    password: "", // Only passed if changed
    empresaId: usuario?.empresaId ?? sesion?.usuario.empresaId ?? 0,
    rolesIds: [2], // Default Admin
  });

  const { mutateAsync: crear, isPending: isCreando } = useCrearUsuario();
  const { mutateAsync: actualizar, isPending: isActualizando } = useActualizarUsuario();

  const isPending = isCreando || isActualizando;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = { ...formData };
      if (!submitData.password) delete submitData.password;
      if (!submitData.empresaId) delete submitData.empresaId;

      if (usuario?.id) {
        await actualizar({ id: usuario.id, data: submitData });
      } else {
        await crear(submitData);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Campo etiqueta="Nombres" requerido>
          <Input
            required
            value={formData.nombres}
            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
          />
        </Campo>
        
        <Campo etiqueta="Apellidos" requerido>
          <Input
            required
            value={formData.apellidos}
            onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
          />
        </Campo>
      </div>

      <Campo etiqueta="Correo Electrónico" requerido>
        <Input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </Campo>

      <Campo etiqueta="Contraseña" ayuda={usuario ? "Déjalo en blanco para no cambiarla" : "Mínimo 6 caracteres"}>
        <Input
          type="password"
          required={!usuario}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </Campo>

      {sesion?.permisos.verTodasLasEmpresas && (
        <Campo etiqueta="Empresa">
          <Select
            value={formData.empresaId || ""}
            onChange={(e) => setFormData({ ...formData, empresaId: Number(e.target.value) })}
          >
            <option value="">(Sin empresa - SuperAdmin)</option>
            {empresas.map((emp: any) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </Select>
        </Campo>
      )}

      <Campo etiqueta="Rol Principal" requerido>
        <Select
          value={formData.rolesIds[0]}
          onChange={(e) => setFormData({ ...formData, rolesIds: [Number(e.target.value)] })}
        >
          {sesion?.permisos.verTodasLasEmpresas && <option value={1}>SuperAdmin</option>}
          <option value={2}>Administrador</option>
          <option value={3}>Gerente</option>
          <option value={4}>Operador</option>
          <option value={5}>Trabajador</option>
        </Select>
      </Campo>

      <div className="flex justify-end gap-3 pt-4">
        <BotonSecundario onClick={onClose}>Cancelar</BotonSecundario>
        <BotonPrimario type="submit" cargando={isPending}>Guardar</BotonPrimario>
      </div>
    </form>
  );
}
