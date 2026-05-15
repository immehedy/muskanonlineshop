import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import type { AdminOrder, OrderStatus } from "./useAdminOrders";

type UpdateInput = {
  orderId: string;
  status: OrderStatus;
};

type UpdateResponse = {
  order?: AdminOrder;
};

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: UpdateInput) => {
      return apiClient<UpdateResponse>(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ status }),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });
}