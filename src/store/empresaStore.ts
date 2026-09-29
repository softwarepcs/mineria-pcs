import { create } from 'zustand';
import type { Empresa } from '@/types';
import { listarEmpresas, obtenerEmpresaPorId } from '@/services/empresaService';

interface EmpresaState {
  empresas: Empresa[];
  cargandoLista: boolean;
  empresaActual: Empresa | null;
  cargandoActual: boolean;
  error: string | null;

  cargarEmpresas: () => Promise<void>;
  cargarEmpresaPorId: (id: number) => Promise<void>;
  limpiarEmpresaActual: () => void;
}

export const useEmpresaStore = create<EmpresaState>((set, get) => ({
  empresas: [],
  cargandoLista: false,
  empresaActual: null,
  cargandoActual: false,
  error: null,

  cargarEmpresas: async () => {
    // Patrón de caché simple: si ya hay empresas, no volvemos a mostrar "cargando"
    // pero igual actualizamos en background.
    if (get().empresas.length === 0) set({ cargandoLista: true });
    try {
      const data = await listarEmpresas();
      set({ empresas: data, cargandoLista: false, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar empresas', cargandoLista: false });
    }
  },

  cargarEmpresaPorId: async (id: number) => {
    // Si la empresa ya está cargada y es la misma, evitamos re-fetch bloqueante
    if (get().empresaActual?.id === id) {
      // Opcional: Actualizar en background
      obtenerEmpresaPorId(id).then(data => data && set({ empresaActual: data }));
      return;
    }
    set({ cargandoActual: true, error: null });
    try {
      const data = await obtenerEmpresaPorId(id);
      set({ empresaActual: data ?? null, cargandoActual: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar empresa', cargandoActual: false });
    }
  },

  limpiarEmpresaActual: () => {
    set({ empresaActual: null });
  }
}));
