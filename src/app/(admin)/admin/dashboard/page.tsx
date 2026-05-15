"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Boxes,
  ClipboardList,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Timer,
  Truck,
} from "lucide-react";
import { DashboardStats, useDashboardStats } from "@/packages/query/src/hooks/dashboard/useDashboardStats";
import { RecentOrder, useRecentOrders } from "@/packages/query/src/hooks/dashboard/useRecentOrders";
import { DashboardSkeleton } from "./skeleton";

const fallbackStats: DashboardStats = {
  totalOrders: 0,
  averageOrderValue: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  processingOrders: 0,
};

const statusText: Record<RecentOrder["status"], string> = {
  pending: "অপেক্ষমান",
  processing: "প্রসেসিং",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল",
};

const paymentText: Record<RecentOrder["paymentStatus"], string> = {
  pending: "পেমেন্ট বাকি",
  paid: "পেইড",
  failed: "ব্যর্থ",
  refunded: "রিফান্ডেড",
};

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString("bn-BD")}`;
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusBadge(status: RecentOrder["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "processing":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "shipped":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

function paymentBadge(status: RecentOrder["paymentStatus"]) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "failed":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "refunded":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

function statusIcon(status: RecentOrder["status"]) {
  if (status === "pending") return <Timer className="h-3.5 w-3.5" />;
  if (status === "processing")
    return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  if (status === "shipped") return <Truck className="h-3.5 w-3.5" />;
  if (status === "delivered") return <BadgeCheck className="h-3.5 w-3.5" />;
  return <Package className="h-3.5 w-3.5" />;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "slate",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone?: "slate" | "amber" | "sky" | "emerald";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [q, setQ] = useState("");

  const {
    data: stats = fallbackStats,
    isLoading: statsLoading,
    isError: statsError,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: recentOrders = [],
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    refetch: refetchOrders,
  } = useRecentOrders();

  const urgentCount = stats.pendingOrders + stats.processingOrders;

  const filteredOrders = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return recentOrders;

    return recentOrders.filter((order) => {
      const customerName = `${order.shippingAddress?.firstName || ""} ${
        order.shippingAddress?.lastName || ""
      }`.toLowerCase();

      return (
        order.orderNumber?.toLowerCase().includes(search) ||
        customerName.includes(search) ||
        order.shippingAddress?.email?.toLowerCase().includes(search)
      );
    });
  }, [q, recentOrders]);

  const isPageLoading = statsLoading || ordersLoading;
  const refreshing = statsFetching || ordersFetching;

  const refreshAll = () => {
    refetchStats();
    refetchOrders();
  };

  if (isPageLoading) {
    return <DashboardSkeleton />;
  }

  if (statsError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="text-lg font-black text-rose-900">
          তথ্য লোড করা যায়নি
        </h2>
        <p className="mt-1 text-sm text-rose-700">
          ড্যাশবোর্ড API থেকে ডেটা আসছে না।
        </p>
        <button
          onClick={refreshAll}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="text-lg font-black text-rose-900">
          তথ্য লোড করা যায়নি
        </h2>
        <p className="mt-1 text-sm text-rose-700">
          ড্যাশবোর্ড API থেকে ডেটা আসছে না।
        </p>
        <button
          onClick={refreshAll}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[#207b95] p-5 text-white shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-white/75">
              অ্যাডমিন ড্যাশবোর্ড
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight md:text-4xl">
              অর্ডার ও সেলস ওভারভিউ
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              পেন্ডিং অর্ডার, প্রসেসিং কিউ এবং সাম্প্রতিক অর্ডার দ্রুত দেখুন।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#207b95] transition hover:bg-slate-100"
            >
              <ClipboardList className="h-4 w-4" />
              সব অর্ডার
            </Link>

            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              রিফ্রেশ
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-xs font-semibold text-white/70">
              দ্রুত নজর দরকার
            </p>
            <p className="mt-1 text-2xl font-black">{urgentCount}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-xs font-semibold text-white/70">মোট রেভিনিউ</p>
            <p className="mt-1 text-2xl font-black">
              {money(stats.totalRevenue)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-xs font-semibold text-white/70">
              গড় অর্ডার ভ্যালু
            </p>
            <p className="mt-1 text-2xl font-black">
              {money(stats.averageOrderValue)}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="পেন্ডিং"
          value={String(stats.pendingOrders)}
          subtitle="রিভিউ দরকার"
          icon={<Package className="h-5 w-5" />}
          tone="amber"
        />

        <StatCard
          title="প্রসেসিং"
          value={String(stats.processingOrders)}
          subtitle="ডিসপ্যাচ কিউ"
          icon={<Boxes className="h-5 w-5" />}
          tone="sky"
        />

        <StatCard
          title="মোট অর্ডার"
          value={String(stats.totalOrders)}
          subtitle="সব সময়ের হিসাব"
          icon={<ShoppingCart className="h-5 w-5" />}
        />

        <StatCard
          title="রেভিনিউ"
          value={money(stats.totalRevenue)}
          subtitle={`গড়: ${money(stats.averageOrderValue)}`}
          icon={<Banknote className="h-5 w-5" />}
          tone="emerald"
        />
      </section>

      {/* Content */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                সাম্প্রতিক অর্ডার
              </h2>
              <p className="text-sm text-slate-500">
                শেষ {recentOrders.length}টি অর্ডার
              </p>
            </div>

            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="অর্ডার / কাস্টমার / ইমেইল..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-[#207b95] focus:bg-white focus:ring-4 focus:ring-[#207b95]/10"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {ordersLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 py-12 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                অর্ডার লোড হচ্ছে...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <Package className="mx-auto h-9 w-9 text-slate-400" />
                <p className="mt-3 font-bold text-slate-800">
                  কোনো অর্ডার পাওয়া যায়নি
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const name = `${order.shippingAddress?.firstName || ""} ${
                  order.shippingAddress?.lastName || ""
                }`.trim();

                const itemCount =
                  order.items?.reduce(
                    (total, item) => total + (item.quantity || 0),
                    0
                  ) || 0;

                return (
                  <Link
                    key={order._id}
                    href={`/admin/orders/${order._id}`}
                    className="group block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#207b95]/30 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-slate-950">
                            #{order.orderNumber}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusBadge(
                              order.status
                            )}`}
                          >
                            {statusIcon(order.status)}
                            {statusText[order.status]}
                          </span>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${paymentBadge(
                              order.paymentStatus
                            )}`}
                          >
                            {paymentText[order.paymentStatus]}
                          </span>
                        </div>

                        <p className="mt-2 truncate text-sm font-semibold text-slate-700">
                          {name || "কাস্টমার"}
                          {order.shippingAddress?.email ? (
                            <span className="font-normal text-slate-500">
                              {" "}
                              · {order.shippingAddress.email}
                            </span>
                          ) : null}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                            {itemCount} আইটেম
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                            {money(order.total)}
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                            {dateTime(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-[#207b95] group-hover:text-white">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
            >
              সব অর্ডার দেখুন
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              দ্রুত অ্যাকশন
            </h2>
            <p className="text-sm text-slate-500">প্রতিদিনের কাজগুলো</p>

            <div className="mt-4 grid gap-3">
              <Link
                href="/admin/orders?status=pending"
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-amber-200 hover:bg-amber-50"
              >
                <p className="font-black text-slate-950">পেন্ডিং রিভিউ</p>
                <p className="mt-1 text-xs text-slate-500">
                  অপেক্ষমান অর্ডার প্রসেস করুন
                </p>
              </Link>

              <Link
                href="/admin/orders?status=processing"
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50"
              >
                <p className="font-black text-slate-950">প্রসেসিং কিউ</p>
                <p className="mt-1 text-xs text-slate-500">
                  ডিসপ্যাচ ও কুরিয়ার ফলোআপ
                </p>
              </Link>

              <Link
                href="/admin/users"
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-[#207b95]/30 hover:bg-[#207b95]/5"
              >
                <p className="font-black text-slate-950">ইউজার ম্যানেজমেন্ট</p>
                <p className="mt-1 text-xs text-slate-500">
                  ইউজার দেখুন ও যোগ করুন
                </p>
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}