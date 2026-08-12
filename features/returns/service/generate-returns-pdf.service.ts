import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

import { loadImageAsBase64 } from "@/features/purchase-request-order/service/purchase-order/helpers/loadImage";
import {
  SALE_RETURN_STATUS_LABEL,
  SaleReturnStatus,
} from "../constants/sale-return-status";
import { GetSaleReturnsParams } from "../types/return.type";

export type SaleReturnExportRow = {
  id: string;
  returnNumber: string;
  returnDate: string;
  status: SaleReturnStatus;
  totalItems: number;
  totalReturnedQty: number;
  createdAt: Date;
  saleId: string;
  saleNumber: string;
  soldTo: string | null;
};

type GenerateReturnsPdfParams = {
  companyName: string;
  companyLogo: string | null;
  returns: SaleReturnExportRow[];
  filters?: GetSaleReturnsParams;
};

const LOGO_MAX_HEIGHT = 14; // mm — height is fixed, width scales to match
const LOGO_MAX_WIDTH = 42; // mm — safety cap so very wide logos don't run into the title
const PAGE_MARGIN_X = 14;

const PRIMARY_COLOR: [number, number, number] = [41, 128, 185];
const DARK_TEXT: [number, number, number] = [25, 25, 25];
const TEXT_MUTED: [number, number, number] = [120, 120, 120];
const BORDER_COLOR: [number, number, number] = [225, 225, 225];
const PANEL_BG: [number, number, number] = [244, 248, 251];

/**
 * Draws the report header — accent bar, logo (scaled by height, natural
 * aspect ratio preserved), company name, "SALES RETURN REPORT" label, and
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

  // "SALES RETURN REPORT" label, right-aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("SALES RETURN  REPORT", pageWidth - PAGE_MARGIN_X, headerTop + 5, {
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

/**
 * Draws a panel summarizing which filters produced this report (so the
 * recipient knows exactly what data set they're looking at) alongside
 * quick totals for the matched rows.
 */
function drawFilterSummary(
  doc: jsPDF,
  startY: number,
  filters: GetSaleReturnsParams | undefined,
  totals: { count: number; totalItems: number; totalQty: number },
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const panelHeight = 16;

  const filterParts: string[] = [];

  if (filters?.status) {
    filterParts.push(`Status: ${SALE_RETURN_STATUS_LABEL[filters.status]}`);
  }

  if (filters?.startDate || filters?.endDate) {
    const from = filters?.startDate
      ? format(new Date(filters.startDate), "dd MMM yyyy")
      : "Beginning";
    const to = filters?.endDate
      ? format(new Date(filters.endDate), "dd MMM yyyy")
      : "Today";
    filterParts.push(`Period: ${from} - ${to}`);
  }

  if (filters?.search?.trim()) {
    filterParts.push(`Search: "${filters.search.trim()}"`);
  }

  const filterLabel =
    filterParts.length > 0
      ? filterParts.join("   |   ")
      : "All Returns - No Filters Applied";

  doc.setFillColor(...PANEL_BG);
  doc.roundedRect(
    PAGE_MARGIN_X,
    startY,
    pageWidth - PAGE_MARGIN_X * 2,
    panelHeight,
    1.5,
    1.5,
    "F",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("APPLIED FILTERS", PAGE_MARGIN_X + 4, startY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK_TEXT);
  doc.text(filterLabel, PAGE_MARGIN_X + 4, startY + 12);

  const statsText = `${totals.count} Return${totals.count === 1 ? "" : "s"}   |   ${totals.totalItems} Items   |   ${totals.totalQty} Units Returned`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(statsText, pageWidth - PAGE_MARGIN_X - 4, startY + 9.5, {
    align: "right",
  });

  return startY + panelHeight + 8;
}

export async function generateReturnsPdf({
  companyName,
  companyLogo,
  returns,
  filters,
}: GenerateReturnsPdfParams): Promise<Uint8Array> {
  const doc = new jsPDF();

  const logo = await loadImageAsBase64(companyLogo);
  let y = drawHeader(doc, companyName, logo);

  const totals = returns.reduce(
    (acc, r) => ({
      count: acc.count + 1,
      totalItems: acc.totalItems + r.totalItems,
      totalQty: acc.totalQty + r.totalReturnedQty,
    }),
    { count: 0, totalItems: 0, totalQty: 0 },
  );

  y = drawFilterSummary(doc, y, filters, totals);

  if (returns.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("No returns match the selected filters.", PAGE_MARGIN_X, y + 6);

    return new Uint8Array(doc.output("arraybuffer"));
  }

  autoTable(doc, {
    startY: y,
    head: [
      ["Return #", "Sale #", "Sold To", "Return Date", "Items", "Qty", "Status"],
    ],

    body: returns.map((saleReturn) => [
      saleReturn.returnNumber,
      saleReturn.saleNumber,
      saleReturn.soldTo ?? "-",
      format(new Date(saleReturn.returnDate), "dd MMM yyyy"),
      saleReturn.totalItems,
      saleReturn.totalReturnedQty,
      SALE_RETURN_STATUS_LABEL[saleReturn.status],
    ]),

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
      6: { halign: "center" },
    },

    margin: { left: PAGE_MARGIN_X, right: PAGE_MARGIN_X },

    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);

      doc.text(companyName, PAGE_MARGIN_X, pageHeight - 8);
    },
  });

  const pdf = doc.output("arraybuffer");
  return new Uint8Array(pdf);
}
