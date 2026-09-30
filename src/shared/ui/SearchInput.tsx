import { Search } from "lucide-react";

interface SearchInputProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Input de búsqueda con icono de lupa integrado.
 *
 * Elimina la duplicación del patrón input+Search icon en CamionesListaView, OperadoresView y GeocercasList.
 */
export function SearchInput({ valor, onChange, placeholder = "Buscar...", className = "" }: SearchInputProps) {
  return (
    <div className={`relative min-w-40 ${className}`}>
      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-[#141b29] py-1.5 pl-8 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-[#0df5c6] focus:ring-1 focus:ring-[#0df5c6]"
      />
    </div>
  );
}
