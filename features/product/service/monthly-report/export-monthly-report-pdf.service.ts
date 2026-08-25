import "server-only";

import { getMonthlyReportData } from "./get-monthly-report-data.service";
import { generateMonthlyReportPdf } from "./generate-monthly-report-pdf.service";

export async function exportMonthlyReportPdf(
  companyId: string,
  companyName: string,
  companyLogo: string | null,
  year: number,
  month: number,
): Promise<Uint8Array> {
  const report = await getMonthlyReportData(companyId, year, month);

  return await generateMonthlyReportPdf({
    companyName,
    companyLogo,
    report,
  });
}
