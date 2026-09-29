import { useEffect, useState } from "react";
import { apiClient } from "@/utils/apiClient";

export function Configuracion() {
  const [maquinarias, setMaquinarias] = useState<any[]>([]);
  const [selectedMaquinariaId, setSelectedMaquinariaId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    objetivoFlotaL100km: 40.0,
    precioUsdPorLitro: 1.10,
    emisionesCo2Factor: 2.68
  });
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    apiClient.get('/maquinarias').then((res) => {
      setMaquinarias(res.data);
      if (res.data.length > 0) {
        setSelectedMaquinariaId(res.data[0].id);
      }
      setCargando(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedMaquinariaId) {
      cargarConfiguracion(selectedMaquinariaId);
    }
  }, [selectedMaquinariaId]);

  const cargarConfiguracion = async (id: number) => {
    try {
      const res = await apiClient.get(`/maquinarias/${id}/configuracion`);
      if (res.data) {
        const data = res.data;
        if (data) {
          setFormData({
            objetivoFlotaL100km: data.objetivoFlotaL100km || 40.0,
            precioUsdPorLitro: data.precioUsdPorLitro || 1.10,
            emisionesCo2Factor: data.emisionesCo2Factor || 2.68
          });
        } else {
          // Valores por defecto
          setFormData({ objetivoFlotaL100km: 40.0, precioUsdPorLitro: 1.10, emisionesCo2Factor: 2.68 });
        }
      }
    } catch (e) {
      console.error("Error cargando configuración", e);
      setFormData({ objetivoFlotaL100km: 40.0, precioUsdPorLitro: 1.10, emisionesCo2Factor: 2.68 });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaquinariaId) return;
    setGuardando(true);
    setMensaje("");

    try {
      await apiClient.patch(`/maquinarias/${selectedMaquinariaId}/configuracion`, formData);

      setMensaje("Configuración actualizada con éxito.");
    } catch (err) {
      setMensaje("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        Cargando maquinarias...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Métricas y Metas</h1>
        <p className="mt-1 text-sm text-slate-400">
          Administración centralizada de parámetros de cálculo para los Dashboards de Flota.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Seleccionar Maquinaria</label>
          <select
            className="w-full sm:w-1/2 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedMaquinariaId || ""}
            onChange={(e) => setSelectedMaquinariaId(Number(e.target.value))}
          >
            {maquinarias.map(maq => (
              <option key={maq.id} value={maq.id}>{maq.identificador} {maq.placa ? `(${maq.placa})` : ''}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSave} className="space-y-6 border-t border-slate-700/50 pt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Objetivo Flota (L/100km)
              </label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.objetivoFlotaL100km}
                onChange={(e) => setFormData({ ...formData, objetivoFlotaL100km: parseFloat(e.target.value) })}
              />
              <p className="mt-1 text-xs text-slate-500">Define el punto de quiebre entre alertas rojas y verdes.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Precio Diésel (USD por Litro)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.precioUsdPorLitro}
                onChange={(e) => setFormData({ ...formData, precioUsdPorLitro: parseFloat(e.target.value) })}
              />
              <p className="mt-1 text-xs text-slate-500">Utilizado para calcular las pérdidas financieras por ralentí y excesos.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Factor Emisiones CO2 (L/Ton)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.emisionesCo2Factor}
                onChange={(e) => setFormData({ ...formData, emisionesCo2Factor: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </button>
            {mensaje && (
              <span className={`text-sm ${mensaje.includes("éxito") ? "text-green-400" : "text-red-400"}`}>
                {mensaje}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
