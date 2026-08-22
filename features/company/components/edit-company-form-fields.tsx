"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { ImageUpload } from "@/components/react-hook-form-fields/image-upload";

import { CompanyFormValues, UpdateCompanyFormType } from "../types/company.type";
import { useUpdateCompany } from "../hooks/use-update-company";

export function EditCompanyFormFields() {
  const router = useRouter();
  const form = useFormContext<CompanyFormValues>();

  const { mutateAsync, isPending } = useUpdateCompany();

  async function onSubmit(values: CompanyFormValues) {
    try {
      // zodResolver has already run `values` through companyFormSchema's
      // preprocess/transform pipeline at this point, so it matches the
      // schema's output shape even though the static input type doesn't.
      await mutateAsync(values as unknown as UpdateCompanyFormType);
      router.push("/company");
    } catch {}
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold">Edit Company Details</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Update your company&apos;s business and contact information.
          </p>
        </div>

        <div className="space-y-8 p-6">
          <section>
            <div className="mb-5">
              <h3 className="font-semibold">Business Information</h3>

              <p className="text-sm text-muted-foreground">
                Core details about your company.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <RHFInput<CompanyFormValues> name="name" label="Company Name" required />

              <RHFInput<CompanyFormValues> name="gst" label="GST Number" />

              <RHFInput<CompanyFormValues> name="website" label="Website" />

              <RHFInput<CompanyFormValues> name="address" label="Address" />
            </div>

            <div className="mt-6">
              <RHFTextarea<CompanyFormValues> name="description" label="Description" />
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h3 className="font-semibold">Company Logo</h3>

              <p className="text-sm text-muted-foreground">
                Upload your company&apos;s logo.
              </p>
            </div>

            <ImageUpload
              label="Company Logo"
              description="Upload your company's logo"
              value={form.watch("logoUrl")}
              onChange={(file) =>
                // ImageUpload only ever reports a new File or `undefined` on
                // removal; map removal to `null` so the API can tell "clear
                // the logo" apart from "field not included in this request".
                form.setValue("logoUrl", file ?? null, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </section>

          <section>
            <div className="mb-5">
              <h3 className="font-semibold">Primary Contact</h3>

              <p className="text-sm text-muted-foreground">
                Main point of communication for your company.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <RHFInput<CompanyFormValues>
                name="contactPersonName"
                label="Contact Person"
              />

              <RHFInput<CompanyFormValues>
                name="contactPersonPhone"
                label="Contact Phone"
              />

              <RHFInput<CompanyFormValues>
                name="contactPersonEmail"
                label="Contact Email"
                type="email"
              />
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/company")}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
