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
    <div className="space-y-6">
      <FlotaKpis
        resumen={empresa.flota.resumen}
        camiones={empresa.flota.camiones}
        selectedId={selectedId}
        onReset={() => setSelectedId(null)}
      />
      <FlotaMap
        camiones={empresa.flota.camiones}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <FlotaTable
        camiones={empresa.flota.camiones}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <FlotaDesvioChart
        camiones={empresa.flota.camiones}
        objetivo={empresa.flota.resumen.objetivoL100km}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </div>
  );
}