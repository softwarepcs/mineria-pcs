import { useState } from "react";
import type { Empresa } from "@/types";
import { FlotaKpis } from "@/components/flota/FlotaKpis";
import { FlotaMap } from "@/components/flota/FlotaMap";
import { FlotaTable } from "@/components/flota/FlotaTable";
import { FlotaDesvioChart } from "@/components/flota/FlotaDesvioChart";

export function FlotaHome({ empresa }: { empresa: Empresa }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (!empresa.flota) return null;

  const handleSelect = (id: string | null) => {
    setSelectedId(id && id !== "" ? id : null);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full max-w-full">
      <FlotaKpis
        resumen={empresa.flota.resumen}
        maquinarias={empresa.flota.maquinarias}
        selectedId={selectedId}
        onReset={() => setSelectedId(null)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-4 sm:gap-5 items-stretch">
        <div className="w-full min-w-0">
          <FlotaMap
            maquinarias={empresa.flota.maquinarias}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
        <div className="w-full min-w-0">
          <FlotaTable
            maquinarias={empresa.flota.maquinarias}
            selectedId={selectedId}
            onSelect={handleSelect}
            mode="alerts"
          />
        </div>
      </div>
      <div className="w-full min-w-0">
        <FlotaTable
          maquinarias={empresa.flota.maquinarias}
          selectedId={selectedId}
          onSelect={handleSelect}
          mode="full"
        />
      </div>
      <div className="w-full min-w-0">
        <FlotaDesvioChart
          maquinarias={empresa.flota.maquinarias}
          objetivo={empresa.flota.resumen.objetivoL100km}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
