"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateProductForm } from "@/features/product/components/create-product/create-product-form";
import React from "react";

const AddProductPage = () => {
  return (
    <DashboardLayout>
      <CreateProductForm />
    </DashboardLayout>
  );
};

export default AddProductPage;
