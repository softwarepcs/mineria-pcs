import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerEmpresaPorId } from "../../services/empresaService";
import type { Empresa } from "../../types";
import { useAuth } from "../../hooks/useAuth";

// Empresa Argentina
import { HomeArgentina } from "./empresa-argentina/home/HomeArgentina";
import { MotorPrincipal } from "./empresa-argentina/data/MotorPrincipal";
import { AsistentesView } from "./empresa-argentina/asistentes/AsistentesView";

// Empresa Chile
import { HomeChile, MonitoreoChile, DataChile, AsistentesChile } from "./empresa-chile";

// Empresa Perú
import { HomePeru } from "./empresa-peru/home/HomePeru";
import { MonitoreoPeru } from "./empresa-peru/monitoreo/MonitoreoPeru";
import { DataPeru } from "./empresa-peru/data/DataPeru";
import { AsistentesPeru } from "./empresa-peru/asistentes/AsistentesPeru";

// Empresa Colombia
import { HomeColombia, MonitoreoColombia, DataColombia, AsistentesColombia } from "./empresa-colombia";

// Empresa México
import { HomeMexico, MonitoreoMexico, DataMexico, AsistentesMexico } from "./empresa-mexico";

// Empresa Brasil
import { HomeBrasil, MonitoreoBrasil, DataBrasil, AsistentesBrasil } from "./empresa-brasil";

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
    // 1. EMPRESA ARGENTINA
    if (empresaIdNum === 1) {
      switch (subruta) {
        case "motor-principal":
        case "database":
          return <MotorPrincipal empresaNombre={empresa.nombre} />;
        case "asistentes":
          return <AsistentesView empresaNombre={empresa.nombre} />;
        default:
          return <HomeArgentina empresa={empresa} />;
      }
    }

    // 2. EMPRESA CHILE
    if (empresaIdNum === 2) {
      switch (subruta) {
        case "database":
        case "motor-principal":
          return <DataChile empresaNombre={empresa.nombre} />;
        case "asistentes":
          return <AsistentesChile empresaNombre={empresa.nombre} />;
        case "monitoreo":
        case "tanques":
        case "achiques":
        case "combustible":
          return <MonitoreoChile empresaNombre={empresa.nombre} />;
        default:
          return <HomeChile empresa={empresa} />;
      }
    }

    // 3. EMPRESA PERÚ
    if (empresaIdNum === 3) {
      switch (subruta) {
        case "database":
        case "motor-principal":
          return <DataPeru empresaNombre={empresa.nombre} />;
        case "asistentes":
          return <AsistentesPeru empresaNombre={empresa.nombre} />;
        case "monitoreo":
          return <MonitoreoPeru empresaNombre={empresa.nombre} />;
        default:
          return <HomePeru empresa={empresa} />;
      }
    }

    // 4. EMPRESA COLOMBIA
    if (empresaIdNum === 4) {
      switch (subruta) {
        case "database":
          return <DataColombia empresaNombre={empresa.nombre} />;
        case "asistentes":
          return <AsistentesColombia empresaNombre={empresa.nombre} />;
        case "monitoreo":
          return <MonitoreoColombia empresaNombre={empresa.nombre} />;
        default:
          return <HomeColombia empresa={empresa} />;
      }
    }

    // 5. EMPRESA MÉXICO
    if (empresaIdNum === 5) {
      switch (subruta) {
        case "database":
          return <DataMexico empresaNombre={empresa.nombre} />;
        case "asistentes":
          return <AsistentesMexico empresaNombre={empresa.nombre} />;
        case "monitoreo":
          return <MonitoreoMexico empresaNombre={empresa.nombre} />;
        default:
          return <HomeMexico empresa={empresa} />;
      }
    }

    // 6. EMPRESA BRASIL
    if (empresaIdNum === 6) {
      switch (subruta) {
        case "database":
          return <DataBrasil empresaNombre={empresa.nombre} />;
        case "asistentes":
          return <AsistentesBrasil empresaNombre={empresa.nombre} />;
        case "monitoreo":
          return <MonitoreoBrasil empresaNombre={empresa.nombre} />;
        default:
          return <HomeBrasil empresa={empresa} />;
      }
    }

    return <div>Vista no configurada para esta empresa.</div>;
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
            ← Volver al Home de {empresa.nombre}
          </Link>
        )}
      </div>

      {renderContenidoEmpresa()}
    </div>
  );
}