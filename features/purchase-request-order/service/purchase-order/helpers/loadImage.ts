type LoadedImage = {
  dataUrl: string;
  format: "PNG" | "JPEG";
};

// jsPDF's addImage() only reliably supports these formats — anything else
// (WEBP, AVIF, HEIC, SVG, ...) throws synchronously when embedded. Logos are
// uploaded via a generic "image/*" picker, so a company logo isn't guaranteed
// to be one of these.
const SUPPORTED_CONTENT_TYPES: Record<string, LoadedImage["format"]> = {
  png: "PNG",
  jpeg: "JPEG",
  jpg: "JPEG",
};

/**
 * Fetches a remote image and converts it to a base64 data URL that jsPDF's
 * addImage() can consume. Returns null on any failure, or when the image
 * isn't a format jsPDF supports, so callers can degrade gracefully (render
 * the PDF without a logo instead of throwing).
 */
export async function loadImageAsBase64(
  url: string | null,
): Promise<LoadedImage | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    const format = Object.entries(SUPPORTED_CONTENT_TYPES).find(([key]) =>
      contentType.includes(key),
    )?.[1];

    if (!format) return null;

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      dataUrl: `data:${contentType};base64,${base64}`,
      format,
    };
  } catch {
    return null;
  }
}
