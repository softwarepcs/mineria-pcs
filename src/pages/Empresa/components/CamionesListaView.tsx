import { Link, useParams } from "react-router-dom";

export function CamionesListaView() {
  const { id } = useParams(); // empresa id

  return (
    <div className="relative w-full h-[calc(100vh-140px)] flex items-center justify-center bg-[#0a0e17] rounded-xl overflow-hidden border border-white/5">
      <img 
        src="/assets/img/camiones-lista.jpeg" 
        alt="Lista de camiones" 
        className="w-full h-full object-contain" 
      />
      
      {/* Invisible clickable overlay for TC-TRUCK-08 card on the left */}
      <Link 
        to={`/empresa/${id}/camiones-detalle`} 
        className="absolute z-10 cursor-pointer"
        style={{
          top: "30%",
          left: "17%",
          width: "15%",
          height: "12%",
        }}
        title="Ver detalles de TC-TRUCK-08"
      >
        <span className="sr-only">TC-TRUCK-08 CLICK AREA</span>
      </Link>
    </div>
  );
}
