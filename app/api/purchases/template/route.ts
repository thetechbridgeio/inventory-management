import { generatePurchaseTemplate } from "@/features/purchase/service/template/generate-purchase-template.service";
import { getTemplateProducts } from "@/features/purchase/service/template/get-template-products.service";
import { getTemplateSuppliers } from "@/features/purchase/service/template/get-template-suppliers.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";

export async function GET() {
  const { companyId } = await getCurrentUser();
  const [suppliers, products] = await Promise.all([
    getTemplateSuppliers(companyId),
    getTemplateProducts(companyId),
  ]);

  const buffer = await generatePurchaseTemplate({
    suppliers,
    products,
  });
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="purchase-import-template.xlsx"',
    },
  });
}
