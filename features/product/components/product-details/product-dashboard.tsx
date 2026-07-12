'use client';

import { ProductHeader } from './product-header';
import { MetricsOverview } from './metrics-overview';
import { SuppliersList } from './suppliers-list';
import { HistoryTables } from './history-tables';
import type { ProductDashboard } from '../../types/product-details.type';

interface ProductDashboardProps {
  product: ProductDashboard;
}

export function ProductDashboardMain({ product }: ProductDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with product info */}
      <ProductHeader product={product} />

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Metrics Overview */}
        <MetricsOverview metrics={product.metrics} />

        {/* Suppliers and History Section */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Suppliers */}
          <div className="lg:col-span-1">
            <SuppliersList suppliers={product.suppliers} />
          </div>

          {/* History Tables */}
          <div className="lg:col-span-2">
            <HistoryTables
              purchaseHistory={product.purchaseHistory}
              saleHistory={product.saleHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
