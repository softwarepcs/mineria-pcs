import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerEmpresaPorId } from "../../services/empresaService";
import type { Empresa } from "../../types";
import { useAuth } from "../../hooks/useAuth";

import { FlotaHome } from "../../components/flota/FlotaHome";
import { MotorPrincipal } from "./components/MotorPrincipal";
import { AlertasView } from "./components/AlertasView";
import { OperadoresView } from "./components/OperadoresView";
import { OperadorDetalleView } from "./components/OperadorDetalleView";
import { CamionesListaView } from "./components/CamionesListaView";
import { CamionesDetalleView } from "./components/CamionesDetalleView";

function MonitoreoWrapper({ empresaNombre }: { empresaNombre: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">Monitoreo - {empresaNombre}</h2>
      <p className="mt-2 text-sm text-slate-400">
        Panel de monitoreo general para {empresaNombre}.
      </p>
    </div>
  );
}

export function EmpresaDetalle() {
  const { id, subruta } = useParams();
  const { sesion } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargando, setCargando] = useState(true);
  
  const esAdministrador = sesion?.usuario.rol === 1 || sesion?.usuario.rol === 2;
  const empresaIdNum = Number(id);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    obtenerEmpresaPorId(empresaIdNum).then((data) => {
      setEmpresa(data ?? null);
      setCargando(false);
    });
  }, [id, empresaIdNum]);

  if (cargando) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        Cargando empresa...
      </div>
    );
  }

  if (!empresa) {
    return <div className="text-sm text-slate-400">Empresa no encontrada.</div>;
  }

  const renderContenidoEmpresa = () => {
    switch (subruta) {
      case "motor-principal":
      case "database":
        return <MotorPrincipal empresaNombre={empresa.nombre} />;
      case "alertas":
        return <AlertasView empresaNombre={empresa.nombre} />;
      case "monitoreo":
      case "tanques":
      case "achiques":
      case "combustible":
        return <MonitoreoWrapper empresaNombre={empresa.nombre} />;
      case "operadores":
        return <OperadoresView empresa={empresa} />;
      case "operadores-detalle":
        return <OperadorDetalleView />;
      case "camiones":
        return <CamionesListaView />;
      case "camiones-detalle":
        return <CamionesDetalleView />;
      default:
        return <FlotaHome empresa={empresa} />;
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {esAdministrador && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-blue-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al panel principal
          </Link>
        )}

        {subruta && (
          <Link
            to={`/empresa/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Volver al Home de {empresa.nombre}
          </Link>
        )}
      </div>

      {renderContenidoEmpresa()}
    </div>
  );
}