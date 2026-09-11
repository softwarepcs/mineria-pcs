import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Login() {
  const { sesion, login, error } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  if (sesion) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await login(usuario, password);
    setEnviando(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-4">
      {/* Glow decorativo de fondo */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px]" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
          <h1 className="text-xl font-bold text-white">MINERÍA - PERU CONTROLS SYSTEM</h1>
        </div>
        <p className="mb-7 text-sm text-blue-300/70">
          Ingresa tus credenciales para continuar
        </p>

        <label
          htmlFor="usuario"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Usuario o correo
        </label>
        <div className="relative mb-4">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <input
            id="usuario"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            required
            placeholder="usuario@empresa.com"
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Contraseña
        </label>
        <div className="relative mb-2">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
            />
          </svg>
          <input
            id="password"
            type={verPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {verPassword ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-default disabled:opacity-60"
        >
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}