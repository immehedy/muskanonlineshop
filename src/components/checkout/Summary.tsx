export function OrderSummary({ cartItems, subtotal, shipping, tax, total }: any) {
    return (
      <aside className="bg-white border border-gray-200 rounded-xl p-6 shadow-md sticky top-4 w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
  
        {/* Cart Items */}
        <div className="space-y-5 mb-6">
          {cartItems.map((item: any) => {
            const currentPrice = item.product?.fields?.discountedPrice || item.price;
            const originalPrice = item.product?.fields?.price;
            const hasDiscount = originalPrice && currentPrice < originalPrice;
  
            return (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-gray-500">SKU: {item.product?.fields?.sku}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
  
                  <div className="mt-1">
                    {hasDiscount ? (
                      <>
                        <span className="line-through text-gray-400">৳{originalPrice}</span>
                        <span className="text-green-600 font-medium ml-2">৳{currentPrice}</span>
                      </>
                    ) : (
                      <span className="text-gray-800 font-medium">৳{currentPrice}</span>
                    )}
                  </div>
                </div>
                <div className="text-right font-semibold text-gray-800 whitespace-nowrap">
                  ৳{(currentPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
  
        {/* Totals */}
        <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>৳{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>৳{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>৳{total.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    );
  }
  