import { DashboardLayout } from "@/components/layout/dashboard-layout";
import ProcessOrderDetailClient from "@/features/process-order/components/process-order-detail-client";

interface ProcessOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProcessOrderDetailPage({
  params,
}: ProcessOrderDetailPageProps) {
  const { id } = await params;

  return (
    <DashboardLayout>
      <ProcessOrderDetailClient id={id} />
    </DashboardLayout>
  );
}