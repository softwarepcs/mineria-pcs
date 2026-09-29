import { X, Camera, Building, LandPlot, MapPin, Flag, Shield, Warehouse, Radio, Target, Construction, Fuel } from "lucide-react";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export const AVAILABLE_ICONS = [
  { id: "pin", label: "Punto de Interés", icon: MapPin },
  { id: "camera", label: "Cámara", icon: Camera },
  { id: "stadium", label: "Estadio / Predio", icon: LandPlot },
  { id: "building", label: "Edificio / Expo", icon: Building },
  { id: "warehouse", label: "Almacén / Depósito", icon: Warehouse },
  { id: "flag", label: "Hito / Bandera", icon: Flag },
  { id: "shield", label: "Zona de Seguridad", icon: Shield },
  { id: "radar", label: "Sensor / Radar", icon: Radio },
  { id: "target", label: "Objetivo", icon: Target },
  { id: "construction", label: "Obra / Mina", icon: Construction },
  { id: "fuel", label: "Combustible", icon: Fuel },
];

export function IconPickerModal({
  isOpen,
  onClose,
  selectedIcon,
  onSelectIcon,
}: IconPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d1117] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <h3 className="text-base font-semibold text-white tracking-wide">
            Biblioteca de Iconos
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Selecciona un icono representativo para visualizar en la lista y mapa de geocercas:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 max-h-64 overflow-y-auto pr-1">
          {AVAILABLE_ICONS.map((item) => {
            const IconComp = item.icon;
            const isSelected = selectedIcon === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectIcon(item.id);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all text-center ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                <IconComp className="h-6 w-6" />
                <span className="text-[11px] font-medium truncate w-full">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-medium text-slate-300 bg-white/10 hover:bg-white/15 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
