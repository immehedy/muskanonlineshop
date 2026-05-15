import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

export type DashboardStats = {
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  totalOrders: number;
  totalRevenue: number;
};

type DashboardStatsResponse = {
  success: boolean;
  data: DashboardStats;
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],

    queryFn: async () => {
      const data = await apiClient<DashboardStatsResponse>(
        "/api/admin/dashboard",
        {
          method: "GET",
          credentials: "include",
        }
      );

      return data.data;
    },

    // CACHE CONFIG
    staleTime: 1000 * 60 * 5, // 5 min fresh
    gcTime: 1000 * 60 * 30, // keep cache 30 min

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    retry: 1,
  });
}