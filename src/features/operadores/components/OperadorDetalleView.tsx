import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, Truck } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { useAlertasOperador } from "@/features/alertas/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/shared/ui/Modal";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { PeriodoSelector } from "@/shared/ui/PeriodoSelector";
import { GraficoLinea } from "@/shared/ui/GraficoLinea";
import { Campo, Input, Select, BotonPrimario, BotonSecundario, MensajeError } from "@/shared/ui/Formulario";
import { avisar, useConfirmar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { diasHasta, fecha, fechaHora, num } from "@/shared/utils/formato";
import { useActualizarOperador, useAsignarUnidad, useDarDeBajaOperador, useLiberarUnidad, useOperador, useRendimiento } from "../hooks";
import { limpiar, type CambiosOperador } from "../api";
import { ESTADO_LICENCIA, ESTADO_OPERADOR } from "../estado";
import { OperadorFormulario, aDto, valoresDesde, type ValoresOperador } from "./OperadorFormulario";

type Dias = 7 | 30 | 90 | 365;
const PERIODOS: { valor: Dias; etiqueta: string }[] = [
  { valor: 7, etiqueta: "7 días" },
  { valor: 30, etiqueta: "30 días" },
  { valor: 90, etiqueta: "90 días" },
  { valor: 365, etiqueta: "Año" },
];

function Tarjeta({ titulo, children, accion }: { titulo: string; children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c1421] p-5">
      <div className="mb-3 flex items-center justify-between border-b border-white/[0.05] pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-white">{titulo}</span>
        {accion}
      </div>
      {children}
    </div>
  );
}

