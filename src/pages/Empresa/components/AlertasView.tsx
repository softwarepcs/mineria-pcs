import { useState } from "react";

interface Alerta {
  id: string;
  tipo: string;
  maquinaria: string;
  fechaInicio: string;
  fechaFin?: string;
  duracionMin: number;
  distanciaKm: number;
  estado: "sin_reconocer" | "cerrada";
  severidad: "critica" | "normal";
  motivoCierre?: string;
  detalles: {
    velocidadMedia: number;
    consumoRegistrado: number;
    consumoEsperado: number;
    altitudNeta: number;
    lecturasDfmStr: string;
    ignicionStr: string;
    descripcion: string;
  };
}

const mockAlertas: Alerta[] = [
  {
    id: "1",
    tipo: "Velocidad sin consumo",
    maquinaria: "AD 733 PQ",
    fechaInicio: "8 sep 2026, 16:04",
    fechaFin: "16:45",
    duracionMin: 41,
    distanciaKm: 47,
    estado: "sin_reconocer",
    severidad: "critica",
    detalles: {
      velocidadMedia: 69,
      consumoRegistrado: 0.0,
      consumoEsperado: 20.8,
      altitudNeta: -18,
      lecturasDfmStr: "478 / 492 · 97 %",
      ignicionStr: "ON toda la ventana",
      descripcion:
        "Las siete guardas se cumplen. La altitud neta descarta el corte de inyección por bajada y el 97 % de lecturas presentes descarta un hueco de datos: el flujómetro estaba reportando y reportaba cero mientras el camión hacía 47 kilómetros. El consumo esperado se calcula al rendimiento propio del camión, 44,2 L/100 km.",
    },
  },
  {
    id: "2",
    tipo: "Velocidad sin consumo",
    maquinaria: "AE 412 KL",
    fechaInicio: "2 sep 2026, 11:20",
    duracionMin: 6,
    distanciaKm: 4.1,
    estado: "cerrada",
    severidad: "critica",
    motivoCierre: "cerrada: bajada prolongada, falso positivo",
    detalles: {
      velocidadMedia: 45,
      consumoRegistrado: 0.0,
      consumoEsperado: 2.5,
      altitudNeta: -120,
      lecturasDfmStr: "100 / 100 · 100 %",
      ignicionStr: "ON toda la ventana",
      descripcion: "Falso positivo por bajada prolongada.",
    },
  },
];

export function AlertasView({ empresaNombre }: { empresaNombre: string }) {
  const [expandedId, setExpandedId] = useState<string | null>("1");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Alertas</h2>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 rounded border border-emerald-900 bg-emerald-950/30 text-emerald-400">
            Activas &middot; 1
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 rounded border border-slate-800 text-slate-400">
            Últimos 30 días
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          1 crítica sin reconocer
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {mockAlertas.map((alerta) => {
          const isExpanded = expandedId === alerta.id;
          const isCritica = alerta.severidad === "critica";
          const isCerrada = alerta.estado === "cerrada";

          return (
            <div
              key={alerta.id}
              className={`border transition-colors ${
                isExpanded
                  ? "border-red-900/50 bg-[#160f0f]"
                  : "border-slate-800 bg-[#0f1115] hover:bg-slate-800/50 cursor-pointer"
              } rounded-md overflow-hidden`}
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center justify-between p-4"
                onClick={() => setExpandedId(isExpanded ? null : alerta.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Indicator Line */}
                  <div
                    className={`w-1 h-8 rounded-full ${
                      isCerrada ? "bg-slate-600" : isCritica ? "bg-red-400" : "bg-yellow-400"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-white">
                      {alerta.tipo} <span className="text-slate-400">&middot; {alerta.maquinaria}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {alerta.fechaInicio} &middot; {alerta.duracionMin} min &middot; {alerta.distanciaKm} km &middot;{" "}
                      {isCerrada ? alerta.motivoCierre : "sin reconocer"}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs px-2 py-1 rounded border font-medium uppercase tracking-wider ${
                    isCerrada
                      ? "border-slate-700 text-slate-400"
                      : "border-red-900/50 text-red-400"
                  }`}
                >
                  {isCerrada ? "Cerrada" : "Crítica"}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-red-900/30">
                  {/* Inner Header */}
                  <div className="flex items-center gap-4 p-4 border-b border-red-900/30 bg-red-950/10">
                    <h3 className="font-bold text-red-400">{alerta.tipo}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 border border-red-800 text-red-400 rounded">
                      CRÍTICA
                    </span>
                    <span className="text-xs text-slate-400">
                      {alerta.maquinaria} &middot; {alerta.fechaInicio}{alerta.fechaFin ? ` a ${alerta.fechaFin}` : ''}
                    </span>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-4 gap-4 p-6 border-b border-red-900/30">
                    <div>
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Duración
                      </div>
                      <div className="text-xl font-bold text-white">
                        {alerta.duracionMin} <span className="text-sm font-medium text-slate-400">min</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Distancia Recorrida
                      </div>
                      <div className="text-xl font-bold text-white">
                        {alerta.distanciaKm} <span className="text-sm font-medium text-slate-400">km</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Velocidad Media
                      </div>
                      <div className="text-xl font-bold text-white">
                        {alerta.detalles.velocidadMedia} <span className="text-sm font-medium text-slate-400">km/h</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Consumo Registrado
                      </div>
                      <div className="text-xl font-bold text-white">
                        {alerta.detalles.consumoRegistrado.toLocaleString("es", { minimumFractionDigits: 2 })}{" "}
                        <span className="text-sm font-medium text-slate-400">L</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Consumo Esperado
                      </div>
                      <div className="text-xl font-bold text-white">
                        {alerta.detalles.consumoEsperado.toLocaleString("es", { minimumFractionDigits: 1 })}{" "}
                        <span className="text-sm font-medium text-slate-400">L</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Altitud Neta
                      </div>
                      <div className="text-xl font-bold text-white">
                        {alerta.detalles.altitudNeta} <span className="text-sm font-medium text-slate-400">m</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Lecturas del DFM
                      </div>
                      <div className="text-lg font-bold text-white">
                        {alerta.detalles.lecturasDfmStr}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-1">
                        Ignición
                      </div>
                      <div className="text-sm font-bold text-white pt-1">
                        {alerta.detalles.ignicionStr}
                      </div>
                    </div>
                  </div>

                  {/* Description & Actions */}
                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-slate-300 mb-6 max-w-4xl">
                      {alerta.detalles.descripcion}
                    </p>
                    <div className="flex gap-4">
                      <button className="px-5 py-2 text-sm font-semibold rounded bg-[#df8f85] text-[#2c1311] hover:bg-[#e49b91] transition">
                        Reconocer
                      </button>
                      <button className="px-5 py-2 text-sm font-medium rounded border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition">
                        Ver el viaje completo
                      </button>
                      <button className="px-5 py-2 text-sm font-medium rounded border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition">
                        Cerrar con motivo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
