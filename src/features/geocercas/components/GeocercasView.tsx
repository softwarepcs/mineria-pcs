import { useMemo, useState } from "react";
import { Radio } from "lucide-react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { useUnidades } from "@/features/camiones/hooks";
import { posicion } from "@/features/camiones/estado";
import { useAuth } from "@/hooks/useAuth";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { avisar, useConfirmar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { dentroDePoligono, distanciaMetros, type LatLng } from "@/shared/utils/geometria";
import { useActualizarGeocerca, useCrearGeocerca, useEliminarGeocerca, useGeocercas } from "../hooks";
import { cambiosDto, crearDto, type Geocerca, type GeocercaValores } from "../api";
import { useGeocercaForm } from "../useGeocercaForm";
import { GeocercaForm } from "./GeocercaForm";
import { GeocercasList } from "./GeocercasList";
import { GeocercasMapa, type UnidadEnMapa } from "./GeocercasMapa";

function contiene(g: Pick<GeocercaValores, "tipo" | "centro" | "radio" | "puntos">, p: LatLng) {
  if (g.tipo === "CIRCULO") return !!g.centro && !!g.radio && distanciaMetros(g.centro, p) <= g.radio;
  return g.puntos.length >= 3 && dentroDePoligono(p, g.puntos);
}

export function GeocercasView({ empresa }: { empresa: EmpresaDetalle }) {
  const { sesion } = useAuth();
  const puedeEditar = sesion?.permisos.editarFlota ?? false;
  const geocercasQ = useGeocercas(empresa.id);
  const { data: unidadesApi = [] } = useUnidades(empresa.id);
  const crear = useCrearGeocerca();
  const actualizar = useActualizarGeocerca(empresa.id);
  const eliminar = useEliminarGeocerca();
  const [confirmar, dialogo] = useConfirmar();

  const form = useGeocercaForm(empresa.sedes.length === 1 ? empresa.sedes[0].id : null);
  const [pestana, setPestana] = useState<"lista" | "formulario">("lista");
  const [irA, setIrA] = useState<{ geocerca: Geocerca; n: number } | null>(null);
  const [vistaMovil, setVistaMovil] = useState<"panel" | "mapa">("panel");
  const geocercas = geocercasQ.data ?? [];
  const modoEdicion = pestana === "formulario";

  const unidades: UnidadEnMapa[] = useMemo(
    () =>
      unidadesApi.flatMap((u) => {
        const p = posicion(u);
        return p ? [{ id: u.id, identificador: u.identificador, posicion: p, dentroDeEdicion: contiene(form.valores, p) }] : [];
      }),
    [unidadesApi, form.valores],
  );
  // Aviso (no bloqueante) si lo escrito queda muy lejos de todo lo conocido: típico de latitud y longitud invertidas,
  // que están dentro de rango y por eso ninguna validación de límites las detecta.
  const advertenciaUbicacion = useMemo(() => {
    const referencias: LatLng[] = [...unidades.map((u) => u.posicion), ...geocercas.filter((g) => g.id !== form.editando?.id).flatMap((g) => (g.centro ? [g.centro] : g.puntos.slice(0, 1)))];
    const v = form.valores;
    const propios = v.tipo === "CIRCULO" ? (v.centro ? [v.centro] : []) : v.puntos;
    if (referencias.length === 0 || propios.length === 0) return null;
    const lejos = propios.some((p) => Math.min(...referencias.map((r) => distanciaMetros(p, r))) > 300_000);
    return lejos ? "Esta ubicación queda a más de 300 km de tus unidades y geocercas. ¿Invertiste latitud y longitud? (la latitud va primero)" : null;
  }, [unidades, geocercas, form.editando?.id, form.valores]);
  const unidadesDentro = (g: Geocerca) => unidades.filter((u) => contiene(g, u.posicion)).length;

  const abrirNueva = () => {
    form.nueva();
    setPestana("formulario");
  };
  const abrirEdicion = (g: Geocerca) => {
    form.editar(g);
    setPestana("formulario");
  };
  const seleccionar = (g: Geocerca) => {
    setIrA((a) => ({ geocerca: g, n: (a?.n ?? 0) + 1 }));
    if (puedeEditar) abrirEdicion(g);
  };

  const guardar = () => {
    const alTerminar = { onSuccess: () => { avisar.exito("Geocerca guardada"); setPestana("lista"); }, onError: (e: unknown) => avisar.error(mensajeError(e)) };
    if (form.editando) {
      const dto = cambiosDto(form.editando, form.valores);
      if (Object.keys(dto).length === 0) return setPestana("lista");
      actualizar.mutate({ id: form.editando.id, dto }, alTerminar);
    } else {
      crear.mutate(crearDto(form.valores), alTerminar);
    }
  };

  const alternarActiva = (g: Geocerca) =>
    // Solo { activa }: la geometría no viaja y no se puede pisar
    actualizar.mutate({ id: g.id, dto: { activa: !g.activa } }, { onError: (e) => avisar.error(mensajeError(e)) });

  const onEliminar = async (g: Geocerca) => {
    if (!(await confirmar(`¿Eliminar la geocerca "${g.nombre}"?`))) return;
    eliminar.mutate(g.id, {
      onSuccess: () => {
        avisar.exito("Geocerca eliminada");
        if (form.editando?.id === g.id) setPestana("lista");
      },
      onError: (e) => avisar.error(mensajeError(e)),
    });
  };

  if (geocercasQ.isLoading) return <Cargando texto="Cargando geocercas..." />;
  if (geocercasQ.error) return <ErrorCarga error={geocercasQ.error} onReintentar={() => void geocercasQ.refetch()} />;

  return (
    <div className="flex h-[calc(100vh-100px)] min-h-[520px] w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#161b22] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <Radio className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-white">Geocercas <span className="text-[11px] font-normal text-slate-400">— {empresa.nombre}</span></h1>
            <p className="text-[11px] text-slate-400">{geocercas.length} registradas · {geocercas.filter((g) => g.activa).length} activas</p>
          </div>
        </div>
        <div className="flex items-center rounded-lg border border-white/10 bg-[#0d1117] p-0.5 lg:hidden">
          {(["panel", "mapa"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setVistaMovil(v)} className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${vistaMovil === v ? "bg-cyan-500 text-slate-950" : "text-slate-400"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <div className={`h-full w-full shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#0d1117] lg:flex lg:w-[380px] ${vistaMovil === "panel" ? "flex" : "hidden"}`}>
          <div className="flex shrink-0 border-b border-white/10 bg-[#161b22]/70">
            <button type="button" onClick={() => setPestana("lista")} className={`flex-1 border-b-2 py-2.5 text-xs font-semibold ${pestana === "lista" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400"}`}>
              Lista
            </button>
            {puedeEditar && (
              <button type="button" onClick={() => (form.editando || pestana === "formulario" ? setPestana("formulario") : abrirNueva())} className={`flex-1 border-b-2 py-2.5 text-xs font-semibold ${pestana === "formulario" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400"}`}>
                {form.editando ? "Editar" : "Nueva"}
              </button>
            )}
          </div>

          {pestana === "lista" ? (
            <GeocercasList
              geocercas={geocercas}
              seleccionadaId={form.editando?.id ?? null}
              unidadesDentro={unidadesDentro}
              puedeEditar={puedeEditar}
              onNueva={abrirNueva}
              onSeleccionar={seleccionar}
              onAlternarActiva={alternarActiva}
              onEliminar={onEliminar}
            />
          ) : (
            <GeocercaForm
              valores={form.valores}
              cambiar={form.cambiar}
              sedes={empresa.sedes}
              medidas={form.medidas}
              editando={!!form.editando}
              error={form.error}
              guardando={crear.isPending || actualizar.isPending}
              coordenadas={form}
              advertencia={advertenciaUbicacion}
              onGuardar={guardar}
              onCancelar={() => { form.nueva(); setPestana("lista"); }}
            />
          )}
        </div>

        <GeocercasMapa
          geocercas={geocercas}
          editandoId={modoEdicion ? form.editando?.id ?? null : null}
          valores={form.valores}
          unidades={unidades}
          modoEdicion={modoEdicion}
          onClic={form.clicMapa}
          enfoque={form.enfoque}
          irA={irA}
          visible={vistaMovil === "mapa"}
        />
      </div>
      {dialogo}
    </div>
  );
}
