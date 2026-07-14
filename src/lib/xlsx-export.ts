import * as XLSX from "xlsx";

/**
 * Generate and download an Excel (.xlsx) file with the given data.
 */
export function exportToExcel(
  sheets: {
    name: string;
    headers: string[];
    rows: (string | number | boolean | null)[][];
  }[],
  filename: string
) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);
    // auto-size columns
    const colWidths = sheet.headers.map((h, i) => {
      const maxLen = Math.max(
        h.length,
        ...sheet.rows.map((r) => String(r[i] ?? "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 8), 40) };
    });
    ws["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
