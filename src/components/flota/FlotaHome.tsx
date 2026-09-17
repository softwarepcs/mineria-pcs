import { useState } from "react";
import type { Empresa } from "../../types";
import { FlotaKpis } from "./FlotaKpis";
import { FlotaMap } from "./FlotaMap";
import { FlotaTable } from "./FlotaTable";
import { FlotaDesvioChart } from "./FlotaDesvioChart";

export function FlotaHome({ empresa }: { empresa: Empresa }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (!empresa.flota) return null;

  const handleSelect = (id: string | null) => {
    setSelectedId(id && id !== "" ? id : null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <FlotaKpis
        resumen={empresa.flota.resumen}
        maquinarias={empresa.flota.maquinarias}
        selectedId={selectedId}
        onReset={() => setSelectedId(null)}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px" }}>
        <FlotaMap
          maquinarias={empresa.flota.maquinarias}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <FlotaTable
          maquinarias={empresa.flota.maquinarias}
          selectedId={selectedId}
          onSelect={handleSelect}
          mode="alerts"
        />
      </div>
      <FlotaTable
        maquinarias={empresa.flota.maquinarias}
        selectedId={selectedId}
        onSelect={handleSelect}
        mode="full"
      />
      <FlotaDesvioChart
        maquinarias={empresa.flota.maquinarias}
        objetivo={empresa.flota.resumen.objetivoL100km}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </div>
  );
}
