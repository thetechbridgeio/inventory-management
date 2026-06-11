import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { ProductList } from '@/features/product/components/data-table/product-list'
import Link from 'next/link'
import React from 'react'

const InventoryPage = () => {
  return (
     <DashboardLayout>
     
        <div className="flex justify-between items-center gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage and track your product inventory
            </p>
          </div>
          <div className="flex justify-end items-center gap-3">
            <Button asChild>
              <Link href={"/inventory/create"}>Add Product</Link>
            </Button>
          </div>
        </div>
       
        <ProductList />
     
    </DashboardLayout>
  )
}

export default InventoryPage