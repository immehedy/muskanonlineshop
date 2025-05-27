export function ReviewOrder({
    shippingAddress,
    paymentMethod,
    onBack,
    onPlaceOrder,
    loading,
  }: any) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
  
        {/* Shipping Address */}
        <div className="bg-white shadow-sm border border-gray-200 p-5 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Shipping Address</h3>
          <ul className="text-gray-700 space-y-1">
            <li>{shippingAddress.firstName} {shippingAddress.lastName}</li>
            <li>{shippingAddress.email}</li>
            <li>{shippingAddress.phone}</li>
            <li>{shippingAddress.address}</li>
            <li>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</li>
            <li>{shippingAddress.country}</li>
          </ul>
        </div>
  
        {/* Payment Method */}
        <div className="bg-white shadow-sm border border-gray-200 p-5 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Method</h3>
          <p className="text-gray-700">Cash on Delivery</p>
          <p className="text-sm text-gray-500 mt-1">You will pay in cash upon receiving your order.</p>
        </div>
  
        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Back
          </button>
          <button
            onClick={onPlaceOrder}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    );
  }
  