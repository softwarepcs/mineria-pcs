import { Link } from "react-router-dom";
import { useHistorialAlertas } from "@/features/alertas/hooks";
import type { FilaHistorial } from "@/features/alertas/api";
import { COLOR_CONSUMO, COLOR_GEOCERCA } from "@/features/alertas/estilos";
import { Panel, PanelTitulo } from "@/shared/ui/Panel";
import { Cargando } from "@/shared/ui/Estados";
import { horaEn } from "@/features/reportes/ventana";

const SIN_FILTRO = {} as const;

/** "14:20" si es de hoy; "23/10" si es de otro día (zona horaria de la empresa). */
function cuando(iso: string, tz: string): string {
  const d = new Date(iso);
  const dia = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: tz });
  return dia(d) === dia(new Date()) ? horaEn(d, tz) : d.toLocaleDateString("es-AR", { timeZone: tz, day: "2-digit", month: "2-digit" });
}

function texto(f: FilaHistorial): { txt: string; tipo: string; colorTipo: string } {
  if (f.tipo === "CONSUMO") {
    const abierta = f.situacion === "ABIERTO";
    return {
      txt: abierta ? "avanza sin registrar consumo" : "avanzó sin registrar consumo",
      tipo: `Consumo de combustible · ${abierta ? "en curso" : "cerrado"}`,
      colorTipo: "#D9B3FF",
    };
  }
  return { txt: `${f.tipoEvento === "SALIDA" ? "salida de" : "entrada a"} ${f.geocerca ?? "geocerca"}`, tipo: "Geocerca", colorTipo: "#7FE3D6" };
}

/** Las 6 alertas más recientes (consumo y geocercas) con enlace a la pantalla Alertas. */
export function HomeAlertas({ empresaId, zonaHoraria, rutaAlertas }: { empresaId: number; zonaHoraria: string; rutaAlertas: string }) {
  const q = useHistorialAlertas(empresaId, SIN_FILTRO, 1);
  const filas = q.data?.items.slice(0, 6) ?? [];

  return (
    <Panel className="border-t-4 border-t-[#B65CFF] pt-3.5">
      <PanelTitulo extra={<Link to={rutaAlertas} className="text-[13px] font-semibold text-[#8FD9EE] hover:text-[#C5EEF8]">Ver todas ›</Link>} className="mb-2">
        Últimas alertas
      </PanelTitulo>

      {q.isLoading ? (
        <Cargando />
      ) : filas.length === 0 ? (
        <p className="border-t border-[#12263A] px-1 py-3 text-[13px] text-[#8FA3B8]">Sin alertas registradas. Todo en orden.</p>
      ) : (
        <ul>
          {filas.map((f) => {
            const t = texto(f);
            return (
              <li key={f.id}>
                <Link to={rutaAlertas} className="flex items-start gap-2.5 border-t border-[#12263A] px-1 py-[7px] hover:bg-[#0A1E30]">
                  <span className="w-[38px] flex-none pt-px text-[13px] tabular-nums text-[#8FA3B8]">{cuando(f.fechaHora, zonaHoraria)}</span>
                  <span
                    className="mt-[5px] h-[9px] w-[9px] flex-none"
                    style={{ background: f.tipo === "CONSUMO" ? COLOR_CONSUMO : COLOR_GEOCERCA, borderRadius: f.tipo === "CONSUMO" ? "50%" : "2px" }}
                  />
                  <span className="text-[13px] leading-snug text-[#C9D6E3]">
                    <strong className="text-white">{f.placa}</strong> · {t.txt}
                    <span className="block text-[11.5px]" style={{ color: t.colorTipo }}>{t.tipo}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
