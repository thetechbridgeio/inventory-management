import z from "zod";

export const CreateProductFormSchema = z.object({
  name: z
    .string("Product name is required")
    .trim()
    .min(1, "Product name is required")
    .max(255, "Product name cannot exceed 255 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  category: z.string("Category is required").min(1, "Category is required"),

  unit: z
    .string("Unit is required")
    .trim()
    .min(1, "Unit is required")
    .max(50, "Unit cannot exceed 50 characters"),

  minOrderQty: z
    .number({
      message: "Minimum order quantity is required",
    })
    .int("Minimum order quantity must be a whole number")
    .min(0, "Minimum order quantity cannot be negative"),

  maxOrderQty: z
    .number({
      message: "Maximum order quantity is required",
    })
    .int("Maximum order quantity must be a whole number")
    .min(0, "Maximum order quantity cannot be negative"),

  reorderQty: z
    .number({
      message: "Reorder quantity is required",
    })
    .int("Reorder quantity must be a whole number")
    .min(0, "Reorder quantity cannot be negative"),

  openingStock: z
    .number({
      message: "Opening stock is required",
    })
    .int("Opening stock must be a whole number")
    .min(0, "Opening stock cannot be negative"),

  unitCost: z
    .number({
      message: "Unit cost must be a valid number",
    })
    .min(0, "Unit cost cannot be negative")
    .optional(),

  location: z
    .string()
    .trim()
    .max(255, "Location cannot exceed 255 characters")
    .optional(),

  image: z
    .instanceof(File, {
      message: "Please select a valid image file",
    })
    .optional(),
  supplierIds: z.array(z.uuid("Invalid supplier ID")),
});

export const UpdateProductFormSchema = CreateProductFormSchema.omit({
  image: true,
  openingStock: true,
}).extend({
  currentStock: z
    .number({
      message: "Current stock is required",
    })
    .int("Current stock must be a whole number")
    .min(0, "Current stock cannot be negative"),
  image: z
    .union([
      z.instanceof(File, {
        message: "Please select a valid image file",
      }),
      z.url(),
      z.null(),
    ])
    .optional(),
});

export const CreateProductDTOSchema = z.object({
  companyId: z.uuid("Invalid company ID"),
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(255, "Product name cannot exceed 255 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable(),
  category: z.string().min(1, "Category is required"),
  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(50, "Unit cannot exceed 50 characters"),
  minOrderQty: z
    .number({
      message: "Minimum order quantity is required",
    })
    .int("Minimum order quantity must be a whole number")
    .min(0, "Minimum order quantity cannot be negative"),
  maxOrderQty: z
    .number({
      message: "Maximum order quantity is required",
    })
    .int("Maximum order quantity must be a whole number")
    .min(0, "Maximum order quantity cannot be negative"),
  reorderQty: z
    .number()
    .int("Reorder quantity must be a whole number")
    .min(0, "Reorder quantity cannot be negative"),
  openingStock: z
    .number({
      message: "Opening stock is required",
    })
    .int("Opening stock must be a whole number")
    .min(0, "Opening stock cannot be negative"),
  unitCost: z.string().nullable(),
  location: z
    .string()
    .trim()
    .max(255, "Location cannot exceed 255 characters")
    .nullable(),
  image: z.string().nullable(),
});

export const UpdateProductDTOSchema = CreateProductDTOSchema.omit({
  openingStock: true,
}).extend({
  currentStock: z
    .number({
      message: "Current stock is required",
    })
    .int("Current stock must be a whole number")
    .min(0, "Current stock cannot be negative"),
});
