import { Link, useParams } from "react-router-dom";

export function OperadorDetalleView() {
  const { id } = useParams(); // empresa id

  return (
    <div className="relative w-full h-[calc(100vh-140px)] flex items-center justify-center bg-[#0a0e17] rounded-xl overflow-hidden border border-white/5">
      <Link 
        to={`/empresa/${id}/operadores`} 
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700 transition"
      >
        &larr; Volver a Operadores
      </Link>
      <img 
        src="/assets/img/operadores-detalles.jpeg" 
        alt="Detalle de Operador" 
        className="w-full h-full object-contain" 
      />
    </div>
  );
}
