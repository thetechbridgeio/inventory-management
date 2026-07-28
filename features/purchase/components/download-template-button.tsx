import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDownloadPurchaseTemplate } from "@/features/purchase/hooks/use-download-purchase-template";

export function DownloadPurchaseTemplateButton() {
  const { mutate, isPending } = useDownloadPurchaseTemplate();

  return (
    <Button
      variant="outline"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 size-4" />
          Download Template
        </>
      )}
    </Button>
  );
}