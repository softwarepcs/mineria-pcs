import { Link, useParams } from "react-router-dom";

export function CamionesDetalleView() {
  const { id } = useParams();

  return (
    <div className="relative w-full h-[calc(100vh-140px)] flex items-center justify-center bg-[#0a0e17] rounded-xl overflow-hidden border border-white/5">
      <Link 
        to={`/empresa/${id}/camiones`} 
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700 transition"
      >
        &larr; Volver a lista
      </Link>
      <img 
        src="/assets/img/camiones-detalles.jpeg" 
        alt="Detalle de camión" 
        className="w-full h-full object-contain" 
      />
    </div>
  );
}
