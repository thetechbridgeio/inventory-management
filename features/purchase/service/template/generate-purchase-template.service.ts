import "server-only";

import ExcelJS from "exceljs";

type GeneratePurchaseTemplateParams = {
  suppliers: {
    id: string;
    companyName: string;
  }[];

  products: {
    id: string;
    name: string;
    unit: string;
    category: string;
  }[];
};

export async function generatePurchaseTemplate({
  suppliers,
  products,
}: GeneratePurchaseTemplateParams) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "InventoryEdge";
  workbook.created = new Date();

  createPurchaseImportSheet(workbook);
  createSuppliersSheet(workbook, suppliers);
  createProductsSheet(workbook, products);
  createInstructionsSheet(workbook);

  return workbook.xlsx.writeBuffer();
}

function createPurchaseImportSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Purchase Import");

  sheet.columns = [
    { header: "Supplier", key: "supplier", width: 35 },
    { header: "Purchase Date", key: "purchaseDate", width: 18 },
    { header: "Product", key: "product", width: 35 },
    { header: "Quantity", key: "quantity", width: 15 },
    { header: "Purchase Price", key: "purchasePrice", width: 18 },
    { header: "Invoice Number", key: "invoiceNumber", width: 22 },
    { header: "Challan Number", key: "challanNumber", width: 22 },
    { header: "Remarks", key: "remarks", width: 40 },
  ];

  styleHeader(sheet);

  sheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];
}

function createSuppliersSheet(
  workbook: ExcelJS.Workbook,
  suppliers: GeneratePurchaseTemplateParams["suppliers"],
) {
  const sheet = workbook.addWorksheet("Suppliers");

  sheet.columns = [
    {
      header: "Supplier Name",
      key: "companyName",
      width: 40,
    },
  ];

  styleHeader(sheet);

  suppliers.forEach((supplier) => {
    sheet.addRow({
      companyName: supplier.companyName,
    });
  });
}

function createProductsSheet(
  workbook: ExcelJS.Workbook,
  products: GeneratePurchaseTemplateParams["products"],
) {
  const sheet = workbook.addWorksheet("Products");

  sheet.columns = [
    {
      header: "Product Name",
      key: "name",
      width: 40,
    },
    {
      header: "Category",
      key: "category",
      width: 20,
    },
    {
      header: "Unit",
      key: "unit",
      width: 15,
    },
  ];

  styleHeader(sheet);

  products.forEach((product) => {
    sheet.addRow({
      name: product.name,
      category: product.category,
      unit: product.unit,
    });
  });
}

function createInstructionsSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Instructions");

  sheet.columns = [{ width: 120 }];

  sheet.addRows([
    ["Purchase Import Instructions"],
    [],
    ["Required Columns"],
    ["• Supplier"],
    ["• Purchase Date"],
    ["• Product"],
    ["• Quantity"],
    ["• Purchase Price"],
    [],
    ["Optional Columns"],
    ["• Invoice Number"],
    ["• Challan Number"],
    ["• Remarks"],
    [],
    ["Rules"],
    ["• Do not rename or remove column headers."],
    ["• Purchase Date format: DD/MM/YYYY"],
    ["• Supplier must exist in the Suppliers sheet."],
    ["• Product must exist in the Products sheet."],
    ["• Quantity must be greater than 0."],
    ["• Purchase Price must be greater than or equal to 0."],
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