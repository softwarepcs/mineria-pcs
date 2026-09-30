/** Descarga un CSV (con BOM para que Excel respete tildes). Cada celda va entrecomillada. */
export function descargarCsv(nombreArchivo: string, encabezados: string[], filas: (string | number | null | undefined)[][]) {
  const celda = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const contenido = [encabezados, ...filas].map((f) => f.map(celda).join(",")).join("\r\n");
  const blob = new Blob(["﻿", contenido], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
