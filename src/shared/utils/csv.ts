/** Descarga un CSV (con BOM para que Excel respete tildes). Cada celda va entrecomillada. */
export function descargarCsv(nombreArchivo: string, encabezados: string[], filas: (string | number | null | undefined)[][]) {
  // Excel evalúa como fórmula lo que empieza por = + - @ (o tab/retorno): se antepone una comilla para que sea texto.
  // Los números reales (incluidos negativos) no se tocan.
  const seguro = (v: string | number | null | undefined) => {
    if (typeof v === "number") return String(v);
    const t = String(v ?? "");
    return /^[=+\-@\t\r]/.test(t) && !/^-?\d+([.,]\d+)?$/.test(t) ? `'${t}` : t;
  };
  const celda = (v: string | number | null | undefined) => `"${seguro(v).replace(/"/g, '""')}"`;
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
