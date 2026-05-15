import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import type { AdminOrder, OrderStatus, PaymentStatus } from "./useAdminOrders";

type UpdateOrderInput = {
  orderId: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

type DispatchInput = {
  orderId: string;
  order: AdminOrder;
  item_weight: number;
};

type CancelInput = {
  orderId: string;
  cancellation_reason: string;
};

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, ...payload }: UpdateOrderInput) => {
      return apiClient<{ order: AdminOrder }>(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(payload),
      });
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders", variables.orderId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });
}

export function useDispatchCarryBee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DispatchInput) => {
      return apiClient("/api/admin/orders/carry_bee", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
      });
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders", variables.orderId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "orders"],
      });
    },
  });
}

export function useCancelCarryBee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CancelInput) => {
      return apiClient("/api/admin/orders/carry_bee", {
        method: "DELETE",
        credentials: "include",
        body: JSON.stringify(payload),
      });
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders", variables.orderId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });
}