export function OperadorDetalleView({ empresa }: { empresa: EmpresaDetalle }) {
  const { operadorId } = useParams();
  const id = Number(operadorId) || null;
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;

  const [dias, setDias] = useState<Dias>(30);
  const [editando, setEditando] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [asignacion, setAsignacion] = useState({ maquinariaId: "", atribucion: "" });

  const operadorQ = useOperador(id);
  const rendimientoQ = useRendimiento(id, dias);
  const alertasQ = useAlertasOperador(id);
  const { data: unidades = [] } = useUnidades(empresa.id);
  const actualizar = useActualizarOperador();
  const asignar = useAsignarUnidad();
  const liberar = useLiberarUnidad();
  const darDeBaja = useDarDeBajaOperador();
  const [confirmar, dialogo] = useConfirmar();

  const op = operadorQ.data;
  const inicial = useMemo(() => valoresDesde(op), [op]);

  if (operadorQ.isLoading) return <Cargando texto="Cargando operador..." />;
  if (operadorQ.error || !op) return <ErrorCarga error={operadorQ.error ?? new Error("Operador no encontrado")} />;

  const onGuardar = (v: ValoresOperador) => {
    const { empresaId: _e, maquinariaId: _m, atribucion: _a, ...dto } = aDto(v);
    // En la edición, un campo vaciado se envía vacío solo si el backend lo acepta; se omiten los vacíos
    actualizar.mutate(
      { id: op.id, dto: limpiar(dto) as CambiosOperador },
      { onSuccess: () => { setEditando(false); avisar.exito("Operador actualizado"); } },
    );
  };

  const onAsignar = (e: React.FormEvent) => {
    e.preventDefault();
    asignar.mutate(
      { id: op.id, maquinariaId: Number(asignacion.maquinariaId), atribucion: asignacion.atribucion.trim() || undefined },
      { onSuccess: () => { setAsignando(false); avisar.exito("Unidad asignada"); } },
    );
  };

  const onLiberar = async () => {
    if (!op.asignacion || !(await confirmar(`¿Quitar ${op.asignacion.maquinaria} a ${op.nombreCompleto}?`))) return;
    liberar.mutate(op.id, { onSuccess: () => avisar.exito("Unidad liberada"), onError: (e) => avisar.error(mensajeError(e)) });
  };

  const onBaja = async () => {
    if (!(await confirmar(`¿Dar de baja a ${op.nombreCompleto}?`, "Queda como inactivo y se libera su unidad. El historial se conserva."))) return;
    darDeBaja.mutate(op.id, {
      onSuccess: () => { avisar.exito("Operador dado de baja"); navigate(`/empresa/${empresa.id}/operadores`); },
      onError: (e) => avisar.error(mensajeError(e)),
    });
  };

  const est = ESTADO_OPERADOR[op.estado];
  const lic = ESTADO_LICENCIA[op.licencia?.estado ?? "SIN_LICENCIA"];
  const r = rendimientoQ.data;
  const diasLic = diasHasta(op.licencia?.vencimiento);

  return (
    <div className="space-y-5 font-sans text-slate-300">
      <Link to={`/empresa/${empresa.id}/operadores`} className="inline-flex items-center gap-1 text-xs font-medium text-[#0df5c6] hover:underline">
        <ArrowLeft className="h-3 w-3" /> Volver a Operadores
      </Link>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#172332] text-xl font-bold text-[#0df5c6]">
            {op.nombres.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">{op.nombreCompleto}</h1>
              <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${est.clase}`}>{est.etiqueta}</span>
            </div>
            <div className="font-mono text-xs tracking-wider text-slate-400">
              LEGAJO {op.legajo ?? "—"} · SEDE {op.sede?.nombre ?? "—"} · REGISTRADO {fecha(op.creadoEn)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodoSelector opciones={PERIODOS} valor={dias} onCambiar={setDias} />
          {puedeEditar && (
            <button type="button" onClick={() => { actualizar.reset(); setEditando(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0e1724] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
              <Edit3 className="h-3.5 w-3.5" /> Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta titulo="Licencia de conducir">
          {op.licencia ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-sm text-white">{op.licencia.numero}</div>
                <div className="text-xs text-slate-400">Categoría {op.licencia.categoria ?? "—"}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">Vence el {fecha(op.licencia.vencimiento)}</div>
                <div className={`text-xs font-semibold ${lic.texto}`}>
                  {lic.etiqueta}{diasLic !== null && diasLic >= 0 ? ` · faltan ${diasLic} días` : diasLic !== null ? ` hace ${-diasLic} días` : ""}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sin licencia registrada.</p>
          )}
        </Tarjeta>

        <Tarjeta
          titulo="Unidad asignada"
          accion={
            puedeEditar && op.estado !== "INACTIVO" ? (
              <div className="flex gap-3 text-xs">
                <button type="button" onClick={() => { asignar.reset(); setAsignacion({ maquinariaId: "", atribucion: op.asignacion?.atribucion ?? "" }); setAsignando(true); }} className="font-semibold text-[#0df5c6] hover:underline">
                  {op.asignacion ? "Cambiar" : "Asignar"}
                </button>
                {op.asignacion && <button type="button" onClick={onLiberar} className="font-semibold text-red-400 hover:underline">Quitar</button>}
              </div>
            ) : undefined
          }
        >
          {op.asignacion ? (
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-cyan-400" />
              <div>
                <Link to={`/empresa/${empresa.id}/camiones/${op.asignacion.maquinariaId}`} className="font-mono text-sm text-white hover:text-[#0df5c6]">{op.asignacion.maquinaria}</Link>
                <div className="text-xs text-slate-400">Desde {fecha(op.asignacion.desde)} · {op.asignacion.atribucion ?? "Sin atribución"}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sin unidad asignada.</p>
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo={`Rendimiento · ${PERIODOS.find((p) => p.valor === dias)?.etiqueta}`}>
        {rendimientoQ.isLoading ? (
          <Cargando />
        ) : rendimientoQ.error ? (
          <ErrorCarga error={rendimientoQ.error} />
        ) : r && r.totales.km > 0 ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["Recorrido", num(r.totales.km), "km"],
                ["Consumo", num(r.totales.litros, 1), "L"],
                ["Rendimiento", num(r.totales.l100km, 1), "L/100 km"],
                ["Horas de motor", num(r.totales.horasMotor, 1), "h"],
                ["Días con actividad", String(r.totales.diasConActividad), ""],
              ].map(([t, v, u]) => (
                <div key={t}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{t}</div>
                  <div className="text-xl font-bold text-white">{v} <span className="text-xs font-normal text-slate-400">{u}</span></div>
                </div>
              ))}
            </div>
            <GraficoLinea
              alto={150}
              unidad="L/100 km por día"
              etiquetasX={r.serieDiaria.map((d) => fecha(d.fecha).slice(0, 5))}
              series={[{ nombre: "Rendimiento diario", color: "#0df5c6", valores: r.serieDiaria.map((d) => d.l100km) }]}
            />
            <p className="mt-2 text-[11px] text-slate-500">Suma de los KPI diarios de las unidades en los días en que el operador las tuvo asignadas.</p>
          </>
        ) : (
          <SinDatos titulo="Sin actividad en el período" />
        )}
      </Tarjeta>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta titulo="Historial de asignaciones">
          {!r?.asignaciones.length ? (
            <p className="text-sm text-slate-500">Nunca tuvo unidades asignadas.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                <tr><th className="py-1.5">Unidad</th><th>Desde</th><th>Hasta</th><th className="text-right">km período</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {r.asignaciones.map((a) => (
                  <tr key={a.id}>
                    <td className="py-1.5 font-mono text-white">{a.maquinaria}</td>
                    <td>{fecha(a.fechaInicio)}</td>
                    <td>{a.fechaFin ? fecha(a.fechaFin) : <span className="text-emerald-400">Actual</span>}</td>
                    <td className="text-right">{num(a.km)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>

        <Tarjeta titulo="Alertas en sus turnos">
          {alertasQ.isLoading ? (
            <Cargando />
          ) : !alertasQ.data?.length ? (
            <p className="text-sm text-slate-500">Sin alertas mientras operaba.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto text-xs">
              {alertasQ.data.flatMap((g) => [
                ...g.eventosMotor.map((e) => (
                  <li key={`m${e.id}`} className="flex justify-between gap-2 rounded bg-white/[0.02] px-2 py-1.5">
                    <span><strong className="text-white">{e.regla.toUpperCase()}</strong> · {g.maquinaria} · {e.severidad}</span>
                    <span className="text-slate-500">{fechaHora(e.fechaHora)}</span>
                  </li>
                )),
                ...g.crucesGeocerca.map((c) => (
                  <li key={`g${c.id}`} className="flex justify-between gap-2 rounded bg-white/[0.02] px-2 py-1.5">
                    <span><strong className="text-white">{c.evento}</strong> {c.geocerca} · {g.maquinaria}</span>
                    <span className="text-slate-500">{fechaHora(c.fechaHora)}</span>
                  </li>
                )),
              ])}
            </ul>
          )}
        </Tarjeta>
      </div>

      {puedeEditar && op.estado !== "INACTIVO" && (
        <div className="flex justify-end">
          <button type="button" onClick={onBaja} className="text-xs font-semibold text-red-400 hover:text-red-300">Dar de baja al operador</button>
        </div>
      )}

      <Modal abierto={editando} titulo="Editar operador" onCerrar={() => setEditando(false)} ancho="max-w-2xl">
        <OperadorFormulario
          inicial={inicial}
          sedes={empresa.sedes}
          conAsignacion={false}
          guardando={actualizar.isPending}
          error={actualizar.error ? mensajeError(actualizar.error) : null}
          onGuardar={onGuardar}
          onCancelar={() => setEditando(false)}
        />
      </Modal>

      <Modal abierto={asignando} titulo="Asignar unidad" onCerrar={() => setAsignando(false)}>
        <form onSubmit={onAsignar} className="space-y-4">
          <Campo etiqueta="Unidad" requerido ayuda="Si la unidad ya tiene operador, se le reemplaza.">
            <Select required value={asignacion.maquinariaId} onChange={(e) => setAsignacion((a) => ({ ...a, maquinariaId: e.target.value }))}>
              <option value="">Selecciona…</option>
              {unidades.filter((u) => u.id !== op.asignacion?.maquinariaId).map((u) => (
                <option key={u.id} value={u.id}>{u.identificador}{u.operadorActual ? ` (ahora: ${u.operadorActual.nombre})` : ""}</option>
              ))}
            </Select>
          </Campo>
          <Campo etiqueta="Atribución">
            <Input maxLength={150} value={asignacion.atribucion} onChange={(e) => setAsignacion((a) => ({ ...a, atribucion: e.target.value }))} placeholder="Ej. Nacional" />
          </Campo>
          <MensajeError>{asignar.error ? mensajeError(asignar.error) : null}</MensajeError>
          <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
            <BotonSecundario onClick={() => setAsignando(false)}>Cancelar</BotonSecundario>
            <BotonPrimario type="submit" cargando={asignar.isPending}>Asignar</BotonPrimario>
          </div>
        </form>
      </Modal>
      {dialogo}
    </div>
  );
}
