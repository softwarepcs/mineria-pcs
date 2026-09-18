import { useState } from "react";
import alertasData from "../../../data/alertasData.json";

interface Evidencia {
  etiquetaZona: string;
  horarioZona: string;
  zonaPeligroInicioPct: number;
  zonaPeligroFinPct: number;
  caudalMax: number;
  velocidadMax: number;
  ticksTiempo: string[];
  puntosCaudal: number[];
  puntosVelocidad: number[];
}

interface Metricas {
  duracion: string;
  distanciaRecorrida: string;
  velocidadMedia: string;
  consumoRegistrado: string;
  consumoEsperado: string;
  altitudNeta: string;
  lecturasSensor: string;
  ignicion: string;
}

interface AlertaItem {
  id: string;
  tipo: string;
  severidad: "critica" | "alta" | "normal";
  estado: "activa" | "cerrada";
  fecha: string;
  duracion: string;
  duracionMin: number;
  camion: string;
  ventanaHoraria: string;
  metricas: Metricas;
  evidencia: Evidencia;
  descripcion: string;
}

function MiniChart({
  puntos,
  maxVal,
  strokeColor,
  fillGradId,
  zonaPeligro,
  altura = 75,
}: {
  puntos: number[];
  maxVal: number;
  strokeColor: string;
  fillGradId: string;
  zonaPeligro?: {
    inicioPct: number;
    finPct: number;
    etiqueta?: string;
    subetiqueta?: string;
  };
  altura?: number;
}) {
  const W = 600;
  const H = altura;
  const padBottom = 8;
  const padTop = 6;
  const graphH = H - padBottom - padTop;

  const coords = puntos.map((v, i) => {
    const x = (i / Math.max(puntos.length - 1, 1)) * W;
    const y = H - padBottom - (Math.min(v, maxVal) / maxVal) * graphH;
    return { x, y };
  });

  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${H - padBottom} L ${coords[0].x.toFixed(1)} ${H - padBottom} Z`
    : "";

  const dangerX1 = zonaPeligro ? (zonaPeligro.inicioPct / 100) * W : 0;
  const dangerX2 = zonaPeligro ? (zonaPeligro.finPct / 100) * W : 0;
  const dangerW = Math.max(0, dangerX2 - dangerX1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: `${H}px`, display: "block" }}>
      <defs>
        <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.28} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      <line x1="0" y1={padTop} x2={W} y2={padTop} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
      <line x1="0" y1={padTop + graphH / 2} x2={W} y2={padTop + graphH / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
      <line x1="0" y1={H - padBottom} x2={W} y2={H - padBottom} stroke="rgba(255,255,255,0.08)" />

      {/* Shaded danger region */}
      {zonaPeligro && dangerW > 0 && (
        <g>
          <rect
            x={dangerX1}
            y={padTop}
            width={dangerW}
            height={graphH}
            fill="rgba(239, 83, 80, 0.10)"
          />
          <line
            x1={dangerX1}
            y1={padTop}
            x2={dangerX1}
            y2={H - padBottom}
            stroke="#ef5350"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={dangerX2}
            y1={padTop}
            x2={dangerX2}
            y2={H - padBottom}
            stroke="#ef5350"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {zonaPeligro.etiqueta && (
            <text
              x={dangerX1 + dangerW / 2}
              y={padTop + 14}
              textAnchor="middle"
              fill="#ef5350"
              fontSize="10"
              fontWeight="600"
            >
              {zonaPeligro.etiqueta}
            </text>
          )}
          {zonaPeligro.subetiqueta && (
            <text
              x={dangerX1 + dangerW / 2}
              y={padTop + 27}
              textAnchor="middle"
              fill="#ef5350"
              fontSize="9"
              fontWeight="500"
              opacity="0.9"
            >
              {zonaPeligro.subetiqueta}
            </text>
          )}
        </g>
      )}

      {/* Area fill */}
      {areaD && <path d={areaD} fill={`url(#${fillGradId})`} />}

      {/* Main Curve */}
      {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export function AlertasView({ empresaNombre: _empresaNombre }: { empresaNombre?: string } = {}) {
  const [alertasList, setAlertasList] = useState<AlertaItem[]>(alertasData.alertas as AlertaItem[]);
  const [selectedId, setSelectedId] = useState<string>(alertasData.alertas[0]?.id || "alt-1");
  const [reconocidas, setReconocidas] = useState<Set<string>>(new Set());

  const selectedAlert = alertasList.find((a) => a.id === selectedId) || alertasList[0];

  const handleReconocer = (id: string) => {
    setReconocidas((prev) => new Set([...prev, id]));
  };

  const _handleCerrar = (id: string) => {
    setAlertasList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: "cerrada" as const } : a))
    );
  };
  void _handleCerrar;

  const isCritica = selectedAlert?.severidad === "critica";
  const isAlta = selectedAlert?.severidad === "alta";
  const isCerrada = selectedAlert?.estado === "cerrada";
  const yaReconocida = reconocidas.has(selectedAlert?.id || "");

  // Counting badges
  const countCriticas = alertasList.filter((a) => a.severidad === "critica" && a.estado !== "cerrada").length;
  const countAltas = alertasList.filter((a) => a.severidad === "alta" && a.estado !== "cerrada").length;

  return (
    <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* ─── Top Header ─── */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
        gap: "12px", marginBottom: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Alertas
          </h2>

          {/* Badges */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "3px 12px", borderRadius: "6px",
            background: countCriticas > 0 ? "rgba(239, 83, 80, 0.12)" : "rgba(255,255,255,0.04)",
            border: countCriticas > 0 ? "1px solid #ef5350" : "1px solid rgba(255,255,255,0.1)",
            fontSize: "12px", fontWeight: 600,
            color: countCriticas > 0 ? "#ef5350" : "#8b949e",
          }}>
            Críticas {countCriticas}
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "3px 12px", borderRadius: "6px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "12px", fontWeight: 500,
            color: "#8b949e",
          }}>
            Altas {countAltas}
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "3px 12px", borderRadius: "6px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "12px", fontWeight: 500,
            color: "#8b949e",
          }}>
            {alertasData.resumen.periodo}
          </div>
        </div>
      </div>

      {/* ─── Two-Column Main Layout ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "310px 1fr",
        gap: "20px",
        alignItems: "start"
      }}>

        {/* ═══════ LEFT COLUMN: Lista de alertas ═══════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0 4px 6px 4px", fontSize: "12px",
          }}>
            <span style={{ fontWeight: 600, color: "#e6edf3" }}>Lista de alertas</span>
            <span style={{ color: "#636e7b" }}>{alertasList.length} alertas</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alertasList.map((a) => {
              const isSelected = selectedId === a.id;
              const cardCritica = a.severidad === "critica";
              const cardAlta = a.severidad === "alta";
              const cardCerrada = a.estado === "cerrada";

              const stripColor = cardCerrada
                ? "#484f58"
                : cardCritica
                ? "#ef5350"
                : cardAlta
                ? "#d99b42"
                : "#1a9a7a";

              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  style={{
                    display: "flex",
                    borderRadius: "8px",
                    background: isSelected ? "#161b22" : "#0d1117",
                    border: isSelected
                      ? "1px solid rgba(255,255,255,0.22)"
                      : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Colored indicator strip */}
                  <div style={{
                    width: "4px", flexShrink: 0, background: stripColor,
                  }} />

                  {/* Body */}
                  <div style={{ padding: "12px 14px", flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
                      marginBottom: "4px",
                    }}>
                      <span style={{
                        fontSize: "13px", fontWeight: 700, color: "#e6edf3",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {a.tipo}
                      </span>
                      {cardCerrada && (
                        <span style={{
                          fontSize: "9px", fontWeight: 700, letterSpacing: "0.04em",
                          padding: "1px 6px", borderRadius: "4px",
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "#8b949e", flexShrink: 0,
                        }}>
                          CERRADA
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: "10px", color: "#636e7b", fontWeight: 500,
                      letterSpacing: "0.02em",
                    }}>
                      {a.fecha} &middot; {a.duracion} &middot; {a.camion}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════ RIGHT COLUMN: Detalle de Alerta ═══════ */}
        {selectedAlert && (
          <div style={{
            borderRadius: "12px",
            background: "#0d1117",
            border: isCritica
              ? "1px solid #e05252"
              : isAlta
              ? "1px solid rgba(217, 155, 66, 0.4)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: isCritica
              ? "0 0 24px rgba(224, 82, 82, 0.08)"
              : "none",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}>

            {/* Header of the detail card */}
            <div style={{
              display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h3 style={{
                  fontSize: "20px", fontWeight: 700, margin: 0,
                  color: isCritica ? "#ef5350" : isAlta ? "#d99b42" : "#e6edf3",
                }}>
                  {selectedAlert.tipo}
                </h3>
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
                  padding: "2px 8px", borderRadius: "4px",
                  border: isCritica
                    ? "1px solid #ef5350"
                    : isAlta
                    ? "1px solid #d99b42"
                    : "1px solid rgba(255,255,255,0.2)",
                  color: isCritica ? "#ef5350" : isAlta ? "#d99b42" : "#8b949e",
                }}>
                  {isCritica ? "CRÍTICA" : isAlta ? "ALTA" : isCerrada ? "CERRADA" : "NORMAL"}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>
                  {selectedAlert.camion}
                </div>
                <div style={{ fontSize: "11px", color: "#636e7b", marginTop: "2px" }}>
                  {selectedAlert.ventanaHoraria}
                </div>
              </div>
            </div>

            {/* 4x2 Metric Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              {/* Row 1, Col 1: DURACIÓN */}
              <div style={{
                padding: "16px 14px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  DURACIÓN
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                  {selectedAlert.metricas.duracion.split(" ")[0]}{" "}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#8b949e" }}>
                    {selectedAlert.metricas.duracion.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 1, Col 2: DISTANCIA RECORRIDA */}
              <div style={{
                padding: "16px 14px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  DISTANCIA RECORRIDA
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                  {selectedAlert.metricas.distanciaRecorrida.split(" ")[0]}{" "}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#8b949e" }}>
                    {selectedAlert.metricas.distanciaRecorrida.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 1, Col 3: VELOCIDAD MEDIA */}
              <div style={{
                padding: "16px 14px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  VELOCIDAD MEDIA
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                  {selectedAlert.metricas.velocidadMedia.split(" ")[0]}{" "}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#8b949e" }}>
                    {selectedAlert.metricas.velocidadMedia.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 1, Col 4: CONSUMO REGISTRADO */}
              <div style={{
                padding: "16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  CONSUMO REGISTRADO
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                  {selectedAlert.metricas.consumoRegistrado.split(" ")[0]}{" "}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#8b949e" }}>
                    {selectedAlert.metricas.consumoRegistrado.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 2, Col 1: CONSUMO ESPERADO */}
              <div style={{
                padding: "16px 14px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  CONSUMO ESPERADO
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                  {selectedAlert.metricas.consumoEsperado.split(" ")[0]}{" "}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#8b949e" }}>
                    {selectedAlert.metricas.consumoEsperado.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 2, Col 2: ALTITUD NETA */}
              <div style={{
                padding: "16px 14px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  ALTITUD NETA
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                  {selectedAlert.metricas.altitudNeta.split(" ")[0]}{" "}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#8b949e" }}>
                    {selectedAlert.metricas.altitudNeta.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </div>

              {/* Row 2, Col 3: LECTURAS DEL SENSOR */}
              <div style={{
                padding: "16px 14px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  LECTURAS DEL SENSOR
                </div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", paddingTop: "4px" }}>
                  {selectedAlert.metricas.lecturasSensor}
                </div>
              </div>

              {/* Row 2, Col 4: IGNICIÓN */}
              <div style={{ padding: "16px 14px" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", textTransform: "uppercase", marginBottom: "6px" }}>
                  IGNICIÓN
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", paddingTop: "6px" }}>
                  {selectedAlert.metricas.ignicion}
                </div>
              </div>
            </div>

            {/* Section: Evidencia */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                Evidencia
              </div>

              {/* Chart 1: Caudal de combustible */}
              <div>
                <div style={{ fontSize: "11px", color: "#8b949e", marginBottom: "6px" }}>
                  Caudal de combustible &middot; L/h
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                  {/* Y-axis labels */}
                  <div style={{
                    width: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                    fontSize: "9px", color: "#636e7b", textAlign: "right", paddingRight: "4px",
                  }}>
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                  </div>
                  {/* SVG Chart */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <MiniChart
                      puntos={selectedAlert.evidencia.puntosCaudal}
                      maxVal={selectedAlert.evidencia.caudalMax}
                      strokeColor="#00ebb0"
                      fillGradId="gradCaudal"
                      altura={85}
                      zonaPeligro={{
                        inicioPct: selectedAlert.evidencia.zonaPeligroInicioPct,
                        finPct: selectedAlert.evidencia.zonaPeligroFinPct,
                        etiqueta: selectedAlert.evidencia.etiquetaZona,
                        subetiqueta: selectedAlert.evidencia.horarioZona,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Chart 2: Velocidad */}
              <div>
                <div style={{ fontSize: "11px", color: "#8b949e", marginBottom: "6px" }}>
                  Velocidad &middot; km/h
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                  {/* Y-axis labels */}
                  <div style={{
                    width: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                    fontSize: "9px", color: "#636e7b", textAlign: "right", paddingRight: "4px",
                  }}>
                    <span>120</span>
                    <span>80</span>
                    <span>40</span>
                    <span>0</span>
                  </div>
                  {/* SVG Chart */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <MiniChart
                      puntos={selectedAlert.evidencia.puntosVelocidad}
                      maxVal={selectedAlert.evidencia.velocidadMax}
                      strokeColor="#58a6ff"
                      fillGradId="gradVelocidad"
                      altura={85}
                      zonaPeligro={{
                        inicioPct: selectedAlert.evidencia.zonaPeligroInicioPct,
                        finPct: selectedAlert.evidencia.zonaPeligroFinPct,
                      }}
                    />
                    {/* Time ticks row */}
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "10px", color: "#636e7b", marginTop: "4px",
                    }}>
                      {selectedAlert.evidencia.ticksTiempo.map((tick, idx) => (
                        <span key={idx}>{tick}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Paragraph */}
            <p style={{
              fontSize: "12px", lineHeight: "1.6", color: "#8b949e", margin: "4px 0 6px 0",
            }}>
              {selectedAlert.descripcion}
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginTop: "6px" }}>
              <button
                type="button"
                onClick={() => handleReconocer(selectedAlert.id)}
                style={{
                  padding: "9px 24px", borderRadius: "6px",
                  background: yaReconocida ? "#1a9a7a" : "#ef5350",
                  color: "#ffffff",
                  fontSize: "12px", fontWeight: 700,
                  border: "none", cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {yaReconocida ? "Reconocida ✓" : "Reconocer"}
              </button>

              {/* <button
                type="button"
                style={{
                  padding: "9px 20px", borderRadius: "6px",
                  background: "transparent",
                  color: "#e6edf3",
                  fontSize: "12px", fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
              >
                Ver el viaje completo
              </button> */}

              {/* <button
                type="button"
                onClick={() => handleCerrar(selectedAlert.id)}
                disabled={isCerrada}
                style={{
                  padding: "9px 20px", borderRadius: "6px",
                  background: "transparent",
                  color: isCerrada ? "#484f58" : "#e6edf3",
                  fontSize: "12px", fontWeight: 500,
                  border: isCerrada ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.15)",
                  cursor: isCerrada ? "not-allowed" : "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isCerrada) e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  if (!isCerrada) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              >
                {isCerrada ? "Alerta cerrada" : "Cerrar con motivo"}
              </button> */}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
