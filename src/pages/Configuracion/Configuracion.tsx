import { useEffect, useState } from "react";
import { listarEmpresas } from "../../services/empresaService";
import type { Empresa } from "../../types";
import { useAuth } from "../../hooks/useAuth";

const API_URL = 'http://localhost:3000';

export function Configuracion() {
  const { sesion } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    objetivoFlotaL100km: 40.0,
    precioUsdPorLitro: 1.10,
    emisionesCo2Factor: 2.68
  });
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    listarEmpresas().then((data) => {
      setEmpresas(data);
      if (data.length > 0) {
        setSelectedEmpresaId(data[0].id);
      }
      setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (selectedEmpresaId) {
      cargarConfiguracion(selectedEmpresaId);
    }
  }, [selectedEmpresaId]);

  const cargarConfiguracion = async (id: number) => {
    try {
      const token = sesion?.usuario ? localStorage.getItem('token') : null; // Asumimos que manejan token o nada por ahora (mock)
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/maestros/empresas/${id}/configuracion`, { headers });
      if (res.ok) {
        const data = await res.json();
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
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresaId) return;
    setGuardando(true);
    setMensaje("");

    try {
      const token = sesion?.usuario ? localStorage.getItem('token') : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/maestros/empresas/${selectedEmpresaId}/configuracion`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMensaje("Configuración actualizada con éxito.");
      } else {
        setMensaje("Error al actualizar la configuración.");
      }
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
        Cargando empresas...
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Seleccionar Empresa</label>
          <select
            className="w-full sm:w-1/2 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedEmpresaId || ""}
            onChange={(e) => setSelectedEmpresaId(Number(e.target.value))}
          >
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
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
