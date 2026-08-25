import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/errors/handle-api-error";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { MonthlyReportRequestSchema } from "@/features/product/validations/monthly-report.validation";
import { exportMonthlyReportPdf } from "@/features/product/service/monthly-report/export-monthly-report-pdf.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = MonthlyReportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid monthly report request", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { year, month } = parsed.data;
    const { companyId, companyName, companyLogo } = await getCurrentUser();

    const pdf = await exportMonthlyReportPdf(
      companyId,
      companyName,
      companyLogo,
      year,
      month,
    );

    const filename = `monthly-report-${year}-${String(month).padStart(2, "0")}.pdf`;

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
