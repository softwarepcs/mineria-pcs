import { useState, useMemo, type ReactNode } from "react";
import { SinDatos } from "./Estados";

/* ─── Tipos públicos ─── */

export interface Columna<T> {
  key: string;
  encabezado: string;
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
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-left text-sm" style={minWidth ? { minWidth } : undefined}>
        <thead className="border-b border-white/10 bg-[#0e1420]/60 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {columnas.map((col) => (
              <th
                key={col.key}
                onClick={col.ordenable ? () => alClicEncabezado(col.key) : undefined}
                className={`px-4 py-3 ${ALIGN[col.alinear ?? "left"]} ${col.ordenable ? "cursor-pointer select-none transition hover:text-slate-200" : ""}`}
              >
                {col.encabezado}
                {orden?.col === col.key && (
                  <span className="ml-1">{orden.dir === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-300">
          {datosOrdenados.map((fila, index) => {
            const k = keyExtractor(fila);
            const activa = filaActiva !== undefined && filaActiva !== null && k === filaActiva;
            return (
              <tr
                key={k}
                onClick={onClickFila ? () => onClickFila(fila) : undefined}
                className={`transition ${onClickFila ? "cursor-pointer" : ""} ${activa ? "bg-[#1a9a7a]/8" : "hover:bg-white/2"}`}
              >
                {columnas.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${ALIGN[col.alinear ?? "left"]}`}>
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
