'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { ProductSupplier } from '../../types/product.types';

interface SuppliersListProps {
  suppliers: ProductSupplier[];
}

export function SuppliersList({ suppliers }: SuppliersListProps) {
  const activeSuppliers = suppliers.filter((s) => s.isActive);
  const inactiveCount = suppliers.length - activeSuppliers.length;

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Suppliers</CardTitle>
          <Badge variant="secondary">{activeSuppliers.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Active Suppliers */}
        <div className="divide-y divide-border">
          {activeSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>

        {/* Inactive Suppliers */}
        {inactiveCount > 0 && (
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {inactiveCount} Inactive Supplier{inactiveCount !== 1 ? 's' : ''}
            </div>
            <div className="space-y-2">
              {suppliers
                .filter((s) => !s.isActive)
                .map((supplier) => (
                  <div
                    key={supplier.id}
                    className="text-sm text-muted-foreground opacity-60 flex items-center justify-between"
                  >
                    <span>{supplier.companyName}</span>
                    <Badge variant="outline" className="bg-muted">
                      Inactive
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SupplierCard({ supplier }: { supplier: ProductSupplier }) {
  return (
    <div className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{supplier.companyName}</h3>
          {supplier.contactPersonName && (
            <p className="text-sm text-muted-foreground">{supplier.contactPersonName}</p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mb-3">
        {supplier.email && (
          <a
            href={`mailto:${supplier.email}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            {supplier.email}
          </a>
        )}
        {supplier.phone && (
          <a
            href={`tel:${supplier.phone}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {supplier.phone}
          </a>
        )}
      </div>

      {/* Details Tags */}
      <div className="flex flex-wrap gap-1.5">
        {supplier.estimatedDeliveryPeriod && (
          <Badge variant="outline" className="text-xs gap-1.5">
            <Calendar className="h-3 w-3" />
            {supplier.estimatedDeliveryPeriod} days
          </Badge>
        )}
        {supplier.paymentTerm && (
          <Badge variant="outline" className="text-xs gap-1.5">
            <DollarSign className="h-3 w-3" />
            {supplier.paymentTerm}
          </Badge>
        )}
      </div>
    </div>
  );
}

