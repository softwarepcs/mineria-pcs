import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Empresa, Maquinaria } from "../../../types";
import { Icon } from "../../../components/Icon";
import operadoresData from "../../../data/operadores.json";

export interface Operador {
  id: string;
  nombre: string;
  legajo: string;
  maquinariaId: string | number | null;
  estado: "ACTIVO" | "DE LICENCIA" | "SIN ASIGNAR" | "INACTIVO";
  vencimientoLicencia: string;
  kmPeriodo: number;
  horas: number;
  indice: number | null;
  conduccionBrusca: number;
  atribucion: string;
}

/** Helper function to determine dot color for dates */
function getVencimientoColor(dateString: string) {
  if (!dateString) return "bg-slate-500";
  const date = new Date(dateString);
  const now = new Date(); // Use actual current date or fixed to match 2026-09-17
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) return "bg-red-500";
  if (diffDays <= 60) return "bg-amber-500";
  return "bg-teal-500";
}

function OperadorModal({
  isOpen,
  onClose,
  onSave,
  maquinarias,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (op: Omit<Operador, "id">) => void;
  maquinarias: Maquinaria[];
}) {
  const [nombre, setNombre] = useState("");
  const [legajo, setLegajo] = useState("");
  const [maquinariaId, setMaquinariaId] = useState("");
  const [estado, setEstado] = useState<Operador["estado"]>("ACTIVO");
  const [vencimientoLicencia, setVencimientoLicencia] = useState("");
  const [kmPeriodo, setKmPeriodo] = useState<number | "">("");
  const [horas, setHoras] = useState<number | "">("");
  const [indice, setIndice] = useState<number | "">("");
  const [conduccionBrusca, setConduccionBrusca] = useState<number | "">("");
  const [atribucion, setAtribucion] = useState("Nacional");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nombre,
      legajo,
      maquinariaId: maquinariaId || null,
      estado,
      vencimientoLicencia,
      kmPeriodo: Number(kmPeriodo) || 0,
      horas: Number(horas) || 0,
      indice: indice === "" ? null : Number(indice),
      conduccionBrusca: Number(conduccionBrusca) || 0,
      atribucion,
    });
    // Reset form after saving
    setNombre(""); setLegajo(""); setMaquinariaId(""); setEstado("ACTIVO");
    setVencimientoLicencia(""); 
    setKmPeriodo(""); setHoras(""); setIndice(""); setConduccionBrusca(""); setAtribucion("Nacional");
  };

  const inputClasses = "w-full rounded-lg bg-slate-800/80 px-3 py-2 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-cyan-500 transition-colors placeholder:text-slate-500 border-none";
  const labelClasses = "mb-1 block text-xs font-medium text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/70">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white tracking-tight">Registrar Nuevo Operador</h3>
          <button onClick={onClose} className="text-slate-400 transition hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Nombre completo</label>
              <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClasses} placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <label className={labelClasses}>Legajo</label>
              <input required type="text" value={legajo} onChange={(e) => setLegajo(e.target.value)} className={inputClasses} placeholder="Ej. 00131" />
            </div>
            
            <div>
              <label className={labelClasses}>Vehículo asignado</label>
              <select value={maquinariaId} onChange={(e) => setMaquinariaId(e.target.value)} className={inputClasses}>
                <option value="" className="bg-slate-900">-- Sin asignar --</option>
                {maquinarias.map((m: Maquinaria) => (
                  <option key={m.id} value={m.id} className="bg-slate-900">{m.placa}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value as Operador["estado"])} className={inputClasses}>
                <option value="ACTIVO" className="bg-slate-900">ACTIVO</option>
                <option value="DE LICENCIA" className="bg-slate-900">DE LICENCIA</option>
                <option value="SIN ASIGNAR" className="bg-slate-900">SIN ASIGNAR</option>
                <option value="INACTIVO" className="bg-slate-900">INACTIVO</option>
              </select>
            </div>

            <div>
              <label className={labelClasses}>Vencimiento Licencia</label>
              <input required type="date" value={vencimientoLicencia} onChange={(e) => setVencimientoLicencia(e.target.value)} className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>KM del período</label>
              <input type="number" value={kmPeriodo} onChange={(e) => setKmPeriodo(e.target.value ? Number(e.target.value) : "")} className={inputClasses} placeholder="Ej. 5000" />
            </div>
            <div>
              <label className={labelClasses}>Horas</label>
              <input type="number" value={horas} onChange={(e) => setHoras(e.target.value ? Number(e.target.value) : "")} className={inputClasses} placeholder="Ej. 120" />
            </div>

            <div>
              <label className={labelClasses}>Índice (Opcional)</label>
              <input type="number" step="0.01" value={indice} onChange={(e) => setIndice(e.target.value ? Number(e.target.value) : "")} className={inputClasses} placeholder="Ej. 1.05" />
            </div>
            <div>
              <label className={labelClasses}>Conducción Brusca</label>
              <input type="number" value={conduccionBrusca} onChange={(e) => setConduccionBrusca(e.target.value ? Number(e.target.value) : "")} className={inputClasses} placeholder="Ej. 3" />
            </div>
            
            <div className="col-span-2">
              <label className={labelClasses}>Atribución</label>
              <input required type="text" value={atribucion} onChange={(e) => setAtribucion(e.target.value)} className={inputClasses} placeholder="Ej. Nacional, Internacional" />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-[#0df5c6] px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-[#0be0b5]">
              Guardar Operador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Componente Principal de la Vista */
export function OperadoresView({ empresa }: { empresa: Empresa }) {
  const navigate = useNavigate();
  const [operadores, setOperadores] = useState<Operador[]>(operadoresData as Operador[]);
  
  // Load directly from JSON via our new Vite API proxy
  useEffect(() => {
    fetch('/api/operadores')
      .then(res => res.json())
      .then(data => setOperadores(data))
      .catch(err => console.error("Error fetching operadores from local API:", err));
  }, []);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const maquinarias = empresa.flota?.maquinarias || (empresa.flota as any)?.camiones || [];

  const handleSaveOperador = (nuevoData: Omit<Operador, "id">) => {
    const nuevoOperador: Operador = {
      ...nuevoData,
      id: `op-${Date.now()}`,
    };
    
    const actualizados = [...operadores, nuevoOperador];
    setOperadores(actualizados);
    
    // Save directly to the JSON file via our new Vite API proxy
    fetch('/api/operadores', {
      method: 'POST',
      body: JSON.stringify(actualizados)
    }).catch(err => console.error("Error saving to local JSON:", err));
    
    setIsModalOpen(false);
  };

  const getMaquinariaPlaca = (id: string | number | null) => {
    if (!id) return "Sin asignar";
    // Check if ID matches a machinery, else return the ID itself as placa (since our mock uses placas as IDs for simplicity)
    const maq = maquinarias.find((m: Maquinaria) => String(m.id) === String(id));
    return maq ? maq.placa : String(id);
  };

  const filteredOperadores = operadores.filter(op => {
    const query = searchQuery.toLowerCase();
    const placa = getMaquinariaPlaca(op.maquinariaId).toLowerCase();
    return (
      op.nombre.toLowerCase().includes(query) ||
      op.legajo.toLowerCase().includes(query) ||
      placa.includes(query)
    );
  });

  const activosCount = operadores.filter(o => o.estado === "ACTIVO").length;
  const licenciaCount = operadores.filter(o => o.estado === "DE LICENCIA").length;
  const totalCount = operadores.length;
  
  // Fake calculation for "Documentación por vencer"
  const docsPorVencerCount = operadores.filter(o => {
    if (!o.vencimientoLicencia) return false;
    const lDate = new Date(o.vencimientoLicencia);
    const now = new Date();
    const diffL = (lDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffL <= 30 && diffL >= -365; // Expired or expiring soon
  }).length;

  return (
    <div className="space-y-6 bg-[#0a0e17] text-slate-300 rounded-xl p-6 border border-white/5 font-sans min-h-screen">
      
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Operadores</h2>
          <span className="rounded bg-[#042f2e] px-2.5 py-1 text-xs font-medium text-teal-400 border border-teal-800/50">
            {totalCount} conductores
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon name="search" className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar operador, legajo o camión..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 rounded-lg border-none ring-1 ring-slate-700 bg-slate-800/50 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#0df5c6] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#0be0b5]"
          >
            <span className="text-lg leading-none">+</span> Registrar operador
          </button>
        </div>
      </div>

      {/* ─── KPIs Grid ─── */}
      <div className="grid grid-cols-4 gap-6 border-b border-white/10 pb-6 pt-4">
        <div className="flex flex-col border-r border-white/10 pr-6">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 mb-1">ACTIVOS</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{activosCount}</span>
            <span className="text-xs text-slate-500">de {totalCount} operadores</span>
          </div>
        </div>
        
        <div className="flex flex-col border-r border-white/10 px-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 mb-1">DE LICENCIA</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{licenciaCount}</span>
            <span className="text-xs text-slate-500">de {totalCount} operadores</span>
          </div>
        </div>
        
        <div className="flex flex-col border-r border-white/10 px-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 mb-1">DOCUMENTACIÓN POR VENCER</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-500">{docsPorVencerCount}</span>
            <span className="text-xs text-amber-500/80">{docsPorVencerCount} en menos de 30 días</span>
          </div>
        </div>
        
        <div className="flex flex-col px-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 mb-1">ÍNDICE MEDIO DE FLOTA</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">1,00</span>
          </div>
        </div>
      </div>

      {/* ─── Warning Banner ─── */}
      <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 flex h-5 w-5 items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </span>
          <span className="text-sm font-medium text-amber-500">
            {docsPorVencerCount} operadores tienen documentación por vencer en los próximos 30 días
          </span>
        </div>
        <a href="#" className="text-sm font-medium text-amber-500 underline hover:text-amber-400">Ver</a>
      </div>

      {/* ─── Table ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="pb-3 pl-4 pr-6">OPERADOR</th>
              <th className="pb-3 px-4">CAMIÓN ASIGNADO</th>
              <th className="pb-3 px-4">ESTADO</th>
              <th className="pb-3 px-4">LICENCIA</th>
              <th className="pb-3 px-4 text-center">KM DEL<br/>PERÍODO</th>
              <th className="pb-3 px-4 text-center">HORAS</th>
              <th className="pb-3 px-4 text-center">ÍNDICE</th>
              <th className="pb-3 px-4 text-center">CONDUCCIÓN<br/>BRUSCA</th>
              <th className="pb-3 pr-4 pl-4">ATRIBUCIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOperadores.map((op) => {
              // Format helpers
              const kmFormatted = new Intl.NumberFormat("es-AR").format(op.kmPeriodo);
              const indiceFormatted = op.indice !== null ? op.indice.toFixed(2).replace(".", ",") : "sin comparable";
              const indiceColor = op.indice === null ? "text-slate-500" : (op.indice < 1 ? "text-teal-400" : "text-amber-500");
              
              // Estado Badge Styles
              let estadoClasses = "border-slate-700 text-slate-400";
              if (op.estado === "ACTIVO") estadoClasses = "border-teal-800/60 text-teal-400 bg-teal-900/10";
              
              const placa = getMaquinariaPlaca(op.maquinariaId);

              return (
                <tr 
                  key={op.id} 
                  className="transition-colors hover:bg-white/5 cursor-pointer"
                  onClick={() => navigate(`/empresa/${empresa.id}/operadores-detalle`)}
                >
                  {/* OPERADOR */}
                  <td className="py-3 pl-4 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{op.nombre}</span>
                        <span className="text-[11px] text-slate-500">Legajo {op.legajo}</span>
                      </div>
                    </div>
                  </td>

                  {/* CAMIÓN ASIGNADO */}
                  <td className="px-4 py-3 text-slate-300 font-medium">
                    {placa !== "Sin asignar" ? placa : <span className="text-slate-600">Sin asignar</span>}
                  </td>

                  {/* ESTADO */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wide border ${estadoClasses}`}>
                      {op.estado}
                    </span>
                  </td>

                  {/* LICENCIA */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${getVencimientoColor(op.vencimientoLicencia)}`}></span>
                      <span className="text-slate-300 font-medium text-sm">{op.vencimientoLicencia}</span>
                    </div>
                  </td>

                  {/* KM DEL PERÍODO */}
                  <td className="px-4 py-3 text-center text-slate-300">
                    {kmFormatted}
                  </td>

                  {/* HORAS */}
                  <td className="px-4 py-3 text-center text-slate-300">
                    {op.horas}
                  </td>

                  {/* ÍNDICE */}
                  <td className={`px-4 py-3 text-center font-bold ${indiceColor}`}>
                    {indiceFormatted}
                  </td>

                  {/* CONDUCCIÓN BRUSCA */}
                  <td className="px-4 py-3 text-center text-slate-300">
                    {op.conduccionBrusca}
                  </td>

                  {/* ATRIBUCIÓN */}
                  <td className="pr-4 pl-4 py-3 text-slate-400">
                    {op.atribucion}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <OperadorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOperador}
        maquinarias={maquinarias}
      />
    </div>
  );
}


