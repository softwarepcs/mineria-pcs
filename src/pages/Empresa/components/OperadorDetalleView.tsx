import { Link, useParams } from "react-router-dom";

export function OperadorDetalleView() {
  const { id } = useParams(); // empresa id

  return (
    <div className="relative w-full h-[calc(100vh-120px)] flex items-center justify-center bg-[#0a0e17] rounded-xl overflow-hidden border border-white/5">
      <Link 
        to={`/empresa/${id}/operadores`} 
        className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-slate-800/60 backdrop-blur-sm text-white/90 rounded text-xs hover:bg-slate-700/80 transition flex items-center gap-1.5 border border-white/10"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a Operadores
      </Link>
      <div 
        className="w-full h-full" 
        style={{ 
          backgroundImage: 'url("/assets/img/operadores-detalle-1.png")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
}
