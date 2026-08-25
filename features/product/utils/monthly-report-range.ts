export type ReportMonthOption = {
  year: number;
  month: number; // 1-indexed
  label: string; // "August 2026"
  value: string; // "2026-08" — stable key for UI lists
};

/**
 * The last 12 calendar months (current month first), the window the monthly
 * report is allowed to be generated for. Shared by the download dropdown
 * (to build its options) and the API route (to validate the request) so the
 * two can never drift apart.
 */
export function getAvailableReportMonths(
  referenceDate: Date = new Date(),
): ReportMonthOption[] {
  const months: ReportMonthOption[] = [];

  for (let offset = 0; offset < 12; offset += 1) {
    const date = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth() - offset,
        1,
      ),
    );

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;

    months.push({
      year,
      month,
      label: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      value: `${year}-${String(month).padStart(2, "0")}`,
    });
  }

  return months;
}

export function isReportMonthAllowed(
  year: number,
  month: number,
  referenceDate: Date = new Date(),
): boolean {
  return getAvailableReportMonths(referenceDate).some(
    (option) => option.year === year && option.month === month,
  );
}
