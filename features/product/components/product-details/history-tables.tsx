'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Eye } from 'lucide-react';
import { PurchaseHistory, SaleHistory } from '../../types/product-details.type';

interface HistoryTablesProps {
  purchaseHistory: PurchaseHistory[];
  saleHistory: SaleHistory[];
}

export function HistoryTables({ purchaseHistory, saleHistory }: HistoryTablesProps) {
  return (
    <Accordion type="single" collapsible defaultValue="purchase" className="space-y-4">
      {/* Purchase History */}
      <AccordionItem value="purchase" className="border border-border rounded-lg bg-card">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Purchase History</h3>
            <p className="text-xs text-muted-foreground">
              {purchaseHistory.length} transaction{purchaseHistory.length !== 1 ? 's' : ''}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                    PO Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Supplier
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Total
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <span className="text-sm font-medium text-foreground">
                        {item.purchaseNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-muted-foreground">
                        {item.supplier.supplierName}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-medium text-foreground">
                        {item.purchaseQty}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm text-foreground">
                        ₹{item.purchasePrice}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-semibold text-foreground">
                        ₹{(item.purchaseQty * item.purchasePrice)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-left">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.purchaseDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Sale History */}
      <AccordionItem value="sale" className="border border-border rounded-lg bg-card">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Sale History</h3>
            <p className="text-xs text-muted-foreground">
              {saleHistory.length} transaction{saleHistory.length !== 1 ? 's' : ''}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                    SO Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Sold To
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Total
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {saleHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <span className="text-sm font-medium text-foreground">
                        {item.saleNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-muted-foreground">{item.soldTo || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-medium text-foreground">
                        {item.saleQty}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm text-foreground">
                        ₹{item.sellingPrice}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-semibold text-foreground">
                        ₹{(item.saleQty * item.sellingPrice)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-left">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.saleDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
