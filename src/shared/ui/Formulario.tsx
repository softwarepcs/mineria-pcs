import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export const claseInput =
  "w-full rounded-lg bg-slate-800/80 px-3 py-2 text-sm text-white outline-none ring-1 ring-slate-700 transition-colors placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 disabled:opacity-50";

export function Campo({ etiqueta, requerido, ayuda, children }: { etiqueta: string; requerido?: boolean; ayuda?: string; children: ReactNode }) {
  return (
    <div>
      {/* La ayuda queda fuera del <label> para que no forme parte del nombre accesible del control */}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {etiqueta} {requerido && <span className="text-red-400" aria-hidden="true">*</span>}
        </span>
        {children}
      </label>
      {ayuda && <span className="mt-1 block text-[11px] text-slate-500">{ayuda}</span>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${claseInput} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${claseInput} ${props.className ?? ""}`} />;
}

export function BotonPrimario({ cargando, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean }) {
  return (
    <button
      {...props}
      disabled={cargando || props.disabled}
      className={`rounded-lg bg-[#0df5c6] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#0be0b5] disabled:opacity-50 ${props.className ?? ""}`}
    >
      {cargando ? "Guardando..." : children}
    </button>
  );
}

export function BotonSecundario(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium text-slate-300 ring-1 ring-slate-700 transition hover:bg-slate-800 ${props.className ?? ""}`}
    />
  );
}

export function MensajeError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">{children}</p>;
}
