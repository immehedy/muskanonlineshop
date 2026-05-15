import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

export type RecentOrder = {
  _id: string;
  orderNumber: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  total: number;
  createdAt: string;
  items: Array<{ id: string; name?: string; quantity: number }>;
};

type RecentOrdersResponse = {
  orders?: RecentOrder[];
  data?: RecentOrder[];
};

export function useRecentOrders() {
  return useQuery({
    queryKey: ["admin", "dashboard", "recent-orders"],

    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "6",
        sortBy: "createdAt",
        sortOrder: "desc",
        includeStats: "false",
      });

      const data = await apiClient<RecentOrdersResponse>(
        `/api/admin/orders?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      return data.orders || data.data || [];
    },

    // CACHE CONFIG
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    retry: 1,
  });
}