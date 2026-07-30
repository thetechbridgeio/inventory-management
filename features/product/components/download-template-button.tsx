import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDownloadProductTemplate } from "@/features/product/hooks/use-download-product-template";

export function DownloadProductTemplateButton() {
  const { mutate, isPending } = useDownloadProductTemplate();

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
