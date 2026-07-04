import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/errors/handle-api-error";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { exportProductsPdf } from "@/features/product/service/export-product-pdf.service";

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();

    const {companyId, companyName, companyLogo} = await getCurrentUser();

    const pdf = await exportProductsPdf(
      companyId,
      filters,
      companyLogo,
      companyName,
    );

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="products-report.pdf"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}