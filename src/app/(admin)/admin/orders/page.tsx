"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Loader2,
  Package,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Timer,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import { OrdersSkeleton } from "./skeleton";
import { AdminOrder, OrderStatus, useAdminOrders } from "@/packages/query/src/hooks/adminOrders/useAdminOrders";
import { useUpdateOrderStatus } from "@/packages/query/src/hooks/adminOrders/useUpdateOrderStatus";

type StatusFilter = "all" | OrderStatus;

const ORDER_LIMIT = 12;

const statusLabel: Record<OrderStatus, string> = {
  pending: "নতুন",
  processing: "প্রসেসিং",
  shipped: "পাঠানো",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল",
};

function statusPill(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "shipped":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function statusIcon(status: OrderStatus) {
  if (status === "pending") return <Timer className="h-3.5 w-3.5" />;
  if (status === "processing") return <Truck className="h-3.5 w-3.5" />;
  if (status === "shipped") return <Package className="h-3.5 w-3.5" />;
  if (status === "delivered") return <BadgeCheck className="h-3.5 w-3.5" />;
  return <XCircle className="h-3.5 w-3.5" />;
}

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString("bn-BD")}`;
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function customerName(order: AdminOrder) {
  return `${order.shippingAddress?.firstName || ""} ${
    order.shippingAddress?.lastName || ""
  }`.trim() || "কাস্টমার";
}

function itemCount(order: AdminOrder) {
  return (
    order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
    order.items?.length ||
    0
  );
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const debouncedSearch = useMemo(() => searchTerm.trim(), [searchTerm]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAdminOrders({
    page,
    search: debouncedSearch,
    status: statusFilter,
    limit: ORDER_LIMIT,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;
  const totalOrders = data?.total || 0;

  const hasActiveFilters = Boolean(searchTerm.trim()) || statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPage(1);
  };

  const handleStatusChange = async (
    order: AdminOrder,
    nextStatus: OrderStatus
  ) => {
    if (order.status === nextStatus) return;

    try {
      setBusyOrderId(order._id);

      await updateStatusMutation.mutateAsync({
        orderId: order._id,
        status: nextStatus,
      });
    } catch (error: any) {
      alert(error?.message || "অর্ডার আপডেট করা যায়নি");
    } finally {
      setBusyOrderId(null);
    }
  };

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 pb-10 md:p-6">
      {/* Filters */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-600">
              <Search className="h-4 w-4" />
              অর্ডার খুঁজুন
            </label>

            <input
              type="text"
              placeholder="অর্ডার নম্বর, নাম অথবা ফোন লিখুন"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#207b95] focus:ring-4 focus:ring-[#207b95]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-600">
              <Filter className="h-4 w-4" />
              স্ট্যাটাস
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-[#207b95] focus:ring-4 focus:ring-[#207b95]/10"
            >
              <option value="all">সব অর্ডার</option>
              <option value="pending">নতুন</option>
              <option value="processing">প্রসেসিং</option>
              <option value="shipped">পাঠানো</option>
              <option value="delivered">ডেলিভারড</option>
              <option value="cancelled">বাতিল</option>
            </select>
          </div>

          <div className="flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                ক্লিয়ার
              </button>
            )}

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl bg-[#207b95] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#17687f] disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              রিফ্রেশ
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500">
          <span>মোট {totalOrders}টি অর্ডার</span>

          {isFetching && (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              আপডেট হচ্ছে...
            </span>
          )}
        </div>
      </section>

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          অর্ডার লোড করা যায়নি। আবার চেষ্টা করুন।
        </div>
      )}

      {/* Empty */}
      {!isError && orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-lg font-black text-slate-900">
            কোনো অর্ডার পাওয়া যায়নি
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              ফিল্টার ক্লিয়ার করুন
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">অর্ডার</th>
                  <th className="px-5 py-4">কাস্টমার</th>
                  <th className="px-5 py-4">আইটেম</th>
                  <th className="px-5 py-4">টাকা</th>
                  <th className="px-5 py-4">তারিখ</th>
                  <th className="px-5 py-4">স্ট্যাটাস</th>
                  <th className="px-5 py-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const rowBusy =
                    busyOrderId === order._id ||
                    updateStatusMutation.isPending;

                  return (
                    <tr key={order._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-black text-slate-950">
                          #{order.orderNumber}
                        </div>

                        {order.consignmentId && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            <Truck className="h-3 w-3" />
                            {order.consignmentId}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {customerName(order)}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          {order.shippingAddress?.phone || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {itemCount(order)} টি
                      </td>

                      <td className="px-5 py-4 font-black text-slate-950">
                        {money(order.total)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusPill(
                              order.status
                            )}`}
                          >
                            {statusIcon(order.status)}
                            {statusLabel[order.status]}
                          </span>

                          <select
                            value={order.status}
                            onChange={(event) =>
                              handleStatusChange(
                                order,
                                event.target.value as OrderStatus
                              )
                            }
                            disabled={rowBusy}
                            className="block w-32 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#207b95]/10 disabled:opacity-60"
                          >
                            <option value="pending">নতুন</option>
                            <option value="processing">প্রসেসিং</option>
                            <option value="shipped">পাঠানো</option>
                            <option value="delivered">ডেলিভারড</option>
                            <option value="cancelled">বাতিল</option>
                          </select>

                          {rowBusy && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              হচ্ছে...
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                          দেখুন
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {orders.map((order) => {
              const cardBusy =
                busyOrderId === order._id || updateStatusMutation.isPending;

              return (
                <article
                  key={order._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500">
                        অর্ডার
                      </p>
                      <h2 className="mt-1 truncate text-lg font-black text-slate-950">
                        #{order.orderNumber}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusPill(
                        order.status
                      )}`}
                    >
                      {statusIcon(order.status)}
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="font-bold">{customerName(order)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{order.shippingAddress?.phone || "—"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">আইটেম</p>
                      <p className="mt-1 font-black text-slate-950">
                        {itemCount(order)} টি
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">মোট টাকা</p>
                      <p className="mt-1 flex items-center gap-1 font-black text-slate-950">
                        <Banknote className="h-4 w-4" />
                        {money(order.total)}
                      </p>
                    </div>
                  </div>

                  {order.consignmentId && (
                    <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      <Truck className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{order.consignmentId}</span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        handleStatusChange(
                          order,
                          event.target.value as OrderStatus
                        )
                      }
                      disabled={cardBusy}
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#207b95]/10 disabled:opacity-60"
                    >
                      <option value="pending">নতুন</option>
                      <option value="processing">প্রসেসিং</option>
                      <option value="shipped">পাঠানো</option>
                      <option value="delivered">ডেলিভারড</option>
                      <option value="cancelled">বাতিল</option>
                    </select>

                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      দেখুন
                    </Link>
                  </div>

                  {cardBusy && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      আপডেট হচ্ছে...
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <p className="text-sm font-bold text-slate-600">
            পেজ {currentPage} / {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              আগের
            </button>

            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              পরের
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}