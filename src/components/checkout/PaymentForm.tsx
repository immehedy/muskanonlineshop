export default function PaymentForm({
    paymentMethod,
    setPaymentMethod,
    onBack,
    onNext,
    isValid,
  }: any) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
  
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
            <input
              type="radio"
              name="paymentType"
              value="bkash"
              disabled
            />
            <span>Bkash (Unavailable)</span>
          </label>
          <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
            <input
              type="radio"
              name="paymentType"
              value="nagad"
              disabled
            />
            <span>Nagad (Unavailable)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="paymentType"
              value="cod"
              checked={paymentMethod.type === 'cod'}
              onChange={() => setPaymentMethod({ ...paymentMethod, type: 'cod' })}
            />
            <span>Cash on Delivery</span>
          </label>
          <p className="text-sm text-gray-500 ml-6">Currently only Cash on Delivery is available.</p>
        </div>
  
        <div className="flex gap-4 mt-6">
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!isValid}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Review Order
          </button>
        </div>
      </div>
    );
  }
  