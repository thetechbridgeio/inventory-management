"use client"

import { Truck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { getTotalSuppliers } from "../services/supplier.service"

interface Props {
  suppliers: any[]
}

export function SupplierOverviewCard({ suppliers }: Props) {
  const totalSuppliers = getTotalSuppliers(suppliers)

  return (
    <Card className="rounded-[28px] border-0 bg-gradient-to-r from-violet-100 to-indigo-100 shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-slate-600">Total Suppliers</p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            {totalSuppliers}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <Truck className="h-8 w-8 text-violet-600" />
        </div>
      </CardContent>
    </Card>
  )
}
