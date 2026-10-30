import { createPortal } from "react-dom";
import { useMemo, useState, type ReactNode } from "react";
import type { EmpresaDetalle } from "@/features/empresas/api";
import { FUNCIONES } from "@/app/funciones";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";
import { Input } from "@/shared/ui/Formulario";
import { descargarExcel } from "@/shared/utils/excel";
import { fechaHora, hoyISO, num } from "@/shared/utils/formato";
import { duracion, horaEn } from "@/features/reportes/ventana";
import { getHistorialCompleto, type FilaHistorial, type UltimaConsumo } from "../api";
import { COLOR_CONSUMO, COLOR_GEOCERCA } from "../estilos";
import { useHistorialAlertas, useUltimasConsumo } from "../hooks";

type Tipo = "TODAS" | "CONSUMO" | "GEOCERCA";
type Sub = "TODAS" | "ABIERTO" | "CERRADO" | "ENTRADA" | "SALIDA";

/** Una fila de la tabla: la última alerta de consumo o un evento de geocerca de un camión. */
interface Fila {
  key: string;
  tipo: "CONSUMO" | "GEOCERCA";
  orden: number;
  cuando: string;
  placa: string;
  conductor: string;
  que: string;
  donde: string;
  colorQue: string;
  redondo: boolean;
  galones: string;
  km: string;
  notaKm: string;
  duracion: string;
  estado: "ABIERTO" | "CERRADO" | "ENTRADA" | "SALIDA";
  cierre: string;
}

const ETIQUETA_TIPO = {
  CONSUMO: { txt: "Consumo de combustible", bg: "#2A1745", fg: "#D9B3FF" },
  ENTRADA: { txt: "Geocerca · Entrada", bg: "#0C2E4A", fg: "#8FD9EE" },
  SALIDA: { txt: "Geocerca · Salida", bg: "#2A2140", fg: "#D7C5FF" },
} as const;

const ETIQUETA_ESTADO = {
  ABIERTO: { bg: "#4A1018", fg: "#FF8A93" },
  CERRADO: { bg: "#0B3B22", fg: "#4DF08A" },
  ENTRADA: { bg: "#0C2E4A", fg: "#8FD9EE" },
  SALIDA: { bg: "#2A2140", fg: "#D7C5FF" },
} as const;

/** "Hoy 14:20", "Ayer 22:10" o "23/10 08:05", en la zona horaria de la empresa. */
function cuando(iso: string, tz: string): string {
  const d = new Date(iso);
  const dia = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: tz });
  const ahora = new Date();
  const etiqueta =
    dia(d) === dia(ahora) ? "Hoy" : dia(d) === dia(new Date(ahora.getTime() - 86_400_000)) ? "Ayer" : d.toLocaleDateString("es-AR", { timeZone: tz, day: "2-digit", month: "2-digit" });
  return `${etiqueta} ${horaEn(d, tz)}`;
}
const minutos = (m: number | null) => (m === null ? "—" : duracion(m * 60_000));
const coord = (lat: number | null, lng: number | null) => (lat === null || lng === null ? "Sin posición registrada" : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);

function filaConsumo(u: UltimaConsumo, tz: string): Fila | null {
  const a = u.alerta;
  if (!a) return null;
  const abierta = a.situacion === "ABIERTO";
  return {
    key: `c-${a.id}`,
    tipo: "CONSUMO",
    orden: new Date(a.fechaHora).getTime(),
    cuando: cuando(a.fechaHora, tz),
    placa: u.placa,
    conductor: a.conductor ?? "—",
    que: abierta ? "Avanza sin registrar consumo" : "Avanzó sin registrar consumo",
    donde: coord(a.latitud, a.longitud),
    colorQue: COLOR_CONSUMO,
    redondo: true,
    galones: a.galonesDia === null ? "—" : `${num(a.galonesDia, 1)} gal`,
    km: num(a.km, 1),
    notaKm: a.km === null ? "al cerrarse" : "en la alerta",
    duracion: `${minutos(a.duracionMin)}${abierta ? " · en curso" : ""}`,
    estado: abierta ? "ABIERTO" : "CERRADO",
    cierre: abierta ? "Se cerrará sola al volver el consumo" : a.fechaFin ? `Sola a las ${horaEn(a.fechaFin, tz)}` : "—",
  };
}

/**
 * Último evento de geocerca de cada camión: si es una SALIDA, también su ENTRADA (con cuánto
 * estuvo dentro); si es una ENTRADA, el camión sigue dentro. `eventos` viene del más reciente al más antiguo.
 */
