"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { GetProductsParams } from "../types/product.types";

export function useProducts({
  page,
  search,
  categories,
  locations,
  units,
}: GetProductsParams = {}) {
  return useQuery({
    queryKey: [
      "products",
      {
        page,
        search,
        categories,
        locations,
        units,
      },
    ],

    queryFn: async () => {
      const response = await axios.get("/api/product", {
        params: {
          page,
          search: search ?? undefined,
          categories: categories?.length
            ? categories.join(",")
            : undefined,
          locations: locations?.length
            ? locations.join(",")
            : undefined,
          units: units?.length
            ? units.join(",")
            : undefined,
        },
      });

      return response.data.data;
    },
  });
}