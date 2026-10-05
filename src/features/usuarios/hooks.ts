import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from "./api";

export const usuariosKeys = {
  lista: ["usuarios"] as const,
};

export function useUsuarios(pagina: number, limite: number) {
  return useQuery({
    queryKey: [...usuariosKeys.lista, pagina, limite],
    queryFn: () => listarUsuarios(pagina, limite),
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usuariosKeys.lista });
    },
  });
}

export function useActualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => actualizarUsuario(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usuariosKeys.lista });
    },
  });
}

export function useEliminarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usuariosKeys.lista });
    },
  });
}
