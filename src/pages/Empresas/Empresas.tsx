import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarEmpresas } from "../../services/empresaService";
import type { Empresa } from "../../types";

export function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarEmpresas().then((data) => {
      setEmpresas(data);
      setCargando(false);
    });
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        Cargando empresas...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Empresas</h1>
      <p className="mt-1 text-sm text-slate-400">
        Listado de empresas registradas en el sistema
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {empresas.map((e) => (
          <Link
            key={e.id}
            to={`/empresa/${e.id}`}
            className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-blue-500/40 hover:bg-white/[0.07]"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-white group-hover:text-blue-300">
                {e.nombre}
              </div>
              <svg
                className="h-4 w-4 text-slate-500 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                e.estado === "activa"
                  ? "bg-green-500/10 text-green-400"
                  : e.estado === "inactiva"
                  ? "bg-slate-500/10 text-slate-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {e.estado}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}