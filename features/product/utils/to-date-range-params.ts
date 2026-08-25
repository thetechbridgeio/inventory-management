import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

/**
 * Converts a calendar DateRange into the "yyyy-MM-dd" query params the API
 * expects, so the picker's Date objects and the filter's ISO date strings
 * stay in one place instead of being formatted ad hoc at each call site.
 */
export function toDateRangeParams(range: DateRange | undefined): {
  updatedFrom?: string;
  updatedTo?: string;
} {
  return {
    updatedFrom: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
    updatedTo: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
  };
}
