export default function PaymentForm({
  paymentMethod,
  setPaymentMethod,
  onBack,
  onNext,
  isValid,
}: any) {
  const methods = [
    { id: "bkash", label: "বিকাশ", available: false },
    { id: "nagad", label: "নগদ", available: false },
    { id: "cod", label: "ক্যাশ অন ডেলিভারি", available: true },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/60 md:p-5">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">পেমেন্ট মেথড</h2>
        <p className="mt-1 text-sm text-gray-500">
          আপনার সুবিধামতো পেমেন্ট অপশন নির্বাচন করুন
        </p>
      </div>

      <div className="mb-5 space-y-3">
        {methods.map((method) => {
          const isSelected = paymentMethod?.type === method.id;

          return (
            <label
              key={method.id}
              className={[
                "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition",
                method.available
                  ? "border-gray-200 bg-gray-50 hover:border-[#207b95]/40 hover:bg-white"
                  : "cursor-not-allowed border-gray-200 bg-gray-100 opacity-60",
                isSelected &&
                  "border-[#207b95] bg-[#207b95]/5 ring-2 ring-[#207b95]/10",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentType"
                  value={method.id}
                  disabled={!method.available}
                  checked={isSelected}
                  onChange={() =>
                    setPaymentMethod({ ...paymentMethod, type: method.id })
                  }
                  className="h-4 w-4 accent-[#207b95]"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {method.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {method.available
                      ? "বর্তমানে এই পেমেন্ট মেথডটি চালু আছে"
                      : "বর্তমানে এই পেমেন্ট মেথডটি বন্ধ আছে"}
                  </p>
                </div>
              </div>

              {!method.available && (
                <span className="rounded-full bg-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-500">
                  বন্ধ
                </span>
              )}

              {method.available && isSelected && (
                <span className="rounded-full bg-[#207b95] px-2 py-1 text-[11px] font-semibold text-white">
                  নির্বাচিত
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div className="mb-5 rounded-xl bg-[#207b95]/5 p-3 text-sm text-[#207b95]">
        আপাতত শুধুমাত্র ক্যাশ অন ডেলিভারি পেমেন্ট চালু আছে।
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          পিছনে যান
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="h-11 flex-1 rounded-xl bg-[#207b95] px-5 text-sm font-bold text-white shadow-md shadow-[#207b95]/25 transition hover:bg-[#1b6a80] disabled:cursor-not-allowed disabled:opacity-50"
        >
          অর্ডার রিভিউ করুন
        </button>
      </div>
    </div>
  );
}