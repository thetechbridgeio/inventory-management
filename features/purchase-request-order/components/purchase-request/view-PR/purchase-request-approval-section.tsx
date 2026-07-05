import PRTableMain from "./pr-table.main";
import { PRPropDataType } from "./ViewPRMain";
import { ViewPurchaseRequestType } from "../../../types/purchase-request.type";

export default function PurchaseRequestApprovalSection({
  products,
  prData,
}: {
  products: ViewPurchaseRequestType["products"];
  prData: PRPropDataType;
}) {
  return <PRTableMain products={products} prData={prData} />;
}
