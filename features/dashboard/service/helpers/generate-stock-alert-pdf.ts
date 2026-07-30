import { Buffer } from "node:buffer";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LowStockEmail, DashboardProduct } from "../../types";

const PAGE_MARGIN = 14;
const COLORS = {
  text: [24, 24, 27] as [number, number, number],
  muted: [113, 113, 122] as [number, number, number],
  border: [228, 228, 231] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  dangerBg: [253, 242, 242] as [number, number, number],
  warning: [234, 88, 12] as [number, number, number],
  warningBg: [255, 247, 237] as [number, number, number],
  panel: [250, 250, 250] as [number, number, number],
};

interface BrandOptions {
  companyName: string;
  companyLogo: string | null;
}

export async function generateStockAlertPDF(
  data: LowStockEmail,
  { companyName, companyLogo }: BrandOptions,
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedOn = new Date().toLocaleString();

  const logo = await loadLogo(companyLogo);
  let currentY = drawHeader(doc, companyName, logo, pageWidth);

  currentY = drawSummary(doc, data, currentY, pageWidth);

  if (data.outOfStockProducts.length > 0) {
    currentY = drawProductTable(
      doc,
      "Out of Stock",
      data.outOfStockProducts,
      currentY,
      { head: COLORS.danger, rowBg: COLORS.dangerBg },
    );
  }

  if (data.lowStockProducts.length > 0) {
    currentY = drawProductTable(
      doc,
      "Low Stock",
      data.lowStockProducts,
      currentY,
      { head: COLORS.warning, rowBg: COLORS.warningBg },
    );
  }

  drawFooterOnAllPages(doc, companyName, generatedOn, pageWidth);

  return Buffer.from(doc.output("arraybuffer"));
}

// ---------- Logo loading ----------

interface LoadedLogo {
  dataUrl: string;
  format: "PNG" | "JPEG" | "WEBP";
}

async function loadLogo(url: string | null): Promise<LoadedLogo | null> {
  if (!url) return null;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    const format = contentType.includes("png")
      ? "PNG"
      : contentType.includes("webp")
        ? "WEBP"
        : "JPEG";

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return { dataUrl: `data:${contentType};base64,${base64}`, format };
  } catch {
    // Unreachable, invalid, or unsupported image — render header without a logo.
    return null;
  }
}

// ---------- Header ----------

function drawHeader(
  doc: jsPDF,
  companyName: string,
  logo: LoadedLogo | null,
  pageWidth: number,
): number {
  const headerHeight = 24;

  doc.setFillColor(...COLORS.text);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  let textX = PAGE_MARGIN;

  if (logo) {
    try {
      const logoHeight = 14;

      const imageProps = doc.getImageProperties(logo.dataUrl);
      const logoWidth = (imageProps.width / imageProps.height) * logoHeight;

      doc.addImage(
        logo.dataUrl,
        logo.format,
        PAGE_MARGIN,
        headerHeight / 2 - logoHeight / 2,
        logoWidth,
        logoHeight,
      );

      textX = PAGE_MARGIN + logoWidth + 6;
    } catch {
      // Corrupt image data slipped past the fetch — skip silently.
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, textX, headerHeight / 2 + 1.5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(212, 212, 216);
  const title = "Inventory Stock Alert Report";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, pageWidth - PAGE_MARGIN - titleWidth, headerHeight / 2 + 1.5);

  doc.setTextColor(...COLORS.text);
  return headerHeight + 14;
}

// ---------- Summary ----------

function drawSummary(
  doc: jsPDF,
  data: LowStockEmail,
  startY: number,
  pageWidth: number,
): number {
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text("Summary", PAGE_MARGIN, startY);

  const cards = [
    {
      label: "Out of Stock",
      value: data.outOfStockCount,
      color: COLORS.danger,
    },
    { label: "Low Stock", value: data.lowStockCount, color: COLORS.warning },
    {
      label: "Total Affected",
      value: data.outOfStockCount + data.lowStockCount,
      color: COLORS.text,
    },
  ];

  const cardY = startY + 6;
  const cardHeight = 22;
  const gap = 6;
  const cardWidth =
    (pageWidth - PAGE_MARGIN * 2 - gap * (cards.length - 1)) / cards.length;

  cards.forEach((card, i) => {
    const x = PAGE_MARGIN + i * (cardWidth + gap);

    doc.setFillColor(...COLORS.panel);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setDrawColor(...card.color);
    doc.setLineWidth(1.2);
    doc.line(x, cardY + 2, x, cardY + cardHeight - 2);
    doc.setLineWidth(0.2);

    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...card.color);
    doc.text(String(card.value), x + 6, cardY + 12);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(card.label, x + 6, cardY + 18);
  });

  doc.setTextColor(...COLORS.text);
  return cardY + cardHeight + 14;
}

// ---------- Product tables ----------

function drawProductTable(
  doc: jsPDF,
  title: string,
  products: DashboardProduct[],
  startY: number,
  colors: { head: [number, number, number]; rowBg: [number, number, number] },
): number {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (startY > pageHeight - 50) {
    doc.addPage();
    startY = 36;
  }

  doc.setFontSize(12.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(`${title} (${products.length})`, PAGE_MARGIN, startY);

  autoTable(doc, {
    startY: startY + 5,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [["Product", "Category", "Current Stock", "Location"]],
    body: products.map(mapProduct),
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: COLORS.border,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: colors.head,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: colors.rowBg,
    },
    columnStyles: {
      2: { halign: "center", cellWidth: 35 },
    },
  });

  // @ts-expect-error jspdf-autotable augments jsPDF
  return doc.lastAutoTable.finalY + 14;
}

// ---------- Recommended actions ----------

// ---------- Footer ----------

function drawFooterOnAllPages(
  doc: jsPDF,
  companyName: string,
  generatedOn: string,
  pageWidth: number,
): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...COLORS.border);
    doc.line(
      PAGE_MARGIN,
      pageHeight - 14,
      pageWidth - PAGE_MARGIN,
      pageHeight - 14,
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);

    doc.text(
      `${companyName} • Generated on ${generatedOn}`,
      PAGE_MARGIN,
      pageHeight - 8,
    );

    const pageLabel = `Page ${i} of ${pageCount}`;
    const labelWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, pageWidth - PAGE_MARGIN - labelWidth, pageHeight - 8);
  }

  doc.setTextColor(...COLORS.text);
}

function mapProduct(product: DashboardProduct): (string | number)[] {
  return [
    product.name,
    product.category,
    product.currentStock,
    product.location ?? "-",
  ];
}
