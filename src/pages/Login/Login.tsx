import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function Login() {
  const { sesion, login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  if (sesion) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await login(email, password);
    setEnviando(false);
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:px-20 lg:py-12 overflow-y-auto"
      style={{ backgroundImage: "url('/assets/img/Banner1.jpeg')" }}
    >
      {/* Contenedor principal alineado a la izquierda */}
      <div className="w-full max-w-[440px] my-auto pt-4 pb-8">
        {/* Título de la cabecera */}
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl font-black tracking-wider text-[#FCD306] drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] uppercase select-none">
          RIGEL TELEMATICS
        </h1>

        {/* Tarjeta del Login */}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-[28px] border border-white/15 bg-[#0b1320]/85 p-6 sm:p-8 md:p-9 shadow-2xl shadow-black/80 backdrop-blur-md"
        >
          <p className="mb-6 text-xs sm:text-sm font-semibold tracking-wider text-[#8CB5F5] uppercase">
            INGRESE TUS CREDENCIALES PARA CONTINUAR
          </p>

          {/* Campo: Usuario o Correo */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm sm:text-base font-bold text-white tracking-wide"
            >
              Usuario o Correo:
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                placeholder="usuario@empresa.com"
                className="w-full rounded-2xl border border-slate-300/40 bg-[#CBD1DB] py-3.5 pl-12 pr-4 text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-500 outline-none transition duration-200 focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>
          </div>

          {/* Campo: Contraseña */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm sm:text-base font-bold text-white tracking-wide"
            >
              Contraseña:
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-300/40 bg-[#CBD1DB] py-3.5 pl-12 pr-12 text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-500 outline-none transition duration-200 focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition p-1 cursor-pointer"
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2.5 text-xs sm:text-sm text-red-200 text-center font-medium backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Botón Ingresar */}
          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={enviando}
              className="w-full max-w-[210px] rounded-2xl bg-[#084899] hover:bg-[#063878] active:scale-[0.98] py-3 px-6 text-base font-bold text-white shadow-lg shadow-blue-950/60 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{enviando ? "Ingresando..." : "Ingresar"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Pie de página a la derecha */}
      <div className="w-full flex justify-end items-center pt-4">
        <p className="text-white font-bold text-sm sm:text-base md:text-lg tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-right">
          Powered by{" "}
          <a href="https://peru-controls.com/" target="_blank" rel="noopener noreferrer" className="font-extrabold hover:underline cursor-pointer transition-all duration-200">
            PERU CONTROLS SYSTEM SAC
          </a>
        </p>
      </div>
    </div>
  );
}
