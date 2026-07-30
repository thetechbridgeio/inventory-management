import "server-only";

import ExcelJS from "exceljs";

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

  sheet.columns = [
    { header: "Product Name", key: "name", width: 35 },
    { header: "Description", key: "description", width: 40 },
    { header: "Category", key: "category", width: 20 },
    { header: "Unit", key: "unit", width: 15 },
    { header: "Min Order Qty", key: "minOrderQty", width: 16 },
    { header: "Max Order Qty", key: "maxOrderQty", width: 16 },
    { header: "Reorder Qty", key: "reorderQty", width: 16 },
    { header: "Opening Stock", key: "openingStock", width: 16 },
    { header: "Location", key: "location", width: 25 },
  ];

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

  sheet.addRows([
    ["Product Import Instructions"],
    [],
    ["Required Columns"],
    ["• Product Name"],
    ["• Category"],
    ["• Unit"],
    ["• Min Order Qty"],
    ["• Max Order Qty"],
    ["• Reorder Qty"],
    ["• Opening Stock"],
    [],
    ["Optional Columns"],
    ["• Description"],
    ["• Location"],
    [],
    ["Rules"],
    ["• Do not rename or remove column headers."],
    ["• Min/Max/Reorder Qty and Opening Stock must be whole numbers greater than or equal to 0."],
    ["• Max Order Qty cannot be less than Min Order Qty."],
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
