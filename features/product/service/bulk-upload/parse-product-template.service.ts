import { getOptionalCellValue } from "@/lib/bulk-upload/get-cell-value.service";
import { parseExcelSheet } from "@/lib/bulk-upload/parse-template.service";

import { ParsedProductRow } from "../../types/parsed-product-row";
import { PRODUCT_IMPORT_FIELDS } from "./product-import-fields";

const requiredHeaders = PRODUCT_IMPORT_FIELDS.filter(
  (field) => field.required,
).map((field) => field.header);

export async function parseProductTemplate(file: File) {
  return parseExcelSheet<ParsedProductRow>({
    file,
    sheetName: "Product Import",
    requiredHeaders,
    mapRow: (row, rowNumber, headers) => {
      const parsed: Record<string, unknown> = { rowNumber };

      for (const field of PRODUCT_IMPORT_FIELDS) {
        const colNumber = headers[field.header];
        const cell = colNumber ? row.getCell(colNumber) : undefined;
        const raw = cell ? getOptionalCellValue(cell) : undefined;

        if (field.type === "number") {
          parsed[field.key] = raw === undefined ? undefined : Number(raw);
        } else {
          parsed[field.key] = field.required ? (raw ?? "") : raw;
        }
      }

      return parsed as unknown as ParsedProductRow;
    },
  });
}
