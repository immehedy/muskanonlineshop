export function ReviewOrder({
  shippingAddress,
  paymentMethod,
  onBack,
  onPlaceOrder,
  loading,
}: any) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/50">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          অর্ডার রিভিউ
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          অর্ডার কনফার্ম করার আগে তথ্য যাচাই করুন
        </p>
      </div>

      {/* Shipping */}
      <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">
            শিপিং তথ্য
          </h3>

          <span className="rounded-full bg-[#207b95]/10 px-2 py-0.5 text-[10px] font-semibold text-[#207b95]">
            Delivery
          </span>
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">
            {shippingAddress.firstName}{" "}
            {shippingAddress.lastName}
          </p>

          <p>{shippingAddress.phone}</p>

          <p className="line-clamp-1">
            {shippingAddress.address}
          </p>

          <p>
            {shippingAddress.city}
            {shippingAddress.zipCode &&
              `, ${shippingAddress.zipCode}`}
          </p>
        </div>
      </div>

      {/* Payment */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">
            পেমেন্ট
          </h3>

          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[#207b95]/10 bg-white px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              ক্যাশ অন ডেলিভারি
            </p>

            <p className="text-[11px] text-gray-500">
              ডেলিভারির সময় পেমেন্ট করুন
            </p>
          </div>

          <div className="h-2.5 w-2.5 rounded-full bg-[#207b95]" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          পিছনে
        </button>

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={loading}
          className="h-10 flex-1 rounded-xl bg-[#207b95] px-4 text-sm font-bold text-white shadow-md shadow-[#207b95]/20 transition hover:bg-[#1b6a80] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "প্রসেস হচ্ছে..."
            : "অর্ডার কনফার্ম"}
        </button>
      </div>
    </div>
  );
}