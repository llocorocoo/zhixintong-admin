import * as XLSX from 'xlsx';

interface ExcelColumn {
  title: string;
  dataIndex: string;
  render?: (value: unknown, record: Record<string, unknown>) => string;
}

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExcelColumn[],
  filename: string,
) {
  const header = columns.map((c) => c.title);
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.dataIndex];
      if (col.render) return col.render(val, row);
      if (val == null) return '';
      return String(val);
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
