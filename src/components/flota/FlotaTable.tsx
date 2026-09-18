import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Maquinaria } from "../../types";

type Columna = keyof Pick<Maquinaria, "km" | "litros" | "l100km" | "desvioPct" | "ralentiPct" | "horas" | "pctGasto" | "co2Ton">;

const COLUMNAS: { key: Columna; label: string }[] = [
  { key: "km", label: "KM" },
  { key: "litros", label: "Litros" },
  { key: "l100km", label: "L/100 km" },
  { key: "desvioPct", label: "Desvío" },
  { key: "ralentiPct", label: "Ralentí" },
  { key: "horas", label: "Horas" },
  { key: "pctGasto", label: "% del gasto" },
  { key: "co2Ton", label: "CO₂ (T)" },
];

function EstadoBadge({ estado }: { estado: string }) {
  let bg = "rgba(100,116,139,0.12)";
  let color = "#636e7b";
  let label = "OFFLINE";

  if (estado === "conduccion" || estado === "en_linea") {
    bg = "rgba(26,154,122,0.12)";
    color = "#1a9a7a";
    label = "EN LÍNEA";
  } else if (estado === "ralentí") {
    bg = "rgba(217,155,66,0.12)";
    color = "#d99b42";
    label = "RALENTÍ";
  } else if (estado === "ralenti") {
    bg = "rgba(217,155,66,0.12)";
    color = "#d99b42";
    label = "RALENTÍ";
  } else if (estado === "sin_datos") {
    bg = "rgba(100,116,139,0.12)";
    color = "#636e7b";
    label = "SIN DATOS";
  }

  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "4px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em",
      background: bg, color, border: `1px solid ${color}33`,
    }}>
      {label}
    </span>
  );
}

