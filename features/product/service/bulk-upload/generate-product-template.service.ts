import "server-only";

import ExcelJS from "exceljs";

import {
  PRODUCT_IMPORT_FIELDS,
  ProductImportNumberField,
} from "./product-import-fields";
import {
  getInvalidNumberMessage,
  PRODUCT_ROW_STATIC_MESSAGES,
  ProductRowValidationError,
} from "./product-validation-error";

function isNumberField(
  field: (typeof PRODUCT_IMPORT_FIELDS)[number],
): field is ProductImportNumberField {
  return field.type === "number";
}

export async function generateProductTemplate() {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "InventoryEdge";
  workbook.created = new Date();

  createProductImportSheet(workbook);
  createInstructionsSheet(workbook);

  return workbook.xlsx.writeBuffer();
}

function createProductImportSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Product Import");

  sheet.columns = PRODUCT_IMPORT_FIELDS.map((field) => ({
    header: field.header,
    key: field.key,
    width: field.width,
  }));

  styleHeader(sheet);

  sheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];
}

function createInstructionsSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Instructions");

  sheet.columns = [{ width: 120 }];

  const requiredColumnRows = PRODUCT_IMPORT_FIELDS.filter(
    (field) => field.required,
  ).map((field) => [`• ${field.header}`]);

  const optionalColumnRows = PRODUCT_IMPORT_FIELDS.filter(
    (field) => !field.required,
  ).map((field) => [`• ${field.header}`]);

  const numericRuleRows = PRODUCT_IMPORT_FIELDS.filter(isNumberField).map(
    (field) => [`• ${getInvalidNumberMessage(field)}`],
  );

  sheet.addRows([
    ["Product Import Instructions"],
    [],
    ["Required Columns"],
    ...requiredColumnRows,
    [],
    ["Optional Columns"],
    ...optionalColumnRows,
    [],
    ["Rules"],
    ["• Do not rename or remove column headers."],
    ...numericRuleRows,
    [
      `• ${PRODUCT_ROW_STATIC_MESSAGES[ProductRowValidationError.MAX_LESS_THAN_MIN]}`,
    ],
  ]);

  sheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  sheet.getRow(1).font = {
    bold: true,
  };
}
