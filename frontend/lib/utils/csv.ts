/**
 * Minimal CSV download utility. No external deps.
 */
export function downloadCSV(
  headers: string[],
  rows: Record<string, string | number>[],
  filename: string
): void {
  const escape = (val: string | number) => {
    const str = String(val);
    if (/[,\r\n"]/.test(str)) return `"${str.replace(/"/g, "\"\"")}"`;
    return str;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
  ];

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
