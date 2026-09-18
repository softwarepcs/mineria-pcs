import { Link, useParams } from "react-router-dom";

export function CamionesListaView() {
  const { id } = useParams(); // empresa id

  return (
    <div className="relative w-full h-[calc(100vh-120px)] flex items-center justify-center bg-[#0a0e17] rounded-xl overflow-hidden border border-white/5">
      <div 
        className="w-full h-full" 
        style={{ 
          backgroundImage: 'url("/assets/img/transporte.png")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Invisible clickable overlay for TC-TRUCK-08 card on the left */}
      <Link 
        to={`/empresa/${id}/camiones-detalle`} 
        className="absolute z-10 cursor-pointer"
        style={{
          top: "36%",
          left: "0",
          width: "20%",
          height: "12%",
        }}
        title="Ver detalles de TC-TRUCK-08"
      >
        <span className="sr-only">TC-TRUCK-08 CLICK AREA</span>
      </Link>
    </div>
  );
}
