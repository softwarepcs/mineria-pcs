/** Escapa texto antes de insertarlo en HTML (popups y marcadores de Leaflet). */
export function escapeHtml(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Solo acepta colores #RRGGBB; cualquier otra cosa se reemplaza (evita inyectar CSS en style). */
export function colorSeguro(color: string | null | undefined, porDefecto = "#22d3ee"): string {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : porDefecto;
}
