"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CalendarDays,
  CreditCard,
  Home,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  ShieldAlert,
  ShoppingBag,
  Tag,
  Timer,
  Truck,
  Weight,
  XCircle,
} from "lucide-react";
import { OrderDetailsSkeleton } from "./skeleton";
import { useAdminOrder } from "@/packages/query/src/hooks/adminOrders/useAdminOrder";
import {
  useCancelCarryBee,
  useDispatchCarryBee,
  useUpdateOrder,
} from "@/packages/query/src/hooks/adminOrders/useOrderActions";
import {
  AdminOrder,
  OrderStatus,
} from "@/packages/query/src/hooks/adminOrders/useAdminOrders";

type Params = { id?: string };

function money(value: number) {
  return `৳${Number(value || 0).toFixed(2)}`;
}

function safeDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("bn-BD");
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: "অপেক্ষমান",
    processing: "প্রসেসিং",
    shipped: "পাঠানো হয়েছে",
    delivered: "ডেলিভারড",
    cancelled: "বাতিল",
  };

  return map[status] || status;
}

function paymentText(status: string) {
  const map: Record<string, string> = {
    pending: "পেমেন্ট বাকি",
    paid: "পেইড",
    failed: "ব্যর্থ",
    refunded: "রিফান্ডেড",
  };

  return map[status] || status;
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "processing":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "shipped":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function paymentBadge(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "failed":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "refunded":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}

function statusIcon(status: string) {
  if (status === "pending") return <Timer className="h-4 w-4" />;
  if (status === "processing")
    return <Loader2 className="h-4 w-4 animate-spin" />;
  if (status === "shipped") return <Truck className="h-4 w-4" />;
  if (status === "delivered") return <BadgeCheck className="h-4 w-4" />;
  if (status === "cancelled") return <ShieldAlert className="h-4 w-4" />;

  return <Package className="h-4 w-4" />;
}

export default function OrderDetailsPage() {
  const params = useParams() as Params;
  const orderId = params?.id;

  const [itemWeight, setItemWeight] = useState(500);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data: order, isLoading, isError } = useAdminOrder(orderId);

  const updateOrder = useUpdateOrder();
  const dispatchCarryBee = useDispatchCarryBee();
  const cancelCarryBee = useCancelCarryBee();

  const normalizedItemWeight = useMemo(() => {
    return itemWeight > 0 ? itemWeight : 500;
  }, [itemWeight]);

  const isCarryBeeDispatched = useMemo(() => {
    const provider = (order?.deliveryProvider || "").toLowerCase();

    return (
      (provider.includes("carry") || provider === "carrybee") &&
      Boolean(order?.consignmentId)
    );
  }, [order?.deliveryProvider, order?.consignmentId]);

  const hardBusy =
    updateOrder.isPending ||
    dispatchCarryBee.isPending ||
    cancelCarryBee.isPending;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderId || !order || order.status === newStatus) return;

    if (newStatus === "cancelled") {
      setShowCancel(true);
      return;
    }

    try {
      const result = await updateOrder.mutateAsync({
        orderId,
        status: newStatus,
      });

      if (newStatus === "processing") {
        await dispatchCarryBee.mutateAsync({
          orderId,
          order: (result.order || order) as AdminOrder,
          item_weight: normalizedItemWeight,
        });

        alert("অর্ডারটি সফলভাবে CarryBee-তে পাঠানো হয়েছে।");
      }
    } catch (error: any) {
      alert(error?.message || "অর্ডার স্ট্যাটাস আপডেট করা যায়নি");
    }
  };

  const confirmCancel = async () => {
    if (!orderId) return;

    const reason = cancelReason.trim() || "Cancelled by admin";

    try {
      if (isCarryBeeDispatched) {
        await cancelCarryBee.mutateAsync({
          orderId,
          cancellation_reason: reason,
        });
      }

      await updateOrder.mutateAsync({
        orderId,
        status: "cancelled",
      });

      setShowCancel(false);
      setCancelReason("");
    } catch (error: any) {
      alert(error?.message || "অর্ডার বাতিল করা যায়নি");
    }
  };

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5" />

            <div>
              <div className="font-bold">অর্ডার লোড করা যায়নি</div>
              <div className="text-sm">অর্ডার পাওয়া যায়নি অথবা API সমস্যা হয়েছে।</div>

              <Link
                href="/admin/orders"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
              >
                <ArrowLeft className="h-4 w-4" />
                অর্ডার পেজে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const customerName = `${order.shippingAddress?.firstName || ""} ${
    order.shippingAddress?.lastName || ""
  }`.trim();

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 pb-8 md:space-y-5 md:p-6">
      {/* Top Bar */}
      <section className="sticky top-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur md:rounded-3xl md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              ফিরে যান
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black text-slate-950 md:text-xl">
                #{order.orderNumber}
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusBadge(
                  order.status
                )}`}
              >
                {statusIcon(order.status)}
                {statusText(order.status)}
              </span>

              {order.consignmentId && (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  <Tag className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{order.consignmentId}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[130px_1fr_auto] lg:flex lg:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Weight className="h-4 w-4 text-slate-500" />
              <input
                type="number"
                min={1}
                value={itemWeight}
                onChange={(e) =>
                  setItemWeight(Math.max(1, Number(e.target.value || 500)))
                }
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none sm:w-16"
              />
              <span className="text-xs text-slate-500">gm</span>
            </div>

            <select
              value={order.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as OrderStatus)
              }
              disabled={hardBusy}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none disabled:opacity-60"
            >
              <option value="pending">অপেক্ষমান</option>
              <option value="processing">প্রসেসিং + ডিসপ্যাচ</option>
              <option value="shipped">পাঠানো হয়েছে</option>
              <option value="delivered">ডেলিভারড</option>
              <option value="cancelled">বাতিল</option>
            </select>

            {order.status !== "cancelled" && (
              <button
                onClick={() => setShowCancel(true)}
                disabled={hardBusy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                বাতিল করুন
              </button>
            )}
          </div>
        </div>

        {hardBusy && (
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            অর্ডার আপডেট হচ্ছে...
          </div>
        )}
      </section>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => !hardBusy && setShowCancel(false)}
            aria-label="Close"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl">
            <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
              <Ban className="h-5 w-5 text-rose-600" />
              অর্ডার বাতিল করুন
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              যদি অর্ডারটি CarryBee-তে পাঠানো হয়ে থাকে, তাহলে কনসাইনমেন্টও বাতিল হবে।
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="বাতিলের কারণ লিখুন"
              className="mt-4 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-slate-900/10"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCancel(false)}
                disabled={hardBusy}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                ফিরে যান
              </button>

              <button
                onClick={confirmCancel}
                disabled={hardBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {hardBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority Information */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="কাস্টমার তথ্য" icon={<BadgeCheck className="h-5 w-5" />}>
          <div className="space-y-3 text-sm text-slate-700">
            <Info
              icon={<BadgeCheck className="h-4 w-4" />}
              value={customerName || "কাস্টমার"}
            />
            <Info
              icon={<Phone className="h-4 w-4" />}
              value={order.shippingAddress?.phone || "—"}
            />
            <Info
              icon={<Mail className="h-4 w-4" />}
              value={order.shippingAddress?.email || "—"}
            />
          </div>
        </Card>

        <Card title="ডেলিভারি ঠিকানা" icon={<Home className="h-5 w-5" />}>
          <div className="flex items-start gap-2 text-sm text-slate-700">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div className="min-w-0">
              <div>{order.shippingAddress?.address}</div>
              <div>
                {order.shippingAddress?.city}
                {order.shippingAddress?.zipCode
                  ? `, ${order.shippingAddress.zipCode}`
                  : ""}
              </div>
              <div>{order.shippingAddress?.country}</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Product + Desktop Side Info */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="পণ্যের তথ্য" icon={<ShoppingBag className="h-5 w-5" />}>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 md:p-4"
                >
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 md:h-20 md:w-20">
                      {item.product?.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0].url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950 md:text-base">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                        {(item.sku || item.product?.sku) && (
                          <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">
                            SKU: {item.sku || item.product.sku}
                          </span>
                        )}

                        <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">
                          পরিমাণ: {item.quantity}
                        </span>

                        <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">
                          একক মূল্য: {money(item.price)}
                        </span>
                      </div>
                    </div>

                    <div className="hidden shrink-0 text-right text-sm font-black text-slate-950 sm:block">
                      {money(item.price * item.quantity)}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm sm:hidden">
                    <span className="font-semibold text-slate-500">মোট</span>
                    <span className="font-black text-slate-950">
                      {money(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="lg:hidden">
            <OrderSummaryCard order={order} />
          </div>

          <Card
            title="অর্ডার টাইমলাইন"
            icon={<CalendarDays className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <TimelineRow
                color="bg-emerald-500"
                title="অর্ডার করা হয়েছে"
                subtitle={safeDate(order.orderDate || order.createdAt)}
              />

              {order.status !== "pending" && (
                <TimelineRow
                  color="bg-blue-500"
                  title="স্ট্যাটাস আপডেট হয়েছে"
                  subtitle={safeDate(order.updatedAt)}
                />
              )}

              <TimelineRow
                color="bg-slate-300"
                title="সম্ভাব্য ডেলিভারি"
                subtitle={safeDate(order.estimatedDelivery)}
              />
            </div>
          </Card>
        </div>

        <div className="hidden space-y-5 lg:block">
          <OrderSummaryCard order={order} />

          <Card title="পেমেন্ট তথ্য" icon={<CreditCard className="h-5 w-5" />}>
            <div className="space-y-3 text-sm text-slate-700">
              <Row
                label="মেথড"
                value={order.paymentMethod?.type || "উল্লেখ নেই"}
              />

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600">স্ট্যাটাস</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${paymentBadge(
                    order.paymentStatus
                  )}`}
                >
                  {paymentText(order.paymentStatus)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="ডেলিভারি তথ্য" icon={<Truck className="h-5 w-5" />}>
            <div className="space-y-3 text-sm text-slate-700">
              <Row
                label="প্রোভাইডার"
                value={order.deliveryProvider || "লোকাল / নির্ধারিত নয়"}
              />
              <Row label="কনসাইনমেন্ট" value={order.consignmentId || "—"} />
              <Row label="ওজন" value={`${normalizedItemWeight.toString()} gm`} />
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-5 lg:hidden">
        <Card title="পেমেন্ট তথ্য" icon={<CreditCard className="h-5 w-5" />}>
          <div className="space-y-3 text-sm text-slate-700">
            <Row
              label="মেথড"
              value={order.paymentMethod?.type || "উল্লেখ নেই"}
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-600">স্ট্যাটাস</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${paymentBadge(
                  order.paymentStatus
                )}`}
              >
                {paymentText(order.paymentStatus)}
              </span>
            </div>
          </div>
        </Card>

        <Card title="ডেলিভারি তথ্য" icon={<Truck className="h-5 w-5" />}>
          <div className="space-y-3 text-sm text-slate-700">
            <Row
              label="প্রোভাইডার"
              value={order.deliveryProvider || "লোকাল / নির্ধারিত নয়"}
            />
            <Row label="কনসাইনমেন্ট" value={order.consignmentId || "—"} />
            <Row label="ওজন" value={`${normalizedItemWeight.toString()} gm`} />
          </div>
        </Card>
      </section>
    </div>
  );
}

function OrderSummaryCard({ order }: { order: any }) {
  return (
    <Card title="অর্ডার সামারি" icon={<Receipt className="h-5 w-5" />}>
      <div className="space-y-2 text-sm">
        <Row label="সাবটোটাল" value={money(order.subtotal)} />
        <Row label="শিপিং" value={money(order.shipping)} />
        <Row label="ট্যাক্স" value={money(order.tax)} />

        <div className="my-3 border-t border-dashed border-slate-200" />

        <Row
          label={<span className="font-black text-slate-950">সর্বমোট</span>}
          value={
            <span className="text-lg font-black text-[#207b95]">
              {money(order.total)}
            </span>
          }
        />
      </div>
    </Card>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
      <h2 className="mb-4 inline-flex items-center gap-2 text-base font-black text-slate-950">
        {icon}
        {title}
      </h2>

      {children}
    </section>
  );
}

function Info({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-slate-500">{icon}</span>
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-slate-600">{label}</div>
      <div className="text-right font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function TimelineRow({
  color,
  title,
  subtitle,
}: {
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-2 h-2.5 w-2.5 rounded-full ${color}`} />
      <div>
        <div className="text-sm font-bold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}