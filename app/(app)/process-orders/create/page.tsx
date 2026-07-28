import { Button } from "@/components/ui/button";
import CreateProcessOrderForm from "@/features/process-order/components/create/create-process-order-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CreateProcessOrderPage = () => {
  return (
    <>
      <div className="flex justify-between items-center gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Process</h1>
          <p className="mt-2 text-muted-foreground">
            Add a new process record in your inventory system,
          </p>
        </div>
        <Button asChild>
          <Link href={"/process-orders"}>
            <ArrowLeft />
            Back
          </Link>
        </Button>
      </div>
      <CreateProcessOrderForm />
    </>
  );
};

export default CreateProcessOrderPage;
