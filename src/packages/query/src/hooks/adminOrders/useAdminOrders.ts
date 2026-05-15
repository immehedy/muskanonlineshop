import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { queryKeys } from "../../queryKeys";

export function useAdminOrders() {
  return useQuery({
    queryKey: queryKeys.adminOrders,
    queryFn: () => apiClient("/api/admin/orders"),
  });
}