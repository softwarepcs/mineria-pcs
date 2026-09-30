
import React, { useState } from 'react';
import { X, ChevronDown, Download, AlertCircle } from 'lucide-react';
import { type CamionUnidad } from '@/data/camionesData';

export function CrearCamionModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (camion: CamionUnidad) => void;
}) {
  const [formNombre, setFormNombre] = useState("");
  const [formTipoUnidad, setFormTipoUnidad] = useState("Camión");
  const [formIdUnico, setFormIdUnico] = useState("");
  const [formMarca, setFormMarca] = useState("");
  const [formModelo, setFormModelo] = useState("");

  // Register New Unit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    const newId = formIdUnico.trim() || `TC-TRK-${String(Date.now()).slice(-4)}`;
    const newTruck: CamionUnidad = {
      id: newId,
      placa: formNombre.trim(),
      modelo: formModelo || "Iveco S-Way",
      tipoCarga: formTipoUnidad,
      estado: "en_marcha",
      estadoLabel: "En marcha",
      conductor: "Sin asignar",
      turno: "Turno mañana",
      velocidadKmH: 0,
      caudalLh: 0,
      ultimoDatoSec: 1,
      desvioPct: 0,
      consumoDiaL: 0,
      rendimientoL100km: 0,
      horometroH: 0,
      ralentiPct: 0,
      bateriaPct: 100,
      senalEstado: "OK",
      lat: -34.588 + (Math.random() - 0.5) * 0.04,
      lng: -58.41 + (Math.random() - 0.5) * 0.04,
      caudalHistorial: [
        { hora: "12:00", valor: 0 },
        { hora: "13:00", valor: 0 },
        { hora: "14:00", valor: 0 },
        { hora: "15:00", valor: 0 },
        { hora: "16:00", valor: 0 },
      ],
    };

    onSave(newTruck);
    onClose();
  };

  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0c121d] p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto sidebar-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Propiedades de la unidad
              </h3>
              <button
                type="button"
                onClick={() => onClose()}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              {/* Row 1: Nombre: * */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Nombre: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] transition"
                  placeholder="Nueva unidad"
                />
              </div>

              {/* Row 2: Tipo de unidad: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Tipo de unidad:
                </label>
                <div className="relative w-full sm:flex-1">
                  <select
                    value={formTipoUnidad}
                    onChange={(e) => setFormTipoUnidad(e.target.value)}
                    className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 pr-8 text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                  >
                    <option value="Camión">Camión</option>
                    <option value="Cisterna 6x4">Cisterna 6x4</option>
                    <option value="Tolva Minera">Tolva Minera</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="Maquinaria Pesada">Maquinaria Pesada</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Row 3: ID único: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  ID único (Identificador): <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formIdUnico}
                  onChange={(e) => setFormIdUnico(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                  placeholder="ID de unidad"
                />
              </div>

              {/* Row 4: Marca: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Marca:
                </label>
                <input
                  type="text"
                  value={formMarca}
                  onChange={(e) => setFormMarca(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] transition"
                  placeholder="Ej: Iveco"
                />
              </div>

              {/* Row 5: Modelo: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Modelo:
                </label>
                <input
                  type="text"
                  value={formModelo}
                  onChange={(e) => setFormModelo(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] transition"
                  placeholder="Ej: S-Way"
                />
              </div>

              {/* ─── FOOTER ACTIONS ─── */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/10 mt-4">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Propiedades exportadas en formato JSON / Wialon.")}
                    className="flex-1 sm:flex-initial rounded border border-white/15 bg-[#141d2d] hover:bg-[#1c283d] px-3 py-1.5 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>Exportar propiedades</span>
                  </button>
                  <div
                    title="Información y configuración avanzada de la unidad"
                    className="text-amber-400 hover:text-amber-300 cursor-help transition p-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 sm:flex-initial rounded border border-white/15 bg-transparent hover:bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial rounded bg-[#0df5c6] hover:bg-[#0bdba0] px-6 py-1.5 text-xs font-bold text-[#07131b] shadow-[0_0_12px_rgba(13,245,198,0.3)] transition text-center"
                  >
                    OK
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
  );
}