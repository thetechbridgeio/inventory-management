import { jsPDF } from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";

import { loadImageAsBase64 } from "@/features/purchase-request-order/service/purchase-order/helpers/loadImage";
import { STOCK_STATUS_LABELS, STOCK_STATUSES } from "../../constants/product-stock-status";
import { MonthlyReportData, MonthlyReportRow } from "../../types/monthly-report.type";

type GenerateMonthlyReportPdfParams = {
  companyName: string;
  companyLogo: string | null;
  report: MonthlyReportData;
};

const PAGE_MARGIN = 14;
const HEADER_HEIGHT = 26;
const MIN_SECTION_SPACE = 40;

const COLORS = {
  text: [24, 24, 27] as [number, number, number],
  muted: [113, 113, 122] as [number, number, number],
  border: [228, 228, 231] as [number, number, number],
  panel: [250, 250, 250] as [number, number, number],
  accent: [37, 99, 235] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  headerBar: [24, 24, 27] as [number, number, number],
};

const STATUS_COLORS: Record<string, [number, number, number]> = {
  [STOCK_STATUSES.OUT_OF_STOCK]: COLORS.danger,
  [STOCK_STATUSES.LOW]: COLORS.warning,
  [STOCK_STATUSES.EXCESS]: COLORS.accent,
  [STOCK_STATUSES.SUFFICIENT]: COLORS.success,
};

