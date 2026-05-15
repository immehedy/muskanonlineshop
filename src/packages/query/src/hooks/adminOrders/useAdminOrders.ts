import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type AdminOrder = {
  _id: string;
  orderNumber: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  consignmentId?: string | null;
  deliveryProvider?: string | null;
};

type OrdersResponse = {
  orders?: AdminOrder[];
  data?: AdminOrder[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentPage?: number;
  totalPages?: number;
};

type UseAdminOrdersParams = {
  page: number;
  search?: string;
  status?: "all" | OrderStatus;
  limit?: number;
};

export function useAdminOrders({
  page,
  search = "",
  status = "all",
  limit = 12,
}: UseAdminOrdersParams) {
  return useQuery({
    queryKey: ["admin", "orders", { page, search, status, limit }],

    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: "createdAt",
        sortOrder: "desc",
        includeStats: "false",
      });

      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);

      const data = await apiClient<OrdersResponse>(
        `/api/admin/orders?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const orders = data.orders || data.data || [];
      const pagination = data.pagination;

      return {
        orders,
        page: pagination?.page || data.currentPage || page,
        totalPages: Math.max(
          1,
          pagination?.totalPages || data.totalPages || 1
        ),
        total: pagination?.total || orders.length,
      };
    },

    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });
}