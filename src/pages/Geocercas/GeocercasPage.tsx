import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { obtenerEmpresaPorId, listarEmpresas } from "../../services/empresaService";
import type { Empresa } from "../../types";
import { GeocercasView } from "../../components/geocercas/GeocercasView";

export function GeocercasPage() {
  const { sesion } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function load() {
      setCargando(true);
      if (sesion?.usuario.empresaId) {
        const emp = await obtenerEmpresaPorId(sesion.usuario.empresaId);
        setEmpresa(emp ?? null);
      } else {
        // If admin/global user, load first active empresa as default context
        const all = await listarEmpresas();
        if (all.length > 0) {
          setEmpresa(all[0]);
        }
      }
      setCargando(false);
    }
    load();
  }, [sesion]);

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-sm text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-500" />
        Cargando módulo de Geocercas...
      </div>
    );
  }

  return <GeocercasView empresa={empresa} />;
}
