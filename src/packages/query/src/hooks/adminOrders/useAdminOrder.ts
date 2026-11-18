import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import type { AdminOrder } from "./useAdminOrders";

type OrderResponse = {
  order: AdminOrder & {
    subtotal: number;
    shipping: number;
    tax: number;
    orderDate: string;
    estimatedDelivery: string;
    updatedAt: string;
    paymentMethod: { type: string };
  };
};

export function useAdminOrder(orderId?: string) {
  return useQuery({
    queryKey: ["admin", "orders", orderId],

    queryFn: async () => {
      const data = await apiClient<OrderResponse>(
        `/api/admin/orders/${orderId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      return data.order;
    },

    enabled: Boolean(orderId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });
}