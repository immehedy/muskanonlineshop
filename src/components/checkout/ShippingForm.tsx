export default function ShippingForm({
  shippingAddress,
  setShippingAddress,
  onNext,
  isValid,
}: any) {
  const handleChange = (field: string, value: string) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition focus:border-[#207b95] focus:bg-white focus:ring-3 focus:ring-[#207b95]/10";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/60 md:p-5">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">শিপিং ঠিকানা</h2>
        <p className="mt-1 text-sm text-gray-500">
          অর্ডার ডেলিভারির জন্য আপনার তথ্য দিন
        </p>
      </div>

      <form className="space-y-3">
        <fieldset className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              নামের প্রথম অংশ *
            </label>
            <input
              id="firstName"
              type="text"
              value={shippingAddress.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className={labelClass}>
              নামের শেষ অংশ *
            </label>
            <input
              id="lastName"
              type="text"
              value={shippingAddress.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelClass}>
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              value={shippingAddress.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={inputClass}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              মোবাইল নাম্বার *
            </label>
            <input
              id="phone"
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={inputClass}
              placeholder="01XXXXXXXXX"
              required
            />
          </div>
        </fieldset>

        <div>
          <label htmlFor="address" className={labelClass}>
            পূর্ণ ঠিকানা *
          </label>
          <input
            id="address"
            type="text"
            value={shippingAddress.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className={inputClass}
            placeholder="বাসা/রোড/এলাকা"
            required
          />
        </div>

        <fieldset className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="city" className={labelClass}>
              শহর *
            </label>
            <input
              id="city"
              type="text"
              value={shippingAddress.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={inputClass}
              placeholder="ঢাকা"
              required
            />
          </div>

          <div>
            <label htmlFor="zipCode" className={labelClass}>
              ZIP কোড
            </label>
            <input
              id="zipCode"
              type="text"
              value={shippingAddress.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              className={inputClass}
              placeholder="1207"
            />
          </div>

          <div>
            <label htmlFor="country" className={labelClass}>
              দেশ *
            </label>
            <select
              id="country"
              value={shippingAddress.country}
              onChange={(e) => handleChange("country", e.target.value)}
              className={inputClass}
              required
            >
              <option value="BD">বাংলাদেশ</option>
            </select>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="mt-2 h-11 w-full rounded-xl bg-[#207b95] px-5 text-sm font-bold text-white shadow-md shadow-[#207b95]/25 transition hover:bg-[#1b6a80] disabled:cursor-not-allowed disabled:opacity-50"
        >
          পেমেন্টে এগিয়ে যান
        </button>
      </form>
    </div>
  );
}