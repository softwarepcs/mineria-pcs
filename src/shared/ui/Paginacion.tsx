interface PaginacionProps {
  pagina: number;
  ultimaPagina: number;
  total: number;
  porPagina: number;
  onCambiar: (pagina: number) => void;
}

/**
 * Control de paginación: rango "Mostrando X a Y de Z" + botones Anterior/Siguiente.
 */
export function Paginacion({ pagina, ultimaPagina, total, porPagina, onCambiar }: PaginacionProps) {
  if (total <= 0) return null;

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
      <div>
        Mostrando {desde} a {hasta} de {total}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagina <= 1}
          onClick={() => onCambiar(Math.max(1, pagina - 1))}
          className="rounded bg-white/5 px-3 py-1 hover:bg-white/10 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={pagina >= ultimaPagina}
          onClick={() => onCambiar(pagina + 1)}
          className="rounded bg-white/5 px-3 py-1 hover:bg-white/10 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
