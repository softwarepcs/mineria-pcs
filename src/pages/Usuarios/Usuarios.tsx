import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarUsuarios } from "@/features/usuarios/api";
import { etiquetaRol } from "@/auth/permisos";
import { Cargando, ErrorCarga } from "@/shared/ui/Estados";

const LIMITE = 10;

export function Usuarios() {
  const [pagina, setPagina] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["usuarios", pagina, LIMITE],
    queryFn: () => listarUsuarios(pagina, LIMITE),
    placeholderData: keepPreviousData,
  });

  const usuarios = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: pagina, lastPage: 1 };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Usuarios</h1>
      <p className="mt-1 text-sm text-slate-400">Usuarios con acceso a la plataforma (solo lectura)</p>

      {error && <div className="mt-4"><ErrorCarga error={error} onReintentar={() => void refetch()} /></div>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {isLoading ? (
          <Cargando texto="Cargando usuarios..." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usuarios.map((u) => (
                <tr key={u.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{u.email ?? <span className="text-slate-500">Sin acceso</span>}</td>
                  <td className="px-4 py-3 text-slate-300">{u.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-300">{etiquetaRol(u.roles)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.empresa ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{u.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <div>
            Mostrando {(meta.page - 1) * LIMITE + 1} a {Math.min(meta.page * LIMITE, meta.total)} de {meta.total} usuarios
          </div>
          <div className="flex gap-2">
            <button disabled={meta.page <= 1} onClick={() => setPagina((p) => Math.max(1, p - 1))} className="rounded bg-white/5 px-3 py-1 hover:bg-white/10 disabled:opacity-50">
              Anterior
            </button>
            <button disabled={meta.page >= meta.lastPage} onClick={() => setPagina((p) => p + 1)} className="rounded bg-white/5 px-3 py-1 hover:bg-white/10 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
