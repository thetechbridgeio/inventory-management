import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { CreateSupplierFormType } from "../../types/suppliers.type";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";

export function CreateSupplierForm() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Supplier Information</h3>
          <p className="text-sm text-muted-foreground">
            Basic company and compliance information.
          </p>
        </div>

        <RHFInput<CreateSupplierFormType>
          name="companyName"
          label="Company Name"
          placeholder="ABC Electronics Pvt Ltd"
          helperText="Legal or trading name of the supplier."
        />

        <RHFInput<CreateSupplierFormType>
          name="gst"
          label="GST Number"
          placeholder="19ABCDE1234F1Z5"
          helperText="Tax registration number if available."
        />

        <RHFTextarea<CreateSupplierFormType>
          name="address"
          label="Business Address"
          placeholder="12 Park Street, Kolkata, West Bengal"
          helperText="Registered office or primary operating address."
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            Primary contact for purchase orders and supplier communication.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RHFInput<CreateSupplierFormType>
            name="contactPersonName"
            label="Contact Person"
            placeholder="Rahul Sharma"
            helperText="Main point of contact."
          />

          <RHFInput<CreateSupplierFormType>
            name="phone"
            label="Phone Number"
            placeholder="+91 9876543210"
            helperText="Include country code when applicable."
          />
        </div>

        <RHFInput<CreateSupplierFormType>
          name="email"
          label="Email Address"
          type="email"
          placeholder="contact@abc.com"
          helperText="Used for purchase orders, invoices, and communication."
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Procurement Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Operational information used during purchasing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RHFInput<CreateSupplierFormType>
            name="estimatedDeliveryPeriod"
            label="Estimated Delivery Period (Days)"
            type="number"
            placeholder="Enter in days"
            helperText="Average number of days required to deliver an order."
          />

          <RHFInput<CreateSupplierFormType>
            name="paymentTerm"
            label="Payment Terms"
            placeholder="Net 30"
            helperText="Examples: Net 30, COD, 50% Advance, Monthly Settlement."
          />
        </div>
      </section>
    </div>
  );
}
