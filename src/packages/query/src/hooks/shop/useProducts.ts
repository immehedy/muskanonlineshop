import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { queryKeys } from "../../queryKeys";

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => apiClient("/api/products"),
  });
}