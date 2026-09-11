import { Link } from "react-router-dom";

export function NotAuthorized() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-4">
      {/* Glow decorativo de fondo, consistente con el Login */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.99 4.5h.01" />
          </svg>
        </div>

        <p className="text-sm font-medium tracking-wide text-red-400">Error 403</p>
        <h1 className="mt-1 text-xl font-bold text-white">Acceso no autorizado</h1>
        <p className="mt-2 text-sm text-slate-400">
          No tienes autorización para acceder a esta información.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}