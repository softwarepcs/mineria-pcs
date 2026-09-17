import type { FlotaResumen, Maquinaria } from "../../types";

export function FlotaKpis({
  resumen,
  maquinarias,
  selectedId,
  onReset,
}: {
  resumen: FlotaResumen;
  maquinarias: Maquinaria[];
  selectedId: string | null;
  onReset: () => void;
}) {
  const selectedMaquinaria = selectedId ? maquinarias.find((c) => c.id === selectedId) : null;
  const esIndividual = selectedMaquinaria !== null && selectedMaquinaria !== undefined;

  const dentroDelObjetivo = esIndividual
    ? selectedMaquinaria.desvioPct <= 0
    : resumen.rendimientoMedioL100km <= resumen.objetivoL100km;

  return (
    <div>
      {/* ─── Top bar: Title + badges + reporting ─── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#e6edf3", margin: 0 }}>
            Flota {esIndividual && <span style={{ color: "#00ebb0", fontFamily: "monospace" }}>· Camión {selectedMaquinaria.placa}</span>}
          </h2>

          {!esIndividual ? (
            <>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "4px 12px", borderRadius: "6px",
                background: "rgba(26,154,122,0.12)", border: "1px solid rgba(26,154,122,0.3)",
                fontSize: "12px", fontWeight: 500, color: "#1a9a7a"
              }}>
                {resumen.equipos} equipos
              </span>
              <span style={{
                padding: "4px 12px", borderRadius: "6px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "12px", color: "#8b949e"
              }}>
                {resumen.periodo}
              </span>
              <span style={{
                padding: "4px 12px", borderRadius: "6px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "12px", color: "#8b949e"
              }}>
                Objetivo {resumen.objetivoL100km.toFixed(1)} L/100 km
              </span>
            </>
          ) : (
            <>
              <span style={{
                padding: "4px 12px", borderRadius: "6px",
                fontSize: "12px", fontWeight: 600,
                background: selectedMaquinaria.estado === "ralenti" ? "rgba(217,155,66,0.12)" : "rgba(26,154,122,0.12)",
                border: `1px solid ${selectedMaquinaria.estado === "ralenti" ? "rgba(217,155,66,0.3)" : "rgba(26,154,122,0.3)"}`,
                color: selectedMaquinaria.estado === "ralenti" ? "#d99b42" : "#1a9a7a"
              }}>
                {selectedMaquinaria.estado === "ralenti" ? "RALENTÍ" : selectedMaquinaria.estado.toUpperCase().replace("_", " ")}
              </span>
              <button
                type="button"
                onClick={onReset}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "4px 12px", borderRadius: "6px", cursor: "pointer",
                  background: "rgba(26,154,122,0.1)", border: "1px solid rgba(26,154,122,0.3)",
                  fontSize: "12px", fontWeight: 600, color: "#1a9a7a"
                }}
              >
                ✕ Ver toda la flota
              </button>
            </>
          )}
        </div>

        {!esIndividual && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#636e7b" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a9a7a", display: "inline-block" }} />
            {resumen.reportando} de {resumen.equipos} reportando
          </div>
        )}
      </div>

      {/* ─── 5 KPI Cards ─── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1px",
        borderRadius: "12px", overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)"
      }}>
        {[
          {
            label: "CONSUMO TOTAL",
            value: esIndividual
              ? selectedMaquinaria.litros.toLocaleString("es-PE")
              : resumen.consumoTotalL.toLocaleString("es-PE"),
            unit: "L",
            sub: esIndividual
              ? `${selectedMaquinaria.km.toLocaleString("es-PE")} km recorridos`
              : `${resumen.kmTotal.toLocaleString("es-PE")} km de flota`,
          },
          {
            label: "COSTO",
            value: esIndividual
              ? Math.round(selectedMaquinaria.litros * resumen.precioUsdPorL).toLocaleString("es-PE")
              : resumen.costoUsd.toLocaleString("es-PE"),
            unit: "USD",
            sub: esIndividual
              ? `${selectedMaquinaria.pctGasto.toFixed(1)} % del gasto de la flota`
              : `a ${resumen.precioUsdPorL.toFixed(2)} USD/L`,
          },
          {
            label: "RENDIMIENTO MEDIO",
            value: esIndividual
              ? selectedMaquinaria.l100km.toFixed(1)
              : resumen.rendimientoMedioL100km.toFixed(1),
            unit: "L/100 km",
            sub: esIndividual
              ? `${selectedMaquinaria.desvioPct > 0 ? "+" : ""}${selectedMaquinaria.desvioPct.toFixed(1)} % vs objetivo`
              : `${dentroDelObjetivo ? "-" : "+"}${Math.abs(resumen.desvioVsObjetivoPct).toFixed(1)} % vs objetivo`,
            subColor: dentroDelObjetivo ? "#1a9a7a" : "#d99b42",
          },
          {
            label: "RALENTÍ",
            value: esIndividual
              ? selectedMaquinaria.ralentiPct.toFixed(1)
              : resumen.ralentiFlotaPct.toFixed(1),
            unit: "%",
            sub: esIndividual
              ? `${selectedMaquinaria.horas} horas de motor registradas`
              : `${resumen.ralentiLitros.toLocaleString("es-PE")} L · ${resumen.ralentiUsd.toLocaleString("es-PE")} USD`,
            subColor: "#d99b42",
          },
          {
            label: <>EMISIONES DE CO<sub>2</sub></>,
            value: esIndividual
              ? ((selectedMaquinaria.litros * 2.68) / 1000).toFixed(1)
              : resumen.emisionesCo2Ton.toFixed(1),
            unit: "t",
            sub: esIndividual
              ? `Camión ${selectedMaquinaria.placa}`
              : `${resumen.horasMotor.toLocaleString("es-PE")} h de motor`,
          },
        ].map((kpi, i) => (
          <div key={i} style={{
            padding: "18px 20px",
            background: "#0d1117",
            borderRight: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none"
          }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", color: "#636e7b", margin: "0 0 8px 0" }}>
              {kpi.label}
            </p>
            <p style={{ fontSize: "26px", fontWeight: 700, color: "#e6edf3", margin: "0 0 4px 0", lineHeight: 1.1 }}>
              {kpi.value}
              <span style={{ fontSize: "13px", fontWeight: 400, color: "#636e7b", marginLeft: "6px" }}>{kpi.unit}</span>
            </p>
            <p style={{ fontSize: "11px", color: kpi.subColor || "#636e7b", margin: 0, fontWeight: kpi.subColor ? 500 : 400 }}>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
