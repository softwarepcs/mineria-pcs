import { useMemo, useState } from "react";
import { areaCirculoM2, areaPoligonoM2, perimetroCirculoM, perimetroPoligonoM, type LatLng } from "@/shared/utils/geometria";
import { isoAInputLocal } from "@/shared/utils/formato";
import type { Geocerca, GeocercaValores } from "./api";

export const VALORES_VACIOS: GeocercaValores = {
  nombre: "",
  descripcion: "",
  sedeId: null,
  tipo: "CIRCULO",
  color: "#00c4cc",
  centro: null,
  radio: 500,
  puntos: [],
  fechaInicio: null,
  fechaExpiracion: null,
};

/** Estado y validación del formulario de geocerca, separados de la vista. */
export function useGeocercaForm(sedePorDefecto: number | null) {
  const [editando, setEditando] = useState<Geocerca | null>(null);
  const [valores, setValores] = useState<GeocercaValores>({ ...VALORES_VACIOS, sedeId: sedePorDefecto });

  const cambiar = <K extends keyof GeocercaValores>(campo: K, valor: GeocercaValores[K]) => setValores((v) => ({ ...v, [campo]: valor }));

  /** Clic en el mapa: centro del círculo o nuevo vértice del polígono. */
  const clicMapa = (p: LatLng) =>
    setValores((v) => (v.tipo === "CIRCULO" ? { ...v, centro: p } : { ...v, puntos: [...v.puntos, p] }));

  const nueva = () => {
    setEditando(null);
    setValores({ ...VALORES_VACIOS, sedeId: sedePorDefecto });
  };

  const editar = (g: Geocerca) => {
    setEditando(g);
    setValores({
      nombre: g.nombre,
      descripcion: g.descripcion,
      sedeId: g.sedeId,
      tipo: g.tipo,
      color: g.color,
      centro: g.centro,
      radio: g.radio,
      puntos: g.puntos,
      fechaInicio: isoAInputLocal(g.fechaInicio) || null,
      fechaExpiracion: isoAInputLocal(g.fechaExpiracion) || null,
    });
  };

  const medidas = useMemo(() => {
    if (valores.tipo === "CIRCULO") {
      const r = valores.radio ?? 0;
      return { areaHa: areaCirculoM2(r) / 10_000, perimetroM: perimetroCirculoM(r) };
    }
    return { areaHa: areaPoligonoM2(valores.puntos) / 10_000, perimetroM: perimetroPoligonoM(valores.puntos) };
  }, [valores.tipo, valores.radio, valores.puntos]);

  const error = useMemo(() => {
    if (!valores.nombre.trim()) return "Falta el nombre.";
    if (!valores.sedeId) return "Elige la sede.";
    if (valores.tipo === "CIRCULO" && !valores.centro) return "Haz clic en el mapa para ubicar el centro.";
    if (valores.tipo === "CIRCULO" && !(valores.radio && valores.radio > 0)) return "El radio debe ser mayor que 0.";
    if (valores.tipo === "POLIGONO" && valores.puntos.length < 3) return `Marca al menos 3 vértices en el mapa (llevas ${valores.puntos.length}).`;
    if (valores.fechaInicio && valores.fechaExpiracion && valores.fechaInicio > valores.fechaExpiracion) return "La vigencia termina antes de empezar.";
    return null;
  }, [valores]);

  return { editando, valores, cambiar, clicMapa, nueva, editar, medidas, error };
}
