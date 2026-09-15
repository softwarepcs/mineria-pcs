import { useEffect, useState } from "react";
import type { UsuarioSesion } from "../../types";
import { listarUsuarios } from "../../services/usuarioService";

const NOMBRE_ROL: Record<number, string> = {
  1: "Administrador principal",
  2: "Administrador",
  3: "Empresa",
};

const ROL_STYLES: Record<number, string> = {
  1: "bg-blue-500/10 text-blue-400",
  2: "bg-amber-500/10 text-amber-400",
  3: "bg-slate-500/10 text-slate-400",
};

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarUsuarios()
      .then((data) => {
        setUsuarios(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar la lista de usuarios.");
        setCargando(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Usuarios</h1>
      <p className="mt-1 text-sm text-slate-400">
        Gestión de usuarios del sistema (solo lectura por ahora)
      </p>

      {error && (
        <div className="mt-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {cargando ? (
          <div className="p-8 text-center text-sm text-slate-400">Cargando usuarios...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Empresa asociada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usuarios.map((u) => (
                <tr key={u.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-400">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{u.email}</td>
                  <td className="px-4 py-3 text-slate-300">{u.nombre}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ROL_STYLES[u.rol] ?? "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {NOMBRE_ROL[u.rol]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.empresaNombre ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}