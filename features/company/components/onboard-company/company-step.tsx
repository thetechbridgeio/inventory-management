import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { OnboardCompanyType } from "../../types/company.type";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";

export default function CompanyForm() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <RHFInput<OnboardCompanyType>
            name="company.name"
            label="Company Name"
            helperText="Enter company name"
            required
          />

          <RHFInput<OnboardCompanyType>
            name="company.gst"
            label="GST Number"
            helperText="Enter 15 digit GST number"
          />

          <div className="md:col-span-2">
            <RHFTextarea<OnboardCompanyType>
              name="company.address"
              label="Address"
              placeholder="Enter company address"
            />
          </div>

          <div className="md:col-span-2">
            <RHFTextarea<OnboardCompanyType>
              name="company.description"
              label="Description"
              placeholder="Enter brief description"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Online Presence</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <RHFInput<OnboardCompanyType>
            name="company.website"
            type="url"
            label="Website"
            placeholder="Company website URL"
          />

          <RHFInput<OnboardCompanyType>
            name="company.logoUrl"
            type="url"
            label="Logo URL"
            helperText="Upload a live link, if not present leave empty"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Person</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <RHFInput<OnboardCompanyType>
            name="company.contactPersonName"
            label="Contact Person Name"
            helperText="Primary point of contact."
          />

          <RHFInput<OnboardCompanyType>
            name="company.contactPersonPhone"
            type="tel"
            label="Phone Number"
            helperText="Primary contact number."
          />

          <div className="md:col-span-2">
            <RHFInput<OnboardCompanyType>
              name="company.contactPersonEmail"
              type="email"
              label="Email Address"
              helperText="Primary contact email."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
