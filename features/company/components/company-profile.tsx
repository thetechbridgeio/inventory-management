import React from "react";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  User,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format-date";

const getValue = (value?: string | null, fallback = "Not provided") => {
  if (!value?.trim()) {
    return fallback;
  }

  return value;
};

function DetailRow({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  color?: "blue" | "green" | "purple" | "amber";
}) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-emerald-500/10 text-emerald-600",
    purple: "bg-purple-500/10 text-purple-600",
    amber: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="flex gap-4 rounded-xl border p-4 transition-all hover:bg-muted/40">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          colors[color]
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words font-medium">{getValue(value)}</p>
      </div>
    </div>
  );
}

export function CompanyProfile({ company }: { company: any }) {
  const websiteSchema = z.url();

  const hasWebsite = websiteSchema.safeParse(company.website).success;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="relative bg-gradient-to-br from-blue-500/15 via-violet-500/10 to-emerald-500/15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%)]" />

          <CardContent className="relative p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {getValue(company.name)}
                  </h2>

                  <Badge
                    className={
                      company.isActive
                        ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                        : "border-red-200 bg-red-100 text-red-700"
                    }
                  >
                    {company.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <p className="mt-3 max-w-3xl text-muted-foreground">
                  {getValue(
                    company.description,
                    "No company description available.",
                  )}
                </p>

                {hasWebsite ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    {company.website}
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No website provided
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200/50 bg-blue-50/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>

              <p className="text-3xl font-bold text-blue-600">
                {company.users?.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/50 bg-emerald-50/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Company Status</p>

              <p className="text-3xl font-bold text-emerald-600">
                {company.isActive ? "Live" : "Paused"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-200/50 bg-violet-50/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-violet-500/10 p-3">
              <Globe className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Website</p>

              <p className="text-lg font-bold text-violet-600">
                {hasWebsite ? "Connected" : "Not Configured"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-blue-200/50 bg-blue-50/20">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-blue-700">
                Business Information
              </h3>

              <p className="text-sm text-muted-foreground">
                Core company details
              </p>
            </div>

            <div className="space-y-4">
              <DetailRow
                icon={ReceiptText}
                label="GST Number"
                value={company.gst}
                color="blue"
              />

              <DetailRow
                icon={MapPin}
                label="Address"
                value={company.address}
                color="purple"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/50 bg-emerald-50/20">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-emerald-700">
                Primary Contact
              </h3>

              <p className="text-sm text-muted-foreground">
                Main point of communication
              </p>
            </div>

            <div className="space-y-4">
              <DetailRow
                icon={User}
                label="Contact Person"
                value={company.contactPersonName}
                color="green"
              />

              <DetailRow
                icon={Mail}
                label="Email"
                value={company.contactPersonEmail}
                color="purple"
              />

              <DetailRow
                icon={Phone}
                label="Phone"
                value={company.contactPersonPhone}
                color="amber"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card className="border-muted bg-muted/20">
        <CardContent className="grid gap-6 p-6 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Created
              </p>

              <p className="font-medium">{formatDate(company.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Last Updated
              </p>

              <p className="font-medium">{formatDate(company.updatedAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Team Size
              </p>

              <p className="font-medium text-emerald-600">
                {company.users?.length ?? 0} Users
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
