"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { PlusIcon, ShieldCheckIcon, Trash2Icon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFSelect } from "@/components/react-hook-form-fields/rhf-select";

import { ROLES } from "@/features/auth/constants/user-role";
import { OnboardCompanyType } from "../../types/company.type";

type Props = {
  form: UseFormReturn<OnboardCompanyType>;
};

export default function UsersForm({ form }: Props) {
  const { control, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  const users = watch("users");

  const superAdminIndex = users.findIndex(
    (user) => user.role === ROLES.SUPER_ADMIN,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary rounded-xl p-2">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold">Company Users</h3>

            <p className="text-muted-foreground text-sm">
              Configure the users who will have access to this company. Exactly
              one SUPER_ADMIN is required.
            </p>
          </div>
        </div>
      </div>

      {fields.map((field, index) => {
        const isSuperAdmin = index === superAdminIndex;

        return (
          <Card
            key={field.id}
            className={`overflow-hidden transition-all ${
              isSuperAdmin ? "border-primary/30 bg-primary/5 shadow-sm" : ""
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-xl p-2 ${
                      isSuperAdmin
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isSuperAdmin ? (
                      <ShieldCheckIcon className="h-5 w-5" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {isSuperAdmin
                        ? "Primary Administrator"
                        : `User ${index + 1}`}

                      {isSuperAdmin && <Badge>SUPER ADMIN</Badge>}
                    </CardTitle>

                    <CardDescription className="mt-1">
                      {isSuperAdmin
                        ? "This user will manage the company and have full administrative access."
                        : "Additional company user with configurable permissions."}
                    </CardDescription>
                  </div>
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="text-destructive h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
              <RHFInput<OnboardCompanyType>
                name={`users.${index}.name`}
                label="Full Name"
                helperText="User's full name."
                required
              />

              <RHFInput<OnboardCompanyType>
                name={`users.${index}.email`}
                type="email"
                label="Email Address"
                helperText="Used for login."
                required
              />

              <RHFInput<OnboardCompanyType>
                name={`users.${index}.phone`}
                type="tel"
                label="Phone Number"
                helperText="Optional contact number."
              />

              <RHFSelect<OnboardCompanyType>
                name={`users.${index}.role`}
                label="Role"
                options={Object.values(ROLES)
                  .filter((role) => {
                    if (role !== ROLES.SUPER_ADMIN) {
                      return true;
                    }

                    return superAdminIndex === -1 || superAdminIndex === index;
                  })
                  .map((role) => ({
                    label: role
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase()),
                    value: role,
                  }))}
              />

              <RHFInput<OnboardCompanyType>
                name={`users.${index}.password`}
                type="password"
                label="Password"
                placeholder="Enter password"
                required
                helperText="Minimum 8 characters."
              />

              <RHFInput<OnboardCompanyType>
                name={`users.${index}.confirmPassword`}
                type="password"
                label="Confirm Password"
                placeholder="Re-enter password"
                required
                helperText="Must match the password."
              />
            </CardContent>
          </Card>
        );
      })}

      {/* Add User Section */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          <div>
            <h3 className="font-medium">Add another user</h3>

            <p className="text-muted-foreground text-sm">
              Add managers or staff members to this company.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() =>
              append({
                name: "",
                email: "",
                phone: "",
                role:
                  Object.values(ROLES).find((r) => r !== ROLES.SUPER_ADMIN) ??
                  ROLES.SUPER_ADMIN,
                password: "",
                confirmPassword: "",
              })
            }
          >
            <PlusIcon className="h-4 w-4" />
            Add User
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
