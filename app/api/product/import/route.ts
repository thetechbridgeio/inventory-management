import { NextRequest, NextResponse } from "next/server";

import { createBulkProducts } from "@/features/product/service/bulk-upload/create-bulk-products.service";
import { parseProductTemplate } from "@/features/product/service/bulk-upload/parse-product-template.service";
import { validateProductRows } from "@/features/product/service/bulk-upload/validate-product-rows.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { ValidationError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/handle-api-error";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ValidationError("Excel file is required.");
    }

    const { companyId } = await getCurrentUser();

    const productRows = await parseProductTemplate(file);
    const validationErrors = validateProductRows(productRows);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: validationErrors,
        },
        { status: 400 },
      );
    }

    const createdProducts = await createBulkProducts(productRows, companyId);

    return NextResponse.json({
      success: true,
      message: `${createdProducts.length} products imported successfully.`,
      data: createdProducts,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
