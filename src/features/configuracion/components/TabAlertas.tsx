import type { EmpresaDetalle } from "@/features/empresas/api";
import { useConfigAlertas, useGuardarConfigAlerta } from "@/features/alertas/hooks";
import type { TipoConfig } from "@/features/alertas/api";
import { COLOR_CONSUMO, COLOR_GEOCERCA } from "@/features/alertas/estilos";
import { mensajeError } from "@/shared/api/errores";
import { avisar } from "@/shared/ui/Avisos";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { Panel } from "@/shared/ui/Panel";

function Interruptor({ activo, onCambiar, etiqueta, bloqueado }: { activo: boolean; onCambiar: (v: boolean) => void; etiqueta: string; bloqueado?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={bloqueado}
      onClick={() => onCambiar(!activo)}
      className={`relative h-5 w-9 rounded-full transition disabled:opacity-50 ${activo ? "bg-[#2BC4E8]" : "bg-slate-700"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${activo ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

const INFO = {
  CONSUMO: { titulo: "Consumo de combustible", color: COLOR_CONSUMO, texto: "Se abre cuando el camión consume demasiado para su velocidad y se cierra sola al terminar la condición." },
  GEOCERCA: { titulo: "Geocercas", color: COLOR_GEOCERCA, texto: "Aviso informativo cada vez que un camión entra o sale de una geocerca." },
} as const;

/** Configuración › Alertas: activar cada tipo de alerta y su canal en plataforma. */
export function TabAlertas({ empresa }: { empresa: EmpresaDetalle }) {
  const cfg = useConfigAlertas(empresa.id);
  const guardar = useGuardarConfigAlerta(empresa.id);

  if (cfg.isLoading) return <Cargando />;
  if (cfg.isError || !cfg.data) return <ErrorCarga error={cfg.error} onReintentar={() => void cfg.refetch()} />;

  const cambiar = (t: TipoConfig, cambios: Partial<Pick<TipoConfig, "activa" | "canalPlataforma">>) =>
    guardar.mutate({ tipo: t.tipo, cambios }, { onError: (e) => avisar.error(mensajeError(e)) });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {cfg.data.tipos.map((t) => (
        <Panel key={t.tipo}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white"><span className="h-2.5 w-2.5 rounded-full" style={{ background: INFO[t.tipo].color }} />{INFO[t.tipo].titulo}</h2>
              <p className="mt-1 text-xs text-slate-400">{INFO[t.tipo].texto}</p>
            </div>
            <Interruptor activo={t.activa} etiqueta={`Activar alertas de ${INFO[t.tipo].titulo}`} onCambiar={(v) => cambiar(t, { activa: v })} />
          </div>
          <div className={`mt-4 space-y-3 text-sm ${t.activa ? "" : "opacity-50"}`}>
            <div className="flex items-center justify-between"><span className="text-slate-300">Plataforma</span><Interruptor activo={t.canalPlataforma} bloqueado={!t.activa} etiqueta="Canal plataforma" onCambiar={(v) => cambiar(t, { canalPlataforma: v })} /></div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
