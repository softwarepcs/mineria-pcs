import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { obtenerEmpresaPorId, listarEmpresas } from "@/services/empresaService";
import { GeocercasView } from "@/features/geocercas/components/GeocercasView";

export function GeocercasPage() {
  const { sesion } = useAuth();
  
  const { data: empresa, isLoading: cargando } = useQuery({
    queryKey: ["geocercasPage_empresa", sesion?.usuario?.empresaId],
    queryFn: async () => {
      if (sesion?.usuario?.empresaId) {
        return (await obtenerEmpresaPorId(sesion.usuario.empresaId)) ?? null;
      } else {
        const all = await listarEmpresas();
        return all.length > 0 ? all[0] : null;
      }
    },
  });

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
