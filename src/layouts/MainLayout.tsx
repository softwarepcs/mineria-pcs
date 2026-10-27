import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { etiquetaRol } from "@/auth/permisos";
import { useEmpresaActual } from "@/features/empresas/hooks";
import { useAlertasAbiertas } from "@/features/alertas/hooks";

/** Hora que avanza cada segundo, en la zona horaria de la empresa. */
function useReloj(zonaHoraria: string | undefined) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const tz = zonaHoraria || undefined;
  const fecha = ahora.toLocaleDateString("es-AR", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hora = ahora.toLocaleTimeString("es-AR", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return { fecha: fecha.charAt(0).toUpperCase() + fecha.slice(1), hora };
}

const iniciales = (nombre: string | undefined) =>
  (nombre ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "?";

/** Encabezado del diseño: empresa, fecha y hora en vivo, campana de alertas abiertas y usuario. */
function Encabezado({ onAbrirMenu }: { onAbrirMenu: () => void }) {
  const { sesion } = useAuth();
  const { token } = useParams();
  const esGlobal = sesion?.permisos.verTodasLasEmpresas ?? false;
  const empresa = useEmpresaActual(token, sesion?.usuario.empresaId, esGlobal);
  const abiertas = useAlertasAbiertas(empresa?.id);
  const { fecha, hora } = useReloj(empresa?.zonaHoraria);
  const base = token ? `/empresa/${token}` : "/panel";
  const marca = empresa ? empresa.nombre.split(/\s+/)[0]!.toUpperCase() : "EDGE SMART";

  return (
    <header className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#12263A] bg-[#041725] px-4 py-3 md:px-7">
      <div className="flex min-w-0 items-center gap-3 md:gap-5">
        <button
          type="button"
          aria-label="Abrir menú"
          className="rounded-md p-1.5 text-[#8FA3B8] ring-1 ring-white/10 hover:bg-white/5 hover:text-white md:hidden"
          onClick={onAbrirMenu}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="truncate font-cond text-2xl font-bold tracking-wide text-white md:text-[28px]" title={empresa?.nombre}>{marca}</div>
        <div className="hidden h-9 w-px bg-[#1E3850] sm:block" />
        <div className="hidden min-w-0 sm:block">
          <div className="truncate font-cond text-[19px] font-semibold tracking-wide text-white">MONITOREO DE CONSUMO DE COMBUSTIBLE</div>
          <div className="text-[13px] tracking-wider text-[#8FA3B8]">EDGE SMART · PCS</div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden text-right lg:block">
          <div className="text-[13px] text-[#8FA3B8]">{fecha}</div>
          <div className="font-cond text-xl font-semibold tabular-nums text-white">
            {hora}
            <span className="ml-2 inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-[#15E462]">
              <span className="punto-vivo" />
              En línea
            </span>
          </div>
        </div>
        {empresa && (
          <Link to={`${base}/alertas`} aria-label={`Alertas abiertas: ${abiertas}`} className="relative block p-1.5 text-[#C9D6E3] hover:text-white">
            <Bell className="h-6 w-6" />
            {abiertas > 0 && (
              <span className="absolute right-0 top-0 rounded-full bg-[#F64651] px-1.5 text-[11px] font-semibold leading-[18px] text-white">{abiertas}</span>
            )}
          </Link>
        )}
        <div className="flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#0E5E78] text-sm font-semibold text-white">{iniciales(sesion?.usuario.nombre)}</div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-white">{sesion?.usuario.nombre}</div>
            <div className="text-[12.5px] text-[#8FA3B8]">{sesion ? etiquetaRol(sesion.usuario.roles) : ""}</div>
          </div>
        </div>
      </div>
    </header>
  );
}


export function MainLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#02111C]">
      <Encabezado onAbrirMenu={() => setMenuAbierto(true)} />

      <div className="flex min-h-0 flex-1">
        {/* Menú lateral en escritorio */}
        <div className="hidden md:block">
          <Sidebar onLogout={logout} />
        </div>

        <main className="sidebar-scroll relative min-w-0 flex-1 overflow-y-auto bg-[#02111C] p-4 sm:p-5 md:px-7 md:py-6">{children}</main>
      </div>

      {/* Menú móvil tipo cajón */}
      {menuAbierto && (
        <div className="fixed inset-0 z-9999 flex md:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMenuAbierto(false)} />
          <div className="relative flex w-65 flex-col bg-[#041725] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMenuAbierto(false)}
              className="absolute -right-12 top-3 rounded-full bg-white/10 p-2 text-white hover:bg-red-500/80"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className="h-full overflow-y-auto"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setMenuAbierto(false);
              }}
            >
              <Sidebar onLogout={logout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
