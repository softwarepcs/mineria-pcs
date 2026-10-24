import * as XLSX from "xlsx";

/**
 * Descarga una matriz de datos en un archivo Excel nativo (.xlsx).
 * Configura anchos de columna automáticos basados en el contenido.
 */
export function descargarExcel(
  nombreArchivo: string,
  encabezados: string[],
  filas: (string | number | boolean | null | undefined)[][],
  nombreHoja = "Datos"
) {
  const archivoFinal = nombreArchivo.endsWith(".xlsx") ? nombreArchivo : `${nombreArchivo.replace(/\.csv$/i, "")}.xlsx`;

  const datos = [encabezados, ...filas];
  const ws = XLSX.utils.aoa_to_sheet(datos);

  // Ajuste automático de anchos de columnas
  const colWidths = encabezados.map((enc, colIdx) => {
    let maxLen = enc.length;
    for (let r = 0; r < filas.length; r++) {
      const val = filas[r][colIdx];
      if (val !== null && val !== undefined) {
        const strVal = String(val);
        if (strVal.length > maxLen) {
          maxLen = Math.min(strVal.length, 45);
        }
      }
    }
    return { wch: Math.max(maxLen + 3, 12) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja.slice(0, 31));

  XLSX.writeFile(wb, archivoFinal);
}
