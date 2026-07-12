"use client";

import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";

import { ProcessOrderCreatePayload } from "../../types/process-order.types";
import { ProcessOrderCreatePayloadSchema } from "../../validation/process-order-item.validation";
import {
  PROCESS_ORDER_DEFAULT_VALUES,
  PROCESS_ORDER_ITEM_DEFAULT,
} from "../../constants/form-default";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/features/product/components/product-picker";
import { RHFDatePicker } from "@/components/react-hook-form-fields/rhf-datepicker";
import { useCreateProcessOrder } from "../../hooks/use-create-process-order";

const CreateProcessOrderForm = () => {
  const { mutateAsync, isPending } = useCreateProcessOrder();
  const form = useForm<ProcessOrderCreatePayload>({
    resolver: zodResolver(ProcessOrderCreatePayloadSchema),
    defaultValues: PROCESS_ORDER_DEFAULT_VALUES,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const selectedSentProducts = form.watch("items").map((i) => i.sentProductId);
  const selectedReceivedProducts = form
    .watch("items")
    .map((i) => i.receivedProductId);

  const onSubmit = async (data: ProcessOrderCreatePayload) => {
    try {
      await mutateAsync(data);
      form.reset(PROCESS_ORDER_DEFAULT_VALUES);
    } catch {}
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold">Process Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <RHFInput<ProcessOrderCreatePayload>
                name="processOrder.vendorName"
                label="Vendor Name"
                type="text"
                placeholder="Enter Vendor Name"
                helperText="Leave empty if internal process"
              />
              <RHFTextarea<ProcessOrderCreatePayload>
                name="processOrder.remarks"
                label="Remarks"
                placeholder="Enter remarks of the process..."
              />
            </div>
            <hr />
            <h2 className="text-xl font-semibold">Process Items</h2>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Item #{index + 1}</h3>

                      <Button
                        type="button"
                        variant="destructive"
                        disabled={fields.length === 1}
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <ProductPicker
                        error={
                          form.formState.errors.items?.[index]?.sentProductId
                            ?.message
                        }
                        label="Sent Product"
                        value={form.watch(`items.${index}.sentProductId`)}
                        selectedProductIds={selectedSentProducts.filter(
                          (_, i) => i !== index,
                        )}
                        onChange={(product) => {
                          form.setValue(
                            `items.${index}.sentProductId`,
                            product.id,
                            {
                              shouldValidate: true,
                            },
                          );
                        }}
                        onClear={() =>
                          form.setValue(`items.${index}.sentProductId`, "")
                        }
                      />

                      <ProductPicker
                        error={
                          form.formState.errors.items?.[index]
                            ?.receivedProductId?.message
                        }
                        label="Received Product"
                        value={form.watch(`items.${index}.receivedProductId`)}
                        selectedProductIds={selectedReceivedProducts.filter(
                          (_, i) => i !== index,
                        )}
                        onChange={(product) => {
                          form.setValue(
                            `items.${index}.receivedProductId`,
                            product.id,
                            {
                              shouldValidate: true,
                            },
                          );
                        }}
                        onClear={() =>
                          form.setValue(`items.${index}.receivedProductId`, "")
                        }
                      />

                      <RHFInput<ProcessOrderCreatePayload>
                        name={`items.${index}.sentQty`}
                        type="number"
                        label="Sent Quantity"
                      />

                      <RHFDatePicker<ProcessOrderCreatePayload>
                        name={`items.${index}.sentDate`}
                        label="Sent Date"
                      />

                      <RHFInput<ProcessOrderCreatePayload>
                        name={`items.${index}.processingCost`}
                        type="number"
                        label="Processing Cost"
                      />

                      <RHFInput<ProcessOrderCreatePayload>
                        name={`items.${index}.location`}
                        label="Location"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    ...PROCESS_ORDER_ITEM_DEFAULT,
                  })
                }
              >
                Add Item
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isPending}
            >
              {form.formState.isSubmitting || isPending
                ? "Creating..."
                : "Create Process Order"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};

export default CreateProcessOrderForm;
