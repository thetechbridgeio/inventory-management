type LoadedImage = {
  dataUrl: string;
  format: "PNG" | "JPEG" | "WEBP";
};

/**
 * Fetches a remote image and converts it to a base64 data URL that jsPDF's
 * addImage() can consume. Returns null on any failure so callers can degrade
 * gracefully (render the PDF without a logo instead of throwing).
 */
export async function loadImageAsBase64(
  url: string | null,
): Promise<LoadedImage | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    const format: LoadedImage["format"] = contentType.includes("png")
      ? "PNG"
      : contentType.includes("webp")
        ? "WEBP"
        : "JPEG";

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      dataUrl: `data:${contentType || "image/png"};base64,${base64}`,
      format,
    };
  } catch {
    return null;
  }
}
