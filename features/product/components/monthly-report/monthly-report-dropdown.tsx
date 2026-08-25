"use client";

import { useMemo } from "react";
import { CalendarDays, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDownloadMonthlyReport } from "../../hooks/use-download-monthly-report";
import { getAvailableReportMonths } from "../../utils/monthly-report-range";

export function MonthlyReportDropdown() {
  const months = useMemo(() => getAvailableReportMonths(), []);
  const { mutate, isPending, variables } = useDownloadMonthlyReport();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <CalendarDays className="mr-2 size-4" />
          Monthly Report
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Download report for</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {months.map((month) => {
          const isDownloading = isPending && variables?.value === month.value;

          return (
            <DropdownMenuItem
              key={month.value}
              disabled={isPending}
              onSelect={(event) => {
                event.preventDefault();
                mutate(month);
              }}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              {month.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
