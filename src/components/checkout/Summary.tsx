export function OrderSummary({
  cartItems,
  subtotal,
  shipping,
  tax,
  total,
}: any) {
  const formatPrice = (value: number) =>
    `৳${Number(value || 0).toFixed(2)}`;

  return (
    <aside className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-400/30 lg:sticky lg:top-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#207b95] px-4 py-3 text-white lg:px-5 lg:py-4">
        <div>
          <h2 className="text-base font-bold lg:text-xl">
            অর্ডার সামারি
          </h2>

          <p className="text-xs text-white/80 lg:text-sm">
            {cartItems.length} টি পণ্য
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-white/80">সর্বমোট</p>

          <p className="text-lg font-extrabold lg:text-xl">
            {formatPrice(total)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5">
        {/* Cart Items */}
        <div className="mb-4 space-y-2 lg:space-y-3">
          {cartItems.map((item: any) => {
            const currentPrice =
              item.product?.fields?.discountedPrice || item.price;

            const originalPrice =
              item.product?.fields?.price;

            const hasDiscount =
              originalPrice &&
              currentPrice < originalPrice;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-xs font-semibold text-gray-900 lg:text-sm">
                      {item.title}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                      {item.product?.fields?.sku && (
                        <span className="rounded-full bg-white px-2 py-0.5">
                          SKU: {item.product.fields.sku}
                        </span>
                      )}

                      <span className="rounded-full bg-white px-2 py-0.5">
                        Qty: {item.quantity}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>

                          <span className="text-sm font-semibold text-[#207b95]">
                            {formatPrice(currentPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-gray-800">
                          {formatPrice(currentPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="whitespace-nowrap text-right">
                    <p className="text-[11px] text-gray-500">
                      মোট
                    </p>

                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(
                        currentPrice * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="space-y-2 rounded-xl bg-gray-50 p-3 text-xs lg:text-sm">
          <div className="flex justify-between text-gray-600">
            <span>সাবটোটাল</span>

            <span className="font-medium text-gray-800">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>শিপিং</span>

            <span className="font-medium text-gray-800">
              {shipping > 0
                ? formatPrice(shipping)
                : "ফ্রি"}
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>ট্যাক্স</span>

            <span className="font-medium text-gray-800">
              {formatPrice(tax)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-3">
            <span className="text-sm font-bold text-gray-900">
              সর্বমোট
            </span>

            <span className="text-xl font-extrabold text-[#207b95]">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}