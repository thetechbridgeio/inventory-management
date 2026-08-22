import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { loadImageAsBase64 } from "@/features/purchase-request-order/service/purchase-order/helpers/loadImage";
import { Product } from "../types/product.types";
import { getStockStatus } from "../components/data-table/get-stock-status";
import { STOCK_STATUS_LABELS } from "../constants/product-stock-status";

type GenerateProductsPdfParams = {
  companyName: string;
  companyLogo: string | null;
  products: Product[];
};

const LOGO_MAX_HEIGHT = 14; // mm — height is fixed, width scales to match
const LOGO_MAX_WIDTH = 42; // mm — safety cap so very wide logos don't run into the title
const PAGE_MARGIN_X = 14;

const PRIMARY_COLOR: [number, number, number] = [41, 128, 185];
const DARK_TEXT: [number, number, number] = [25, 25, 25];
const TEXT_MUTED: [number, number, number] = [120, 120, 120];
const BORDER_COLOR: [number, number, number] = [225, 225, 225];

/**
 * Draws the report header — accent bar, logo (scaled by height, natural
 * aspect ratio preserved), company name, "INVENTORY REPORT" label, and
 * generated-on date — then returns the y position content should start at.
 */
function drawHeader(
  doc: jsPDF,
  companyName: string,
  logo: { dataUrl: string; format: string } | null,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top accent bar
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 3, "F");

  const headerTop = 14;
  let logoWidth = 0;
  let logoHeight = 0;

  if (logo) {
    const { width: naturalWidth, height: naturalHeight } =
      doc.getImageProperties(logo.dataUrl);

    const aspectRatio = naturalWidth / naturalHeight;
    logoHeight = LOGO_MAX_HEIGHT;
    logoWidth = logoHeight * aspectRatio;

    if (logoWidth > LOGO_MAX_WIDTH) {
      logoWidth = LOGO_MAX_WIDTH;
      logoHeight = logoWidth / aspectRatio;
    }

    doc.addImage(
      logo.dataUrl,
      logo.format,
      PAGE_MARGIN_X,
      headerTop,
      logoWidth,
      logoHeight,
    );
  }

  // Company name — vertically centered against the logo's height
  const textX = logo ? PAGE_MARGIN_X + logoWidth + 6 : PAGE_MARGIN_X;
  const nameY = headerTop + Math.max(logoHeight, 8) / 2 + 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...DARK_TEXT);
  doc.text(companyName, textX, nameY);

  // "INVENTORY REPORT" label, right-aligned, with letter spacing feel
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("INVENTORY  REPORT", pageWidth - PAGE_MARGIN_X, headerTop + 5, {
    align: "right",
  });

  // Generated-on date, right-aligned beneath the label
  const generatedOn = `Generated on ${new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(generatedOn, pageWidth - PAGE_MARGIN_X, headerTop + 11, {
    align: "right",
  });

  // Divider beneath the whole header block
  const dividerY = headerTop + Math.max(logoHeight, 14) + 6;
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN_X, dividerY, pageWidth - PAGE_MARGIN_X, dividerY);

  return dividerY + 8;
}

export async function generateProductsPdf({
  companyName,
  companyLogo,
  products,
}: GenerateProductsPdfParams): Promise<Uint8Array> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const logo = await loadImageAsBase64(companyLogo);
  const y = drawHeader(doc, companyName, logo);

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Product",
        "Category",
        "Location",
        "Unit",
        "Current",
        "Min",
        "Max",
        "Status",
      ],
    ],

    body: products.map((product) => {
      const status = getStockStatus(
        product.currentStock,
        product.minOrderQty,
        product.maxOrderQty,
      );

      return [
        product.name,
        product.category,
        product.location ?? "-",
        product.unit,
        product.currentStock,
        product.minOrderQty,
        product.maxOrderQty,
        STOCK_STATUS_LABELS[status],
      ];
    }),

    theme: "striped",

    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      textColor: [40, 40, 40],
      lineColor: BORDER_COLOR,
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },

    alternateRowStyles: {
      fillColor: [247, 249, 251],
    },

    columnStyles: {
      0: { fontStyle: "bold" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "center" },
    },

    margin: { left: PAGE_MARGIN_X, right: PAGE_MARGIN_X },

    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageCount = doc.getNumberOfPages();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);

      doc.text(companyName, PAGE_MARGIN_X, pageHeight - 8);
    },
  });

  // jspdf-autotable augments the doc instance with this field at runtime.
  const tableEndY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY;

  const totalValue = products.reduce(
    (sum, product) => sum + product.currentStock * Number(product.unitCost ?? 0),
    0,
  );

  drawTotalValue(doc, totalValue, tableEndY);

  const pdf = doc.output("arraybuffer");
  return new Uint8Array(pdf);
}

/**
 * Draws a right-aligned "Total Inventory Value" line beneath the table,
 * starting a new page first if there isn't enough room left on this one.
 */
function drawTotalValue(doc: jsPDF, totalValue: number, tableEndY: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const boxWidth = 80;
  const boxHeight = 14;
  const boxLeft = pageWidth - PAGE_MARGIN_X - boxWidth;
  let boxTop = tableEndY + 8;

  if (boxTop + boxHeight > pageHeight - 16) {
    doc.addPage();
    boxTop = 20;
  }

  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.setFillColor(247, 249, 251);
  doc.roundedRect(boxLeft, boxTop, boxWidth, boxHeight, 1.5, 1.5, "FD");

  const textY = boxTop + boxHeight / 2 + 1.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK_TEXT);
  doc.text("Total Value", boxLeft + 5, textY);

  const formattedValue = `Rs. ${totalValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(formattedValue, boxLeft + boxWidth - 5, textY, { align: "right" });
}