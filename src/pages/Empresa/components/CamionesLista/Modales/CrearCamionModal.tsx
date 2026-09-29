
import React, { useState } from 'react';
import { X, ChevronDown, Wrench, Download, AlertCircle } from 'lucide-react';
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
  const [formNombre, setFormNombre] = useState("Nueva unidad");
  const [formTipoUnidad, setFormTipoUnidad] = useState("Camión");
  const [formTipoDispositivo, setFormTipoDispositivo] = useState("Teltonika FMB920");
  const [formDireccionServidor, setFormDireccionServidor] = useState("srv.edgesmart.io:20100");
  const [formIdUnico, setFormIdUnico] = useState("");
  const [formTelefonoCod, setFormTelefonoCod] = useState("+54 9 11");
  const [formTelefonoNum, setFormTelefonoNum] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formCreador, setFormCreador] = useState("rigel_teste_mgr");
  const [formCuenta] = useState("rigel_teste_mgr");

  // Contadores
  const [formKmFuente, setFormKmFuente] = useState("GPS");
  const [formKmValor, setFormKmValor] = useState("0");
  const [formKmAuto, setFormKmAuto] = useState(true);

  const [formHorasFuente, setFormHorasFuente] = useState("Sensor de ignición del motor");
  const [formHorasValor, setFormHorasValor] = useState("0");
  const [formHorasAuto, setFormHorasAuto] = useState(true);

  const [formGprsValor, setFormGprsValor] = useState("0");
  const [formGprsAuto, setFormGprsAuto] = useState(true);

  // Register New Unit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    const newId = formIdUnico.trim() || `TC-TRK-${String(Date.now()).slice(-4)}`;
    const newTruck: CamionUnidad = {
      id: newId,
      placa: formNombre.trim(),
      modelo: formTipoUnidad || "Iveco S-Way",
      tipoCarga: formTipoUnidad.includes("Cisterna") ? "Cisterna 6x4" : "Carga General",
      estado: "en_marcha",
      estadoLabel: "En marcha",
      conductor: "Sin asignar",
      turno: "Turno mañana",
      velocidadKmH: 0,
      caudalLh: 0,
      ultimoDatoSec: 1,
      desvioPct: 0,
      consumoDiaL: 0,
      rendimientoL100km: 34.5,
      horometroH: Number(formHorasValor) || 0,
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

              {/* Row 3: Tipo de dispositivo: * + Wrench icon */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Tipo de dispositivo: <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2 w-full sm:flex-1">
                  <div className="relative flex-1">
                    <select
                      value={formTipoDispositivo}
                      onChange={(e) => setFormTipoDispositivo(e.target.value)}
                      className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 pr-8 text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                    >
                      <option value="Teltonika FMB920">Teltonika FMB920</option>
                      <option value="Teltonika FMB120">Teltonika FMB120</option>
                      <option value="Queclink GV300">Queclink GV300</option>
                      <option value="DFM 250D Flowmeter">DFM 250D Flowmeter</option>
                      <option value="Suntech ST310U">Suntech ST310U</option>
                      <option value="Ruptela PRO4">Ruptela PRO4</option>
                      <option value="CalAmp LMU-3030">CalAmp LMU-3030</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    title="Configurar dispositivo"
                    className="p-1.5 rounded border border-white/15 bg-[#162235] text-slate-400 hover:text-[#0df5c6] transition shrink-0"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 4: Dirección del servidor: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Dirección del servidor:
                </label>
                <input
                  type="text"
                  value={formDireccionServidor}
                  onChange={(e) => setFormDireccionServidor(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                  placeholder="srv.edgesmart.io:20100"
                />
              </div>

              {/* Row 5: ID único: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  ID único:
                </label>
                <input
                  type="text"
                  value={formIdUnico}
                  onChange={(e) => setFormIdUnico(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                  placeholder="IMEI / MAC / ID de unidad"
                />
              </div>

              {/* Row 6: Número de teléfono: (2 inputs) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Número de teléfono:
                </label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:flex-1">
                  <input
                    type="text"
                    value={formTelefonoCod}
                    onChange={(e) => setFormTelefonoCod(e.target.value)}
                    className="w-28 sm:w-32 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                    placeholder="+54 9 11"
                  />
                  <input
                    type="text"
                    value={formTelefonoNum}
                    onChange={(e) => setFormTelefonoNum(e.target.value)}
                    className="flex-1 min-w-[140px] rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>

              {/* Row 7: Contraseña: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Contraseña:
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                  placeholder="••••••••"
                />
              </div>

              {/* Row 8: Creador: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Creador:
                </label>
                <div className="relative w-full sm:flex-1">
                  <select
                    value={formCreador}
                    onChange={(e) => setFormCreador(e.target.value)}
                    className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 pr-8 text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                  >
                    <option value="rigel_teste_mgr">rigel_teste_mgr</option>
                    <option value="admin_general">admin_general</option>
                    <option value="supervisor_flota">supervisor_flota</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Row 9: Cuenta: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Cuenta:
                </label>
                <input
                  type="text"
                  value={formCuenta}
                  disabled
                  className="w-full sm:flex-1 rounded border border-white/5 bg-[#090e18] px-2.5 py-1.5 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              {/* ─── COUNTERS SECTION ─── */}
              <div className="border-t border-white/10 pt-3 space-y-3 mt-4">
                {/* Contador de kilometraje */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                    Contador de kilometraje:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1">
                    <div className="relative w-full sm:w-44">
                      <select
                        value={formKmFuente}
                        onChange={(e) => setFormKmFuente(e.target.value)}
                        className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2 py-1 pr-6 text-xs text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                      >
                        <option value="GPS">GPS</option>
                        <option value="Sensor de kilometraje">Sensor de kilometraje</option>
                        <option value="CAN Bus / FMS">CAN Bus / FMS</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1.5 h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">
                      Valor actual: <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="number"
                      value={formKmValor}
                      onChange={(e) => setFormKmValor(e.target.value)}
                      className="w-20 rounded border border-white/15 bg-[#121927] px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#0df5c6]"
                    />
                    <span className="text-slate-400 font-mono">km</span>
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer ml-1 sm:ml-3">
                      <input
                        type="checkbox"
                        checked={formKmAuto}
                        onChange={(e) => setFormKmAuto(e.target.checked)}
                        className="rounded accent-[#0df5c6] cursor-pointer"
                      />
                      Automático
                    </label>
                  </div>
                </div>

                {/* Contador de horas de motor */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                    Contador de horas de motor:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1">
                    <div className="relative w-full sm:w-44">
                      <select
                        value={formHorasFuente}
                        onChange={(e) => setFormHorasFuente(e.target.value)}
                        className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2 py-1 pr-6 text-xs text-white truncate outline-none focus:border-[#0df5c6] cursor-pointer"
                      >
                        <option value="Sensor de ignición del motor">Sensor de ignición del mot...</option>
                        <option value="Sensor de vibración">Sensor de vibración</option>
                        <option value="Horómetro CAN Bus">Horómetro CAN Bus</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1.5 h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">
                      Valor actual: <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="number"
                      value={formHorasValor}
                      onChange={(e) => setFormHorasValor(e.target.value)}
                      className="w-20 rounded border border-white/15 bg-[#121927] px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#0df5c6]"
                    />
                    <span className="text-slate-400 font-mono">h</span>
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer ml-1 sm:ml-3">
                      <input
                        type="checkbox"
                        checked={formHorasAuto}
                        onChange={(e) => setFormHorasAuto(e.target.checked)}
                        className="rounded accent-[#0df5c6] cursor-pointer"
                      />
                      Automático
                    </label>
                  </div>
                </div>

                {/* Contador del tráfico GPRS */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                    Contador del tráfico GPRS:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1">
                    <button
                      type="button"
                      onClick={() => setFormGprsValor("0")}
                      className="w-full sm:w-44 rounded border border-white/15 bg-[#162235] hover:bg-[#1d2d46] px-2 py-1 text-xs text-slate-200 transition font-medium text-center"
                    >
                      Reiniciar contador
                    </button>
                    <span className="text-slate-400">
                      Valor actual:
                    </span>
                    <input
                      type="number"
                      value={formGprsValor}
                      onChange={(e) => setFormGprsValor(e.target.value)}
                      className="w-20 rounded border border-white/15 bg-[#121927] px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#0df5c6]"
                    />
                    <span className="text-slate-400 font-mono">KB</span>
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer ml-1 sm:ml-3">
                      <input
                        type="checkbox"
                        checked={formGprsAuto}
                        onChange={(e) => setFormGprsAuto(e.target.checked)}
                        className="rounded accent-[#0df5c6] cursor-pointer"
                      />
                      Automático
                    </label>
                  </div>
                </div>
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