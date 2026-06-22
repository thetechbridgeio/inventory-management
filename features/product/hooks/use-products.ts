"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  GetProductsParams,
  GetProductsResponse,
} from "../types/product.types";
import { ApiSuccessResponse } from "@/lib/common-types";
import { handleApiError } from "@/lib/errors/handle-api-error";

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

    queryFn: async (): Promise<GetProductsResponse | undefined> => {
      try {
        const { data } = await axios.get<
          ApiSuccessResponse<GetProductsResponse>
        >("/api/product", {
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

        return data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
  });
}