function filasGeocerca(eventos: FilaHistorial[], tz: string): Fila[] {
  const porCamion = new Map<number, FilaHistorial[]>();
  for (const e of eventos) porCamion.set(e.maquinariaId, [...(porCamion.get(e.maquinariaId) ?? []), e]);

  const conCoord = (detalle: string, e: FilaHistorial) =>
    e.latitud === null || e.longitud === null ? detalle : `${detalle} · ${coord(e.latitud, e.longitud)}`;

  const filas: Fila[] = [];
  for (const lista of porCamion.values()) {
    const ultimo = lista[0]!;
    const base = (e: FilaHistorial) => ({
      tipo: "GEOCERCA" as const,
      orden: new Date(e.fechaHora).getTime(),
      cuando: cuando(e.fechaHora, tz),
      placa: e.placa,
      conductor: e.conductor ?? "—",
      colorQue: COLOR_GEOCERCA,
      redondo: false,
      galones: e.galonesDia === null ? "—" : `${num(e.galonesDia, 1)} gal`,
      km: num(e.km, 1),
      notaKm: e.km === null ? "" : "en la geocerca",
      cierre: "—",
    });
    if (ultimo.tipoEvento === "SALIDA") {
      const entrada = lista.slice(1).find((e) => e.tipoEvento === "ENTRADA" && e.geocerca === ultimo.geocerca);
      const dentro = minutos(ultimo.duracionMin);
      if (entrada) {
        filas.push({ ...base(entrada), key: `g-${entrada.id}`, que: `→ Entrada a ${entrada.geocerca}`, donde: conCoord(`Salió a las ${horaEn(ultimo.fechaHora, tz)}`, entrada), duracion: "—", estado: "ENTRADA" });
      }
      filas.push({ ...base(ultimo), key: `g-${ultimo.id}`, que: `← Salida de ${ultimo.geocerca}`, donde: conCoord(`Estuvo dentro ${dentro}`, ultimo), duracion: dentro, estado: "SALIDA" });
    } else {
      const dentro = duracion(Date.now() - new Date(ultimo.fechaHora).getTime());
      filas.push({ ...base(ultimo), notaKm: ultimo.km === null ? "al salir" : "en la geocerca", key: `g-${ultimo.id}`, que: `→ Entrada a ${ultimo.geocerca}`, donde: conCoord(`Sigue dentro · ${dentro} hasta ahora`, ultimo), duracion: "—", estado: "ENTRADA" });
    }
  }
  return filas;
}

const GEO = { tipo: "GEOCERCA" } as const;

