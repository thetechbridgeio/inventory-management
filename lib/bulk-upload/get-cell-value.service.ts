import ExcelJS from "exceljs";

export function getCellValue(cell: ExcelJS.Cell): string {
  const value = cell.value;

  if (value == null) {
    return "";
  }

  if (typeof value === "object") {
    if ("text" in value) {
      return value.text.trim();
    }

    if ("result" in value) {
      return String(value.result ?? "").trim();
    }
  }

  return String(value).trim();
}

export function getOptionalCellValue(
  cell: ExcelJS.Cell,
): string | undefined {
  const value = getCellValue(cell);

  return value === "" ? undefined : value;
}