// ============================================================
// Firstframe V2 — CSV Export Utility
// ============================================================

/**
 * Export an array of objects to a CSV file download.
 * @param rows Array of objects where keys become column headers
 * @param filename Filename without extension
 */
export function exportToCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          // Escape commas and quotes
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
