import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresas } from "@/features/empresas/hooks";
import { useConfiguracion, useGuardarConfiguracion, useUnidades } from "@/features/camiones/hooks";
import { Cargando, ErrorCarga, SinDatos } from "@/shared/ui/Estados";
import { Campo, Input, Select, BotonPrimario, MensajeError } from "@/shared/ui/Formulario";
import { avisar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";

// Los mismos que usa el backend al crear una configuración sin datos
const POR_DEFECTO = { objetivoFlotaL100km: 40, precioUsdPorLitro: 1.1, emisionesCo2Factor: 2.68 };
type Valores = Record<keyof typeof POR_DEFECTO, string>;

export function Configuracion() {
  const { sesion } = useAuth();
  const esGlobal = sesion?.permisos.verTodasLasEmpresas ?? false;
  const { data: empresas = [] } = useEmpresas(esGlobal);
  const [empresaId, setEmpresaId] = useState<number | undefined>(sesion?.usuario.empresaId ?? undefined);

  useEffect(() => {
    if (esGlobal && !empresaId && empresas.length) setEmpresaId(empresas[0].id);
  }, [esGlobal, empresaId, empresas]);

  const unidades = useUnidades(empresaId);
  const [maquinariaId, setMaquinariaId] = useState<number | null>(null);
  useEffect(() => {
    const lista = unidades.data ?? [];
    if (lista.length && !lista.some((u) => u.id === maquinariaId)) setMaquinariaId(lista[0].id);
    if (!lista.length) setMaquinariaId(null);
  }, [unidades.data, maquinariaId]);

  const configuracion = useConfiguracion(maquinariaId);
  const guardar = useGuardarConfiguracion();
  const [valores, setValores] = useState<Valores>({ objetivoFlotaL100km: "", precioUsdPorLitro: "", emisionesCo2Factor: "" });

  useEffect(() => {
    if (configuracion.isFetching) return;
    const c = configuracion.data ?? POR_DEFECTO;
    setValores({
      objetivoFlotaL100km: String(c.objetivoFlotaL100km),
      precioUsdPorLitro: String(c.precioUsdPorLitro),
      emisionesCo2Factor: String(c.emisionesCo2Factor),
    });
  }, [configuracion.data, configuracion.isFetching]);

  const onGuardar = (e: FormEvent) => {
    e.preventDefault();
    if (!maquinariaId) return;
    guardar.mutate(
      {
        id: maquinariaId,
        dto: {
          objetivoFlotaL100km: Number(valores.objetivoFlotaL100km),
          precioUsdPorLitro: Number(valores.precioUsdPorLitro),
          emisionesCo2Factor: Number(valores.emisionesCo2Factor),
        },
      },
      { onSuccess: () => avisar.exito("Configuración guardada") },
    );
  };

  const cambiar = (k: keyof Valores) => (e: React.ChangeEvent<HTMLInputElement>) => setValores((v) => ({ ...v, [k]: e.target.value }));

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Métricas y Metas</h1>
        <p className="mt-1 text-sm text-slate-400">Parámetros de cálculo del dashboard de flota, por unidad.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {esGlobal && (
            <Campo etiqueta="Empresa">
              <Select value={empresaId ?? ""} onChange={(e) => setEmpresaId(Number(e.target.value))}>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </Select>
            </Campo>
          )}
          <Campo etiqueta="Unidad">
            <Select value={maquinariaId ?? ""} onChange={(e) => setMaquinariaId(Number(e.target.value))} disabled={!unidades.data?.length}>
              {(unidades.data ?? []).map((u) => (
                <option key={u.id} value={u.id}>{u.identificador} · {u.sede}</option>
              ))}
            </Select>
          </Campo>
        </div>

        {unidades.isLoading ? (
          <Cargando texto="Cargando unidades..." />
        ) : unidades.error ? (
          <ErrorCarga error={unidades.error} onReintentar={() => void unidades.refetch()} />
        ) : !maquinariaId ? (
          <SinDatos titulo="Esta empresa no tiene unidades registradas" />
        ) : configuracion.isLoading ? (
          <Cargando texto="Cargando configuración..." />
        ) : (
          <form onSubmit={onGuardar} className="space-y-6 border-t border-slate-700/50 pt-6">
            {!configuracion.data && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                Esta unidad todavía no tiene configuración: se muestran los valores por defecto que usa el backend. Guarda para fijarlos.
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Campo etiqueta="Objetivo (L/100 km)" requerido ayuda="Límite entre rendimiento aceptable y desvío.">
                <Input type="number" step="0.1" min="0" required value={valores.objetivoFlotaL100km} onChange={cambiar("objetivoFlotaL100km")} />
              </Campo>
              <Campo etiqueta="Precio diésel (USD/L)" requerido ayuda="Para costos por consumo y ralentí.">
                <Input type="number" step="0.01" min="0" required value={valores.precioUsdPorLitro} onChange={cambiar("precioUsdPorLitro")} />
              </Campo>
              <Campo etiqueta="Factor CO₂ (kg/L)" requerido ayuda="Diésel: 2,68 kg de CO₂ por litro.">
                <Input type="number" step="0.01" min="0" required value={valores.emisionesCo2Factor} onChange={cambiar("emisionesCo2Factor")} />
              </Campo>
            </div>
            <MensajeError>{guardar.error ? mensajeError(guardar.error) : null}</MensajeError>
            <BotonPrimario type="submit" cargando={guardar.isPending}>Guardar cambios</BotonPrimario>
          </form>
        )}
      </div>
    </div>
  );
}