export function FlotaTable({
  maquinarias,
  selectedId,
  onSelect,
  mode = "full",
}: {
  maquinarias: Maquinaria[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mode?: "full" | "alerts";
}) {
  const { id } = useParams();
  const empresaId = id || "1";
  const [orden, setOrden] = useState<{ col: Columna; dir: "asc" | "desc" }>({ col: "desvioPct", dir: "desc" });

  const ordenados = [...maquinarias].sort((a, b) =>
    orden.dir === "desc" ? b[orden.col] - a[orden.col] : a[orden.col] - b[orden.col]
  );

  function alClicColumna(col: Columna) {
    setOrden((prev) => (prev.col === col ? { col, dir: prev.dir === "desc" ? "asc" : "desc" } : { col, dir: "desc" }));
  }

  // ─── ALERTS PANEL (sidebar next to map) ───
  if (mode === "alerts") {
    const alertas = ordenados.filter((c) => c.desvioPct > 0 || (c.estado as string) === "revisar" || (c.estado as string) === "sin_datos").slice(0, 5);

    return (
      <div style={{
        borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)",
        background: "#0d1117", padding: "20px", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#e6edf3", margin: "0 0 16px 0" }}>
          Requieren atención
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          {alertas.map((c) => {
            const razon = c.desvioPct > 100
              ? "Consumo fuera de objetivo"
              : c.ralentiPct > 40
              ? `Ralentí alto · ${c.horas} h`
              : (c.estado as string) === "sin_datos"
              ? "Sin transmisión reciente"
              : c.desvioPct > 50
              ? "Paradas extensas no planificadas"
              : "Desvío de ruta detectado";

            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                  background: selectedId === c.id ? "rgba(26,154,122,0.08)" : "rgba(255,255,255,0.02)",
                  border: selectedId === c.id ? "1px solid rgba(26,154,122,0.25)" : "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: c.desvioPct > 100 ? "#d99b42" : "#d99b42",
                      display: "inline-block"
                    }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#e6edf3" }}>{c.placa}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#636e7b", paddingLeft: "16px" }}>
                    {razon}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                  <span style={{
                    fontSize: "13px", fontWeight: 700,
                    color: c.desvioPct > 0 ? "#d99b42" : "#1a9a7a",
                    whiteSpace: "nowrap"
                  }}>
                    +{c.desvioPct.toFixed(1)} %
                  </span>
                  <Link
                    to={`/empresa/${empresaId}/camiones-detalle?camionId=${encodeURIComponent(c.id)}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: "10px", fontWeight: 600, color: "#0df5c6",
                      textDecoration: "none", display: "inline-flex", alignItems: "center"
                    }}
                    className="hover:underline"
                  >
                    Ver ficha →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── FULL TABLE ───
  return (
    <div className="mp-table-container">
      <div className="mp-table-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#e6edf3", margin: 0 }}>
            Comparativa por camión
          </h3>
          {selectedId && (
            <button
              type="button"
              onClick={() => onSelect("")}
              style={{
                padding: "3px 10px", borderRadius: "6px", cursor: "pointer",
                background: "rgba(26,154,122,0.1)", border: "1px solid rgba(26,154,122,0.3)",
                fontSize: "11px", fontWeight: 600, color: "#1a9a7a"
              }}
            >
              ✕ Ver todos
            </button>
          )}
        </div>
        <span style={{ fontSize: "11px", color: "#636e7b" }}>
          ordenada por {COLUMNAS.find((c) => c.key === orden.col)?.label.toLowerCase()}
        </span>
      </div>

      <div className="mp-table-wrapper">
        <table className="mp-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: "20px" }}>Camión</th>
              {COLUMNAS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => alClicColumna(c.key)}
                  style={{ cursor: "pointer", textAlign: "right", userSelect: "none" }}
                >
                  {c.label}
                </th>
              ))}
              <th style={{ textAlign: "right", paddingRight: "20px" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((c) => {
              const activo = c.id === selectedId;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(activo ? "" : c.id)}
                  style={{
                    cursor: "pointer",
                    background: activo ? "rgba(26,154,122,0.06)" : undefined,
                    borderLeft: activo ? "3px solid #1a9a7a" : "3px solid transparent",
                  }}
                >
                  <td style={{ paddingLeft: "20px", fontWeight: 600, color: "#e6edf3" }}>
                    <Link
                      to={`/empresa/${empresaId}/camiones-detalle?camionId=${encodeURIComponent(c.id)}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: "#e6edf3", textDecoration: "none" }}
                      className="hover:underline hover:text-[#0df5c6] transition"
                      title="Ver ficha completa"
                    >
                      {c.placa}
                    </Link>
                  </td>
                  <td style={{ textAlign: "right" }}>{c.km.toLocaleString("es-PE")}</td>
                  <td style={{ textAlign: "right" }}>{c.litros.toLocaleString("es-PE")}</td>
                  <td style={{ textAlign: "right" }}>{c.l100km.toFixed(1)}</td>
                  <td style={{
                    textAlign: "right", fontWeight: 600,
                    color: c.desvioPct > 0 ? "#d99b42" : "#1a9a7a"
                  }}>
                    {c.desvioPct > 0 ? "+" : ""}{c.desvioPct.toFixed(1)} %
                  </td>
                  <td style={{ textAlign: "right" }}>{c.ralentiPct} %</td>
                  <td style={{ textAlign: "right" }}>{c.horas}</td>
                  <td style={{ textAlign: "right" }}>{c.pctGasto.toFixed(1)} %</td>
                  <td style={{ textAlign: "right" }}>{c.co2Ton.toFixed(2)}</td>
                  <td style={{ textAlign: "right", paddingRight: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                      <EstadoBadge estado={c.estado} />
                      <Link
                        to={`/empresa/${empresaId}/camiones-detalle?camionId=${encodeURIComponent(c.id)}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: "11px", fontWeight: 600, color: "#0df5c6",
                          textDecoration: "none", padding: "2px 8px", borderRadius: "4px",
                          background: "rgba(13,245,198,0.1)", border: "1px solid rgba(13,245,198,0.25)"
                        }}
                        className="hover:bg-[#0df5c6] hover:text-black transition"
                        title="Ver ficha completa de este camión"
                      >
                        Ficha
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
