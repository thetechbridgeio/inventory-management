import {
  getCellValue,
  getOptionalCellValue,
} from "@/lib/bulk-upload/get-cell-value.service";
import { parseExcelSheet } from "@/lib/bulk-upload/parse-template.service";

import { ParsedProductRow } from "../../types/parsed-product-row";

const requiredHeaders = [
  "Product Name",
  "Category",
  "Unit",
  "Min Order Qty",
  "Max Order Qty",
  "Reorder Qty",
  "Opening Stock",
];

export async function parseProductTemplate(file: File) {
  return parseExcelSheet<ParsedProductRow>({
    file,
    sheetName: "Product Import",
    requiredHeaders,
    mapRow: (row, rowNumber, headers) => ({
      rowNumber,
      name: getCellValue(row.getCell(headers["Product Name"])),
      description: getOptionalCellValue(
        row.getCell(headers["Description"]),
      ),
      category: getCellValue(row.getCell(headers["Category"])),
      unit: getCellValue(row.getCell(headers["Unit"])),
      minOrderQty: Number(
        getCellValue(row.getCell(headers["Min Order Qty"])),
      ),
      maxOrderQty: Number(
        getCellValue(row.getCell(headers["Max Order Qty"])),
      ),
      reorderQty: Number(getCellValue(row.getCell(headers["Reorder Qty"]))),
      openingStock: Number(
        getCellValue(row.getCell(headers["Opening Stock"])),
      ),
      location: getOptionalCellValue(row.getCell(headers["Location"])),
    }),
  });
}
