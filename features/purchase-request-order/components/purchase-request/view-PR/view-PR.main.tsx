import { ViewPurchaseRequestType } from "../../../types/purchase-request.type";
import { PurchaseRequestHeader } from "./PR-header";
import PRTableMain from "./pr-table.main";

export type PRPropDataType = {
  purchaseRequestId: string;
  purchaseRequestNumber: string;
};

const ViewPRMain = ({
  purchaseRequestTotal,
}: {
  purchaseRequestTotal: ViewPurchaseRequestType;
}) => {
  const { products, ...purchaseRequest } = purchaseRequestTotal;

  const prData = {
    purchaseRequestId: purchaseRequest.id,
    purchaseRequestNumber: purchaseRequest.purchaseRequestNumber,
  };

  return (
    <div className="space-y-4">
      <PurchaseRequestHeader pr={purchaseRequest} />
      <PRTableMain products={products} prData={prData} />
    </div>
  );
};

export default ViewPRMain;
