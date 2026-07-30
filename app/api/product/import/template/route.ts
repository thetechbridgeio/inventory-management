import { generateProductTemplate } from "@/features/product/service/bulk-upload/generate-product-template.service";

export async function GET() {
  const buffer = await generateProductTemplate();

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="product-import-template.xlsx"',
    },
  });
}
