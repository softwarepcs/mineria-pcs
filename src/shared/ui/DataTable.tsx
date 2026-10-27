import { useState, useMemo, type ReactNode } from "react";
import { SinDatos } from "./Estados";

/* ─── Tipos públicos ─── */

export interface Columna<T> {
  key: string;
  encabezado: ReactNode;
  render: (fila: T, index: number) => ReactNode;
  /** Por defecto `"left"`. */
  alinear?: "left" | "center" | "right";
  /** Si `true`, la columna es ordenable haciendo clic en el encabezado. Requiere `valorOrden`. */
  ordenable?: boolean;
  /** Función que extrae un valor numérico o string para ordenar. Requerida si `ordenable = true`. */
  valorOrden?: (fila: T) => number | string;
}

interface DataTableProps<T> {
  columnas: Columna<T>[];
  datos: T[];
  keyExtractor: (fila: T) => string | number;
  onClickFila?: (fila: T) => void;
  /** Key de la fila activa (se resalta visualmente). */
  filaActiva?: string | number | null;
  /** Clase CSS adicional para cada fila. */
  claseFila?: (fila: T, index: number) => string;
  /** Componente o texto a mostrar cuando no hay datos. */
  vacio?: ReactNode;
  /** Columna y dirección de orden inicial. */
  ordenInicial?: { col: string; dir: "asc" | "desc" };
  /** `min-width` del `<table>` para scroll horizontal (ej: `"820px"`). */
  minWidth?: string;
}

/* ─── Alineación CSS ─── */

const ALIGN: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/* ─── Componente ─── */

/**
 * Tabla de datos genérica con ordenamiento por columna, fila activa y scroll horizontal.
 *
 * Centraliza el scaffold `<table>` + `<thead>` + `<tbody>` repetido en 5 vistas.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columnas={[
 *     { key: "nombre", encabezado: "Nombre", render: (u) => u.nombre },
 *     { key: "email",  encabezado: "Correo", render: (u) => u.email },
 *   ]}
 *   datos={usuarios}
 *   keyExtractor={(u) => u.id}
 * />
 * ```
 */
export function DataTable<T>({
  columnas,
  datos,
  keyExtractor,
  onClickFila,
  filaActiva,
  claseFila,
  vacio,
  ordenInicial,
  minWidth,
}: DataTableProps<T>) {
  const [orden, setOrden] = useState<{ col: string; dir: "asc" | "desc" } | null>(ordenInicial ?? null);

  const datosOrdenados = useMemo(() => {
    if (!orden) return datos;
    const columna = columnas.find((c) => c.key === orden.col);
    if (!columna?.valorOrden) return datos;
    const fn = columna.valorOrden;
    return [...datos].sort((a, b) => {
      const va = fn(a);
      const vb = fn(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return orden.dir === "desc" ? -cmp : cmp;
    });
  }, [datos, orden, columnas]);

  const alClicEncabezado = (col: string) => {
    setOrden((prev) =>
      prev?.col === col
        ? { col, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { col, dir: "desc" },
    );
  };

  if (datos.length === 0) {
    return <>{vacio ?? <SinDatos titulo="No hay datos para mostrar" />}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" style={minWidth ? { minWidth } : undefined}>
        <thead className="border-b border-[#12263A] text-[12.5px] font-medium text-[#8FA3B8]">
          <tr>
            {columnas.map((col) => (
              <th
                key={col.key}
                onClick={col.ordenable ? () => alClicEncabezado(col.key) : undefined}
                className={`whitespace-nowrap px-3 py-2.5 align-bottom [&+th]:border-l [&+th]:border-[#13283B] ${ALIGN[col.alinear ?? "left"]} ${col.ordenable ? "cursor-pointer select-none transition hover:text-slate-200" : ""}`}
              >
                {col.encabezado}
                {orden?.col === col.key && (
                  <span className="ml-1">{orden.dir === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[#E3EBF2]">
          {datosOrdenados.map((fila, index) => {
            const k = keyExtractor(fila);
            const activa = filaActiva !== undefined && filaActiva !== null && k === filaActiva;
            const extraClase = claseFila ? claseFila(fila, index) : "";
            return (
              <tr
                key={k}
                onClick={onClickFila ? () => onClickFila(fila) : undefined}
                className={`border-b border-[#0F2233] transition ${onClickFila ? "cursor-pointer" : ""} ${activa ? "bg-[#0C2E4A] shadow-[inset_3px_0_0_#2BC4E8]" : "hover:bg-[#0A1E30]"} ${extraClase}`}
              >
                {columnas.map((col) => (
                  <td key={col.key} className={`whitespace-nowrap px-3 py-2.5 [&+td]:border-l [&+td]:border-[#13283B] ${ALIGN[col.alinear ?? "left"]}`}>
                    {col.render(fila, index)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
