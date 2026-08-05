import { ReturnList } from "@/features/returns/components/data-table/return-list";

const ReturnsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Returns</h1>

          <p className="mt-1 text-muted-foreground">
            Review and approve return requests raised against Outgoings.
          </p>
        </div>
      </div>

      <ReturnList />
    </div>
  );
};

export default ReturnsPage;
