import "server-only";

import ExcelJS from "exceljs";

type ParseExcelSheetOptions<T> = {
  file: File;
  sheetName: string;
  requiredHeaders?: string[];
  mapRow: (
    row: ExcelJS.Row,
    rowNumber: number,
    headers: Record<string, number>,
  ) => T | null;
};

export async function parseExcelSheet<T>({
  file,
  sheetName,
  requiredHeaders,
  mapRow,
}: ParseExcelSheetOptions<T>): Promise<T[]> {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(await file.arrayBuffer());

  const worksheet = workbook.getWorksheet(sheetName);

  if (!worksheet) {
    throw new Error(
      `Worksheet "${sheetName}" not found. Please use the correct template.`,
    );
  }

  const headerRow = worksheet.getRow(1);

  const headers = getHeaderMap(headerRow);

  for (const header of requiredHeaders ?? []) {
    if (!(header in headers)) {
      throw new Error(
        `Missing required column "${header}". Please use the latest template.`,
      );
    }
  }

  const rows: T[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    if (row.actualCellCount === 0) return;

    const parsed = mapRow(row, rowNumber, headers);

    if (parsed) {
      rows.push(parsed);
    }
  });

  return rows;
}

function getHeaderMap(row: ExcelJS.Row): Record<string, number> {
  const headers: Record<string, number> = {};

  row.eachCell((cell, colNumber) => {
    const value = String(cell.text).trim();

    if (!value) return;

    if (headers[value]) {
      throw new Error(`Duplicate header "${value}" found.`);
    }

    headers[value] = colNumber;
  });

  return headers;
}
