import { useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { BotonPantallaCompleta } from "@/shared/ui/BotonPantallaCompleta";
import { useFullscreen } from "@/shared/map/useFullscreen";
import type { Unidad } from "@/features/camiones/api";
import type { EstadoFlota } from "@/features/flota/api";
import { ESTADOS_ORDEN, ESTADO_UNIDAD } from "@/features/flota/estado";
import { DataTable, type Columna } from "@/shared/ui/DataTable";
import { Panel, PanelTitulo } from "@/shared/ui/Panel";
import { fechaHora, num } from "@/shared/utils/formato";

type Filtro = "todos" | EstadoFlota;

/** Tabla "Camiones en línea" con filtros por estado. */
interface Props {
  unidades: Unidad[];
  zonaHoraria: string;
  seleccionadaId: number | null;
  onSeleccionar: (id: number) => void;
  /** Camiones que no se dibujan en el mapa. */
  ocultas: Set<number>;
  onAlternarVisible: (id: number) => void;
  onMostrarTodas: (ids: number[], mostrar: boolean) => void;
}

const CASILLA = "h-4 w-4 cursor-pointer accent-[#2BC4E8]";
const noPropagar = (e: MouseEvent) => e.stopPropagation();

export function HomeTabla({ unidades, zonaHoraria, seleccionadaId, onSeleccionar, ocultas, onAlternarVisible, onMostrarTodas }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const { pantallaCompleta, alternarPantallaCompleta } = useFullscreen(contenedorRef);
  const visibles = useMemo(() => (filtro === "todos" ? unidades : unidades.filter((u) => u.estado === filtro)), [unidades, filtro]);
  const sinDato = (u: Unidad) => u.estado === "sin_senal";

  // La casilla del encabezado actúa sobre las filas que se ven con el filtro actual
  const idsVisibles = visibles.map((u) => u.id);
  const nEnMapa = idsVisibles.filter((id) => !ocultas.has(id)).length;
  const todas = idsVisibles.length > 0 && nEnMapa === idsVisibles.length;
  const algunas = nEnMapa > 0 && !todas;
  const totalEnMapa = unidades.filter((u) => !ocultas.has(u.id)).length;

  const columnas: Columna<Unidad>[] = [
    {
      key: "mapa",
      encabezado: (
        <input
          type="checkbox"
          className={CASILLA}
          checked={todas}
          ref={(el) => {
            if (el) el.indeterminate = algunas;
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onMostrarTodas(idsVisibles, e.target.checked)}
          aria-label="Mostrar u ocultar todos en el mapa"
          title="Mostrar u ocultar todos en el mapa"
        />
      ),
      render: (u) => (
        <input
          type="checkbox"
          className={CASILLA}
          checked={!ocultas.has(u.id)}
          onClick={noPropagar}
          onChange={() => onAlternarVisible(u.id)}
          aria-label={`Mostrar ${u.placa} en el mapa`}
          title={ocultas.has(u.id) ? "Mostrar en el mapa" : "Ocultar del mapa"}
        />
      ),
    },
    { key: "placa", encabezado: "Código", ordenable: true, valorOrden: (u) => u.placa, render: (u) => <span className="font-semibold text-white">{u.placa}</span> },
    { key: "camion", encabezado: "Camión", render: (u) => [u.marca, u.modelo].filter(Boolean).join(" ") || "—" },
    {
      key: "dato",
      encabezado: <>Fecha y hora<br />del último dato</>,
      render: (u) => <span className={`tabular-nums ${sinDato(u) ? "text-[#F64651]" : ""}`}>{fechaHora(u.ultimaConexion, zonaHoraria)}</span>,
    },
    {
      key: "estado",
      encabezado: "Estado",
      ordenable: true,
      valorOrden: (u) => ESTADOS_ORDEN.indexOf(u.estado),
      render: (u) => (
        <span className="inline-flex items-center gap-[7px] font-semibold" style={{ color: ESTADO_UNIDAD[u.estado].color }}>
          <span className="h-[9px] w-[9px] rounded-full" style={{ background: ESTADO_UNIDAD[u.estado].color }} />
          {ESTADO_UNIDAD[u.estado].etiqueta}
        </span>
      ),
    },
    {
      key: "consumo",
      encabezado: <>Consumo instantáneo<br />(gal/h)</>,
      alinear: "right",
      ordenable: true,
      valorOrden: (u) => u.telemetria?.consumoInstantaneo ?? -1,
      render: (u) => <span className="font-semibold tabular-nums text-white">{sinDato(u) ? "—" : num(u.telemetria?.consumoInstantaneo, 1)}</span>,
    },
    { key: "vel", encabezado: <>Velocidad<br />(km/h)</>, alinear: "right", render: (u) => <span className="tabular-nums">{sinDato(u) ? "—" : num(u.telemetria?.velocidad, 0)}</span> },
    {
      key: "gal",
      encabezado: "Galones (T)",
      alinear: "right",
      ordenable: true,
      valorOrden: (u) => u.telemetria?.consumoAcumulado ?? -1,
      render: (u) => <span className="font-semibold tabular-nums text-white">{num(u.telemetria?.consumoAcumulado, 2)}</span>,
    },
    { key: "odo", encabezado: <>Odómetro (T)<br />(km)</>, alinear: "right", render: (u) => <span className="tabular-nums">{num(u.telemetria?.odometro, 1)}</span> },
    { key: "hor", encabezado: <>Horómetro (T)<br />(h)</>, alinear: "right", render: (u) => <span className="tabular-nums">{num(u.telemetria?.horasMotor, 2)}</span> },
  ];

  return (
    <div ref={contenedorRef} className={pantallaCompleta ? "h-screen overflow-auto bg-[#02111C] p-4" : ""}>
    <Panel className={pantallaCompleta ? "min-h-full" : ""}>
      <PanelTitulo
        className="mb-1.5"
        extra={
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
            {(["todos", ...ESTADOS_ORDEN] as Filtro[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filtro === f}
                onClick={() => setFiltro(f)}
                className={`h-[34px] rounded-full border border-[#1E3850] px-3.5 text-[13.5px] font-medium transition ${
                  filtro === f ? "bg-[#2BC4E8] text-[#02111C]" : "bg-[#0C2133] text-[#C9D6E3] hover:border-[#2A6A8C]"
                }`}
              >
                {f === "todos" ? "Todos" : ESTADO_UNIDAD[f].etiqueta}
              </button>
            ))}
            <BotonPantallaCompleta activo={pantallaCompleta} onClick={alternarPantallaCompleta} />
          </div>
        }
      >
        <span className="inline-flex items-center gap-2">
          Camiones en línea <span className="punto-vivo" />
        </span>
      </PanelTitulo>
      <DataTable
        columnas={columnas}
        datos={visibles}
        keyExtractor={(u) => u.id}
        filaActiva={seleccionadaId}
        claseFila={(u) => (ocultas.has(u.id) ? "opacity-50" : "")}
        onClickFila={(u) => onSeleccionar(u.id)}
        minWidth="980px"
        vacio={<p className="py-6 text-center text-sm text-[#8FA3B8]">No hay camiones en este estado.</p>}
      />
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-[13px] text-[#8FA3B8]">
        <span>(T) = total acumulado desde la instalación del equipo · se actualiza en tiempo real</span>
        <span>
          En el mapa: <strong className="text-white">{totalEnMapa}</strong> de {unidades.length} · marca o desmarca la casilla para mostrar u ocultar
        </span>
      </div>
    </Panel>
    </div>
  );
}
