// Central style constants so every section of the PDF stays visually consistent.
// Keep this the single source of truth for colors / spacing tweaks.

export type RgbColor = [number, number, number];

export const PDF_COLORS = {
  primary: [30, 41, 59] as RgbColor, // slate-800  — headings
  secondary: [71, 85, 105] as RgbColor, // slate-600  — body text
  muted: [100, 116, 139] as RgbColor, // slate-500  — labels / helper text
  accent: [37, 99, 235] as RgbColor, // blue-600   — brand accent
  border: [226, 232, 240] as RgbColor, // slate-200  — hairlines
  panelBg: [248, 250, 252] as RgbColor, // slate-50   — box backgrounds
  tableHeadBg: [30, 41, 59] as RgbColor, // slate-800  — table header
  tableHeadText: [255, 255, 255] as RgbColor,
  tableStripe: [248, 250, 252] as RgbColor,
  white: [255, 255, 255] as RgbColor,
};

export const PAGE = {
  width: 210, // A4 mm
  height: 297,
  marginLeft: 15,
  marginRight: 15,
  marginTop: 15,
  marginBottom: 20,
};

export const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight;

export const FONT = {
  family: "helvetica",
} as const;
