import { useEffect, useState, type FormEvent } from "react";
import { Campo, Input, Select, BotonPrimario, BotonSecundario, MensajeError } from "@/shared/ui/Formulario";
import type { Sede } from "@/features/empresas/api";
import type { Unidad } from "@/features/camiones/api";
import { ESTADOS_OPERADOR, type Operador, type NuevoOperador } from "../api";
import { ESTADO_OPERADOR } from "../estado";

export interface ValoresOperador {
  nombres: string;
  apellidos: string;
  legajo: string;
  numeroDocumento: string;
  estado: (typeof ESTADOS_OPERADOR)[number];
  sedeId: string;
  maquinariaId: string;
  licenciaNumero?: string;
  licenciaCategoria?: string;
  licenciaVencimiento?: string;
  atribucion?: string;
}

export function valoresDesde(op?: Operador | null): ValoresOperador {
  return {
    nombres: op?.nombres ?? "",
    apellidos: op?.apellidos ?? "",
    legajo: op?.legajo ?? "",
    numeroDocumento: op?.numeroDocumento ?? "",
    estado: op?.estado ?? "ACTIVO",
    sedeId: op?.sede ? String(op.sede.id) : "",
    maquinariaId: op?.asignacion ? String(op.asignacion.maquinariaId) : "",
  };
}

export function aDto(v: ValoresOperador): NuevoOperador {
  return {
    nombres: v.nombres.trim(),
    apellidos: v.apellidos.trim(),
    legajo: v.legajo.trim(),
    numeroDocumento: v.numeroDocumento.trim(),
    estado: v.estado,
    sedeId: v.sedeId ? Number(v.sedeId) : undefined,
    maquinariaId: v.maquinariaId ? Number(v.maquinariaId) : undefined,
  };
}

/**
 * Formulario de operador sin campos de licencia ni atribución.
 */
export function OperadorFormulario({
  inicial,
  sedes,
  unidades,
  conAsignacion,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: {
  inicial: ValoresOperador;
  sedes: Sede[];
  unidades?: Unidad[];
  conAsignacion: boolean;
  guardando: boolean;
  error: string | null;
  onGuardar: (v: ValoresOperador) => void;
  onCancelar: () => void;
}) {
  const [v, setV] = useState(inicial);
  useEffect(() => setV(inicial), [inicial]);
  const set = (k: keyof ValoresOperador) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onGuardar(v);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombres" requerido>
          <Input required maxLength={255} value={v.nombres} onChange={set("nombres")} />
        </Campo>
        <Campo etiqueta="Apellidos">
          <Input maxLength={255} value={v.apellidos} onChange={set("apellidos")} />
        </Campo>
        <Campo etiqueta="Código / Legajo">
          <Input maxLength={50} value={v.legajo} onChange={set("legajo")} placeholder="Ej. OP-001" />
        </Campo>
        <Campo etiqueta="N.º de documento">
          <Input maxLength={50} value={v.numeroDocumento} onChange={set("numeroDocumento")} />
        </Campo>
        <Campo etiqueta="Sede">
          <Select value={v.sedeId} onChange={set("sedeId")}>
            <option value="">Sin sede</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo etiqueta="Estado" requerido>
          <Select value={v.estado} onChange={set("estado")}>
            {ESTADOS_OPERADOR.map((e) => (
              <option key={e} value={e}>
                {ESTADO_OPERADOR[e].etiqueta}
              </option>
            ))}
          </Select>
        </Campo>
      </div>

      {conAsignacion && unidades && (
        <fieldset className="rounded-lg border border-white/10 p-3">
          <legend className="px-1 text-xs font-semibold text-slate-400">Unidad asignada</legend>
          <Campo etiqueta="Unidad" ayuda="Si la unidad ya tiene operador, se le reemplaza.">
            <Select value={v.maquinariaId} onChange={set("maquinariaId")}>
              <option value="">Sin asignar</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.identificador}
                  {u.operadorActual ? ` (ahora: ${u.operadorActual.nombre})` : ""}
                </option>
              ))}
            </Select>
          </Campo>
        </fieldset>
      )}

      <MensajeError>{error}</MensajeError>
      <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
        <BotonSecundario onClick={onCancelar}>Cancelar</BotonSecundario>
        <BotonPrimario type="submit" cargando={guardando}>
          Guardar
        </BotonPrimario>
      </div>
    </form>
  );
}