/** Pantalla Alertas: la última alerta de consumo y el último evento de geocerca de cada camión. */
export function AlertasView({ empresa }: { empresa: EmpresaDetalle }) {
  const [tipo, setTipo] = useState<Tipo>("TODAS");
  const [sub, setSub] = useState<Sub>("TODAS");
  const consumo = useUltimasConsumo(empresa.id);
  // Los 500 cruces más recientes alcanzan para encontrar el último de cada camión
  const geocercas = useHistorialAlertas(empresa.id, GEO, 1, 500);

  const tz = empresa.zonaHoraria;
  const todas = useMemo(() => {
    const filas = [
      ...(consumo.data ?? []).map((u) => filaConsumo(u, tz)).filter((f): f is Fila => f !== null),
      ...filasGeocerca(geocercas.data?.items ?? [], tz),
    ];
    return filas.sort((a, b) => b.orden - a.orden);
  }, [consumo.data, geocercas.data, tz]);

  const nConsumo = todas.filter((f) => f.tipo === "CONSUMO").length;
  const modoGeo = tipo === "GEOCERCA";
  const visibles = todas.filter((f) => {
    if (tipo !== "TODAS" && f.tipo !== tipo) return false;
    if (sub === "TODAS") return true;
    return f.estado === sub;
  });

  const elegirTipo = (t: Tipo) => {
    setTipo(t);
    setSub("TODAS");
  };
  const elegirSub = (s: Sub) => {
    setSub(s);
    // Abiertas/Cerradas solo aplican al consumo
    if (!modoGeo && s !== "TODAS" && tipo === "TODAS") setTipo("CONSUMO");
  };

  const titulo = `${tipo === "TODAS" ? "Todas las alertas" : tipo === "CONSUMO" ? "Consumo de combustible" : "Geocercas · entradas y salidas"} · ${visibles.length}`;
  const cargando = consumo.isLoading || geocercas.isLoading;
  const error = consumo.isError ? consumo : geocercas.isError ? geocercas : null;

  return (
    <div className="flex w-full max-w-full flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-cond text-[32px] font-bold leading-none text-white sm:text-[38px]">Alertas</h1>
          <p className="mt-1 text-base text-[#A9BBCC]">Última alerta de consumo y último evento de geocerca de cada camión</p>
        </div>
        <BotonExportar empresaId={empresa.id} zonaHoraria={empresa.zonaHoraria} />
      </div>

      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5 rounded-xl border border-[#12263A] bg-[#071623] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-0.5 text-sm text-[#8FA3B8]">Tipo</span>
          <ChipTipo activo={tipo === "TODAS"} onClick={() => elegirTipo("TODAS")} color="#8FA3B8" redondo n={todas.length}>Todas</ChipTipo>
          <ChipTipo activo={tipo === "CONSUMO"} onClick={() => elegirTipo("CONSUMO")} color={COLOR_CONSUMO} redondo n={nConsumo}>Consumo de combustible</ChipTipo>
          <ChipTipo activo={tipo === "GEOCERCA"} onClick={() => elegirTipo("GEOCERCA")} color={COLOR_GEOCERCA} redondo={false} n={todas.length - nConsumo}>Geocercas</ChipTipo>
        </div>
        <div className="hidden h-7 w-px bg-[#1E3850] sm:block" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-0.5 text-sm text-[#8FA3B8]">{modoGeo ? "Evento" : "Estado"}</span>
          {(modoGeo ? (["TODAS", "ENTRADA", "SALIDA"] as Sub[]) : (["TODAS", "ABIERTO", "CERRADO"] as Sub[])).map((s) => (
            <Chip key={s} activo={sub === s} onClick={() => elegirSub(s)}>
              {{ TODAS: "Todas", ABIERTO: "Abiertas", CERRADO: "Cerradas", ENTRADA: "Entradas", SALIDA: "Salidas" }[s]}
            </Chip>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-[#12263A] bg-[#071623] px-5 py-[18px]">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-cond text-[21px] font-semibold text-[#F2F6FA]">{titulo}</h2>
          <span className="text-[13px] text-[#8FA3B8]">Ordenadas de la más reciente a la más antigua</span>
        </div>

        {cargando ? (
          <Cargando />
        ) : error ? (
          <ErrorCarga error={error.error} onReintentar={() => void error.refetch()} />
        ) : visibles.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8FA3B8]">No hay alertas con estos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm text-[#E3EBF2]">
              <thead>
                <tr className="border-b border-[#12263A] text-left text-[12.5px] text-[#8FA3B8] [&>th+th]:border-l [&>th+th]:border-[#13283B] [&>th]:whitespace-nowrap [&>th]:px-3 [&>th]:py-2.5 [&>th]:align-bottom [&>th]:font-medium">
                  <th>Fecha y hora</th>
                  <th>Tipo</th>
                  <th>Camión</th>
                  {FUNCIONES.operadores && <th>Conductor</th>}
                  <th>Qué pasó</th>
                  <th className="text-right">Galones del día<br />al momento</th>
                  <th className="text-right">Km</th>
                  <th>Duración</th>
                  <th>Estado · cierre</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((f) => {
                  const et = ETIQUETA_TIPO[f.tipo === "CONSUMO" ? "CONSUMO" : (f.estado as "ENTRADA" | "SALIDA")];
                  const borde = f.estado === "ABIERTO" ? "#F64651" : f.tipo === "CONSUMO" ? COLOR_CONSUMO : COLOR_GEOCERCA;
                  return (
                    <tr key={f.key} className="border-b border-[#0F2233] hover:bg-[#0A1E30] [&>td+td]:border-l [&>td+td]:border-[#13283B] [&>td]:whitespace-nowrap [&>td]:px-3 [&>td]:py-[11px]">
                      <td className="tabular-nums" style={{ boxShadow: `inset 3px 0 0 ${borde}` }}>{f.cuando}</td>
                      <td>
                        <span className="inline-block rounded-md px-2.5 py-[3px] text-[12.5px] font-semibold" style={{ background: et.bg, color: et.fg }}>{et.txt}</span>
                      </td>
                      <td className="font-semibold text-white">{f.placa}</td>
                      {FUNCIONES.operadores && <td className="max-w-[140px] !whitespace-normal">{f.conductor}</td>}
                      <td className="min-w-[210px] !whitespace-normal">
                        <span className="block text-white">
                          <span className="mr-[7px] inline-block h-[9px] w-[9px] align-[1px]" style={{ background: f.colorQue, borderRadius: f.redondo ? "50%" : "2px" }} />
                          {f.que}
                        </span>
                        <span className="mt-px block text-xs text-[#8FA3B8]">{f.donde}</span>
                      </td>
                      <td className="text-right font-semibold tabular-nums text-white">{f.galones}</td>
                      <td className="text-right tabular-nums">
                        {f.km}
                        {f.notaKm && <span className="mt-px block text-xs text-[#8FA3B8]">{f.notaKm}</span>}
                      </td>
                      <td className="min-w-[100px] max-w-[120px] !whitespace-normal">{f.duracion}</td>
                      <td className="min-w-[130px] max-w-[190px] !whitespace-normal">
                        <span className="inline-block rounded-md px-2.5 py-[3px] text-[12.5px] font-semibold" style={{ background: ETIQUETA_ESTADO[f.estado].bg, color: ETIQUETA_ESTADO[f.estado].fg }}>
                          {f.estado}
                        </span>
                        {f.cierre !== "—" && <span className="mt-1 block text-xs text-[#A9BBCC]">{f.cierre}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3.5 text-[13px] text-[#8FA3B8]">
          Consumo de combustible: se abre cuando el camión avanza sin registrar consumo y se cierra sola al volver el consumo · Geocercas: el estado indica ENTRADA o SALIDA de cada evento
        </p>
      </section>
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-full border border-[#1E3850] px-4 text-sm font-medium ${activo ? "bg-[#2BC4E8] text-[#02111C]" : "bg-[#0C2133] text-[#C9D6E3] hover:border-[#2A6A8C]"}`}
    >
      {children}
    </button>
  );
}

function ChipTipo({ activo, onClick, color, redondo, n, children }: { activo: boolean; onClick: () => void; color: string; redondo: boolean; n: number; children: ReactNode }) {
  return (
    <Chip activo={activo} onClick={onClick}>
      <span className="h-[9px] w-[9px]" style={{ background: activo ? "#02111C" : color, borderRadius: redondo ? "50%" : "2px" }} />
      {children}
      <span className={`rounded-full px-[7px] py-px text-xs font-bold ${activo ? "bg-[#02111C] text-[#2BC4E8]" : "bg-[#1E3850] text-[#C9D6E3]"}`}>{n}</span>
    </Chip>
  );
}

/* ───────── Exportar ───────── */

function BotonExportar({ empresaId, zonaHoraria }: { empresaId: number; zonaHoraria: string }) {
  const [abierto, setAbierto] = useState(false);
  const [desde, setDesde] = useState(hoyISO(-30));
  const [hasta, setHasta] = useState(hoyISO());
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const exportar = async () => {
    setOcupado(true);
    setError("");
    try {
      const filas = await getHistorialCompleto(empresaId, { desde, hasta });
      descargarExcel(
        `alertas_${desde}_${hasta}`,
        ["Fecha y hora", "Tipo", "Estado", "Camión", ...(FUNCIONES.operadores ? ["Conductor"] : []), "Geocerca", "Duración (min)", "Galones del día", "km", "Latitud", "Longitud"],
        filas.map((f) => [
          fechaHora(f.fechaHora, zonaHoraria),
          f.tipo === "CONSUMO" ? "Consumo de combustible" : "Geocerca",
          f.tipo === "CONSUMO" ? f.situacion : f.tipoEvento,
          f.placa,
          ...(FUNCIONES.operadores ? [f.conductor] : []),
          f.geocerca,
          f.duracionMin,
          f.galonesDia,
          f.km,
          f.latitud,
          f.longitud,
        ]),
        "Alertas",
      );
      setAbierto(false);
    } catch {
      setError("No se pudo exportar. Intenta con un rango menor.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={() => setAbierto(true)} className="rounded-lg border border-[#2BC4E8] px-3.5 py-2 text-sm font-semibold text-[#2BC4E8] hover:bg-[#2BC4E8]/10">Exportar a Excel</button>
      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4" onClick={() => setAbierto(false)} role="dialog" aria-modal="true" aria-label="Exportar alertas a Excel">
            <div className="w-full max-w-sm space-y-3 rounded-xl border border-white/10 bg-[#071623] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-sm font-semibold text-white">Exportar alertas a Excel</h2>
              <label className="block text-xs text-slate-400">Desde<Input type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} /></label>
              <label className="block text-xs text-slate-400">Hasta<Input type="date" value={hasta} min={desde} max={hoyISO()} onChange={(e) => setHasta(e.target.value)} /></label>
              {error && <p className="text-xs text-red-300">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setAbierto(false)} className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10">Cancelar</button>
                <button type="button" onClick={() => void exportar()} disabled={ocupado || !desde || !hasta} className="flex-1 rounded-lg bg-[#2BC4E8] px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
                  {ocupado ? "Generando..." : "Descargar"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}