const currency = (value: number) =>
  `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export async function generateMonthlyReportPdf({
  companyName,
  companyLogo,
  report,
}: GenerateMonthlyReportPdfParams): Promise<Uint8Array> {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const logo = await loadImageAsBase64(companyLogo);
  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let y = drawHeader(doc, companyName, report.monthLabel, logo, pageWidth);
  y = drawSummary(doc, report.totals, y, pageWidth);

  y = drawSection(doc, {
    title: "Needs Attention",
    subtitle: "Products that are low or out of stock",
    rows: report.sections.needsAttention,
    startY: y,
    pageWidth,
    head: [
      "Product",
      "Category",
      "Min Level",
      "Current Stock",
      "Status",
      "Pending PO Qty",
      "Pending Indent Qty",
    ],
    body: (row) => [
      row.name,
      row.category,
      row.minOrderQty,
      row.currentStock,
      STOCK_STATUS_LABELS[row.status],
      row.pendingPoQty,
      row.pendingIndentQty,
    ],
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "center" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    statusColumnIndex: 4,
  });

  y = drawSection(doc, {
    title: "Top Movers This Month",
    subtitle: `Highest selling products by quantity (top ${report.sections.topMovers.length})`,
    rows: report.sections.topMovers,
    startY: y,
    pageWidth,
    head: ["Product", "Category", "Sold Qty", "Sold Value", "Current Stock", "Min Level"],
    body: (row) => [
      row.name,
      row.category,
      row.soldQty,
      currency(row.soldValue),
      row.currentStock,
      row.minOrderQty,
    ],
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
  });

  y = drawSection(doc, {
    title: "Pending Purchase Orders",
    subtitle: "Products with an outstanding ordered quantity",
    rows: report.sections.pendingPurchaseOrders,
    startY: y,
    pageWidth,
    head: ["Product", "Category", "Pending PO Qty", "Current Stock", "Min Level"],
    body: (row) => [
      row.name,
      row.category,
      row.pendingPoQty,
      row.currentStock,
      row.minOrderQty,
    ],
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  drawSection(doc, {
    title: "Pending Indents",
    subtitle: "Products awaiting purchase request approval",
    rows: report.sections.pendingIndents,
    startY: y,
    pageWidth,
    head: ["Product", "Category", "Pending Indent Qty", "Current Stock", "Min Level"],
    body: (row) => [
      row.name,
      row.category,
      row.pendingIndentQty,
      row.currentStock,
      row.minOrderQty,
    ],
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  drawFooterOnAllPages(doc, companyName, generatedOn, pageWidth);

  return new Uint8Array(doc.output("arraybuffer"));
}

function drawHeader(
  doc: jsPDF,
  companyName: string,
  monthLabel: string,
  logo: { dataUrl: string; format: string } | null,
  pageWidth: number,
): number {
  doc.setFillColor(...COLORS.headerBar);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

  let textX = PAGE_MARGIN;

  if (logo) {
    const logoHeight = 15;
    const { width, height } = doc.getImageProperties(logo.dataUrl);
    const logoWidth = (width / height) * logoHeight;

    doc.addImage(
      logo.dataUrl,
      logo.format,
      PAGE_MARGIN,
      HEADER_HEIGHT / 2 - logoHeight / 2,
      logoWidth,
      logoHeight,
    );

    textX = PAGE_MARGIN + logoWidth + 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(companyName, textX, HEADER_HEIGHT / 2 + 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 216);
  doc.text("Monthly Inventory Report", textX, HEADER_HEIGHT / 2 + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(monthLabel, pageWidth - PAGE_MARGIN, HEADER_HEIGHT / 2 + 1, {
    align: "right",
  });

  doc.setTextColor(...COLORS.text);
  return HEADER_HEIGHT + 12;
}

function drawSummary(
  doc: jsPDF,
  totals: MonthlyReportData["totals"],
  startY: number,
  pageWidth: number,
): number {
  const cards = [
    { label: "Products", value: totals.productCount.toLocaleString("en-IN") },
    { label: "Units Sold", value: totals.soldQty.toLocaleString("en-IN") },
    { label: "Sales Value", value: currency(totals.soldValue) },
    {
      label: "Pending PO Qty",
      value: totals.pendingPoQty.toLocaleString("en-IN"),
    },
    {
      label: "Pending Indent Qty",
      value: totals.pendingIndentQty.toLocaleString("en-IN"),
    },
    {
      label: "Low Stock Products",
      value: totals.lowStockCount.toLocaleString("en-IN"),
      color: totals.lowStockCount > 0 ? COLORS.danger : COLORS.success,
    },
  ];

  const cardY = startY;
  const cardHeight = 20;
  const gap = 5;
  const cardWidth =
    (pageWidth - PAGE_MARGIN * 2 - gap * (cards.length - 1)) / cards.length;

  cards.forEach((card, index) => {
    const x = PAGE_MARGIN + index * (cardWidth + gap);
    const color = card.color ?? COLORS.accent;

    doc.setFillColor(...COLORS.panel);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setDrawColor(...color);
    doc.setLineWidth(1.2);
    doc.line(x, cardY + 2, x, cardY + cardHeight - 2);
    doc.setLineWidth(0.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(...color);
    doc.text(String(card.value), x + 5, cardY + 10.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(card.label, x + 5, cardY + 16);
  });

  let nextY = cardY + cardHeight + 8;

  if (totals.omittedCount > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `${totals.omittedCount.toLocaleString("en-IN")} product(s) with no sales, no pending orders/indents, and sufficient stock are not listed below.`,
      PAGE_MARGIN,
      nextY,
    );
    nextY += 8;
  }

  doc.setTextColor(...COLORS.text);
  return nextY + 2;
}

type DrawSectionParams = {
  title: string;
  subtitle: string;
  rows: MonthlyReportRow[];
  startY: number;
  pageWidth: number;
  head: string[];
  body: (row: MonthlyReportRow) => (string | number)[];
  columnStyles?: Record<number, { halign: "left" | "right" | "center" }>;
  statusColumnIndex?: number;
};

function drawSection(doc: jsPDF, params: DrawSectionParams): number {
  const { title, subtitle, rows, head, body, columnStyles, statusColumnIndex } =
    params;

  if (rows.length === 0) return params.startY;

  const pageHeight = doc.internal.pageSize.getHeight();
  let startY = params.startY;

  if (startY > pageHeight - MIN_SECTION_SPACE) {
    doc.addPage();
    startY = 18;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(`${title} (${rows.length})`, PAGE_MARGIN, startY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(subtitle, PAGE_MARGIN, startY + 5);

  autoTable(doc, {
    startY: startY + 9,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [head],
    body: rows.map(body),

    theme: "striped",

    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [40, 40, 40],
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: COLORS.headerBar,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },

    alternateRowStyles: {
      fillColor: COLORS.panel,
    },

    columnStyles: { 0: { fontStyle: "bold" }, ...columnStyles },

    didParseCell: (data: CellHookData) => {
      if (
        statusColumnIndex === undefined ||
        data.section !== "body" ||
        data.column.index !== statusColumnIndex
      ) {
        return;
      }

      const row = rows[data.row.index];
      if (!row) return;

      const color = STATUS_COLORS[row.status];
      if (color) {
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // jspdf-autotable augments the doc instance with this field at runtime.
  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 12;
}

function drawFooterOnAllPages(
  doc: jsPDF,
  companyName: string,
  generatedOn: string,
  pageWidth: number,
): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);

    doc.setDrawColor(...COLORS.border);
    doc.line(PAGE_MARGIN, pageHeight - 14, pageWidth - PAGE_MARGIN, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);

    doc.text(
      `${companyName} · Generated on ${generatedOn}`,
      PAGE_MARGIN,
      pageHeight - 8,
    );

    const pageLabel = `Page ${page} of ${pageCount}`;
    doc.text(pageLabel, pageWidth - PAGE_MARGIN, pageHeight - 8, {
      align: "right",
    });
  }

  doc.setTextColor(...COLORS.text);
}
