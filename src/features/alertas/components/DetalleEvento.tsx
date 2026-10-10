import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { GraficoLinea } from "@/shared/ui/GraficoLinea";
import { avisar } from "@/shared/ui/Avisos";
import { mensajeError } from "@/shared/api/errores";
import { useEmpresaPath } from "@/shared/hooks/useEmpresaPath";
import { fechaHora, hora, num } from "@/shared/utils/formato";
import { useAlertaDetalle, useCambiarEstadoAlerta } from "../hooks";
import type { EstadoAlerta } from "../api";
import { EST, est, nombreRegla, pctSobreUmbral, sev } from "../estilos";

function Metrica({ titulo, valor, unidad }: { titulo: string; valor: string; unidad?: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{titulo}</div>
      <div className="font-mono text-base font-bold text-white">
        {valor} {unidad && <span className="font-sans text-[11px] font-medium text-slate-400">{unidad}</span>}
      </div>
    </div>
  );
}

interface Props {
  id: string;
  empresaId: number;
  puedeAtender: boolean;
  onCerrar: () => void;
}

/** Contenido del panel lateral: acciones arriba, luego motivo, métricas y evidencia. */
export function DetalleEvento({ id, empresaId, puedeAtender, onCerrar }: Props) {
  const { data: a, isLoading, error } = useAlertaDetalle(id);
  const basePath = useEmpresaPath();
  const cambiar = useCambiarEstadoAlerta(empresaId);

  if (isLoading) return <Cargando texto="Cargando alerta..." />;
  if (error || !a) return <ErrorCarga error={error} />;

  const s = sev(a.severidad);
  const e = est(a.estado);
  const ticks = a.evidencia.ticksTiempo.map((t) => hora(t));
  const indiceEvento = a.evidencia.ticksTiempo.reduce(
    (mejor, t, i, arr) => (Math.abs(new Date(t).getTime() - new Date(a.fechaHora).getTime()) < Math.abs(new Date(arr[mejor]).getTime() - new Date(a.fechaHora).getTime()) ? i : mejor),
    0,
  );
  const marca = ticks.length ? { indice: indiceEvento, etiqueta: "Alerta" } : undefined;
  const pct = pctSobreUmbral(a.valorRegistrado, a.valorUmbral);

  const mover = (estado: EstadoAlerta) =>
    cambiar.mutate({ id: a.id, estado }, { onSuccess: () => avisar.exito(`Alerta marcada como ${EST[estado].etiqueta.toLowerCase()}`), onError: (err) => avisar.error(mensajeError(err)) });

  const m = a.metricas;
  const metricas = [
    m.duracionMin !== null && { titulo: "Ventana", valor: num(m.duracionMin), unidad: "min" },
    m.distanciaKm !== null && { titulo: "Distancia", valor: num(m.distanciaKm, 1), unidad: "km" },
    m.velocidadMediaKmH !== null && { titulo: "Vel. media", valor: num(m.velocidadMediaKmH, 1), unidad: "km/h" },
    m.consumoGal !== null && { titulo: "Consumo", valor: num(m.consumoGal, 1), unidad: "gal" },
    m.ignicion !== null && { titulo: "Ignición", valor: m.ignicion ? "Encendido" : "Apagado" },
    m.lecturasSensor > 0 && { titulo: "Lecturas", valor: String(m.lecturasSensor) },
  ].filter((x): x is { titulo: string; valor: string; unidad?: string } => !!x);
  const hayEvidencia = a.evidencia.ticksTiempo.length > 0;

  return (
    <div className="flex flex-col">
      {/* Cabecera fija: identidad + acciones, siempre a la vista */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0d1117] px-5 pb-4 pt-4" style={{ boxShadow: `inset 0 3px 0 ${s.strip}` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight" style={{ color: s.strip }}>{nombreRegla(a.regla)}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded border px-1.5 py-px text-[10px] font-bold ${s.clase}`}>{s.etiqueta}</span>
              <span className={`rounded border px-1.5 py-px text-[10px] font-bold ${e.clase}`}>{e.etiqueta}</span>
              <Link to={`${basePath}/camiones/${a.maquinariaId}`} className="font-mono font-bold text-white hover:text-[#0df5c6]">{a.maquinaria}</Link>
              <span className="font-mono text-slate-400">{fechaHora(a.fechaHora)}</span>
            </div>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar detalle" className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {puedeAtender && (
          <div className="mt-3 flex flex-wrap gap-2">
            {a.estado === "GENERADO" && (
              <button type="button" disabled={cambiar.isPending} onClick={() => mover("ATENDIDO")} className="rounded-lg bg-[#ef5350] px-4 py-2 text-xs font-bold text-white hover:bg-[#e04845] disabled:opacity-50">
                Marcar como atendida
              </button>
            )}
            {a.estado !== "CERRADO" && (
              <button type="button" disabled={cambiar.isPending} onClick={() => mover("CERRADO")} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 disabled:opacity-50">
                Cerrar alerta
              </button>
            )}
            {a.estado === "CERRADO" && (
              <button type="button" disabled={cambiar.isPending} onClick={() => mover("GENERADO")} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 disabled:opacity-50">
                Reabrir
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        <div className="flex items-end justify-between gap-4 rounded-lg border border-white/8 bg-white/[0.03] p-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Valor registrado</div>
            <div className="font-mono text-3xl font-bold text-white">{num(a.valorRegistrado, 2)}</div>
          </div>
          <div className="text-right text-sm text-slate-400">
            <div>
              {a.condicion === ">" ? "supera" : a.condicion === "<" ? "es menor al" : "no cumple el"} umbral de <strong className="font-mono text-white">{num(a.valorUmbral, 2)}</strong>
            </div>
            {pct !== null && (
              <div className="font-mono text-sm font-bold" style={{ color: s.strip }}>
                {pct >= 0 ? "+" : ""}
                {pct.toFixed(1)}% sobre el umbral
              </div>
            )}
          </div>
        </div>

        {metricas.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            {metricas.map((x) => (
              <Metrica key={x.titulo} {...x} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="text-sm font-bold text-white">Evidencia <span className="text-xs font-normal text-slate-500">(±3 min alrededor de la alerta)</span></div>
          {hayEvidencia ? (
            <>
              <div>
                <div className="mb-1.5 text-[11px] font-medium text-slate-400">Caudal de combustible · L/h</div>
                <GraficoLinea alto={95} etiquetasX={ticks} marcaX={marca} series={[{ nombre: "Caudal", color: "#00ebb0", valores: a.evidencia.puntosCaudal }]} />
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-medium text-slate-400">Velocidad · km/h</div>
                <GraficoLinea alto={95} etiquetasX={ticks} marcaX={marca} series={[{ nombre: "Velocidad", color: "#58a6ff", valores: a.evidencia.puntosVelocidad }]} />
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">No hay lecturas del sensor en ese intervalo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
