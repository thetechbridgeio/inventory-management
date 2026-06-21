"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import UpdateProductMain from "@/features/product/components/update-product/upadate-product.main";
import React from "react";

const UpdateProductPage = () => {
  return (
    <DashboardLayout>
      <UpdateProductMain />
    </DashboardLayout>
  );
};

export default UpdateProductPage;
