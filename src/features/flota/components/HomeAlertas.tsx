import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHistorialAlertas } from "@/features/alertas/hooks";
import type { FilaHistorial } from "@/features/alertas/api";
import { COLOR_CONSUMO, COLOR_GEOCERCA } from "@/features/alertas/estilos";
import { horaEn } from "@/features/reportes/ventana";

const SIN_FILTRO = {} as const;
const CLAVE_ABIERTO = "home_alertas_abierto";

/** "14:20" si es de hoy; "23/10" si es de otro día (zona horaria de la empresa). */
function cuando(iso: string, tz: string): string {
  const d = new Date(iso);
  const dia = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: tz });
  return dia(d) === dia(new Date()) ? horaEn(d, tz) : d.toLocaleDateString("es-AR", { timeZone: tz, day: "2-digit", month: "2-digit" });
}

function texto(f: FilaHistorial): string {
  if (f.tipo === "CONSUMO") return f.situacion === "ABIERTO" ? "avanza sin registrar consumo" : "avanzó sin registrar consumo";
  return `${f.tipoEvento === "SALIDA" ? "salida de" : "entrada a"} ${f.geocerca ?? "geocerca"}`;
}

function leerAbierto(): boolean {
  try {
    return localStorage.getItem(CLAVE_ABIERTO) !== "0";
  } catch {
    return true;
  }
}

/**
 * Últimas alertas, sobre el mapa (derecha, debajo de los controles). Se puede plegar para dejar
 * el mapa despejado; la preferencia queda guardada en este navegador.
 */
export function HomeAlertas({ empresaId, zonaHoraria, rutaAlertas }: { empresaId: number; zonaHoraria: string; rutaAlertas: string }) {
  const [abierto, setAbierto] = useState(leerAbierto);
  const q = useHistorialAlertas(empresaId, SIN_FILTRO, 1);
  const filas = q.data?.items.slice(0, 5) ?? [];
  const enCurso = filas.filter((f) => f.tipo === "CONSUMO" && f.situacion === "ABIERTO").length;

  const alternar = () => {
    setAbierto((v) => {
      try {
        localStorage.setItem(CLAVE_ABIERTO, v ? "0" : "1");
      } catch {
        // sin almacenamiento local: solo en memoria
      }
      return !v;
    });
  };

  return (
    <section
      aria-label="Últimas alertas"
      className="absolute right-3 top-14 z-[1000] w-[300px] max-w-[calc(100%-24px)] overflow-hidden rounded-[10px] border border-[#1E3850] border-t-[3px] border-t-[#B65CFF] bg-[#02111C]/90 shadow-[0_10px_24px_-12px_#000] sm:right-4"
    >
      <button type="button" onClick={alternar} aria-expanded={abierto} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
        <span className="font-cond text-[15px] font-semibold tracking-wide text-[#F2F6FA]">Últimas alertas</span>
        <span className="flex items-center gap-2">
          {enCurso > 0 && <span className="rounded-full bg-[#F64651] px-1.5 text-[11px] font-semibold leading-[18px] text-white">{enCurso} en curso</span>}
          {abierto ? <ChevronUp className="h-4 w-4 text-[#8FA3B8]" /> : <ChevronDown className="h-4 w-4 text-[#8FA3B8]" />}
        </span>
      </button>

      {abierto && (
        <>
          {filas.length === 0 ? (
            <p className="border-t border-[#12263A] px-3 py-2.5 text-xs text-[#8FA3B8]">Sin alertas registradas.</p>
          ) : (
            <ul className="max-h-[260px] overflow-y-auto">
              {filas.map((f) => (
                <li key={f.id}>
                  <Link to={rutaAlertas} className="flex items-start gap-2 border-t border-[#12263A] px-3 py-1.5 hover:bg-[#0A1E30]">
                    <span className="w-9 flex-none pt-px text-xs tabular-nums text-[#8FA3B8]">{cuando(f.fechaHora, zonaHoraria)}</span>
                    <span
                      className="mt-[5px] h-2 w-2 flex-none"
                      style={{ background: f.tipo === "CONSUMO" ? COLOR_CONSUMO : COLOR_GEOCERCA, borderRadius: f.tipo === "CONSUMO" ? "50%" : "2px" }}
                    />
                    <span className="min-w-0 text-xs leading-snug text-[#C9D6E3]">
                      <strong className="text-white">{f.placa}</strong> · {texto(f)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to={rutaAlertas} className="block border-t border-[#12263A] px-3 py-1.5 text-right text-xs font-semibold text-[#8FD9EE] hover:text-[#C5EEF8]">
            Ver todas ›
          </Link>
        </>
      )}
    </section>
  );
}
