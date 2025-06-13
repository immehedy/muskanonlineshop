export default function ShippingForm({ shippingAddress, setShippingAddress, onNext, isValid }: any) {
    const handleChange = (field: string, value: string) => {
      setShippingAddress({ ...shippingAddress, [field]: value });
    };
  
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
  
        <form className="space-y-6">
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                value={shippingAddress.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
  
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                value={shippingAddress.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </fieldset>
  
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={shippingAddress.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
  
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              id="phone"
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
  
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              id="address"
              type="text"
              value={shippingAddress.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
  
          <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                id="city"
                type="text"
                value={shippingAddress.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
  
  
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                id="zipCode"
                type="text"
                value={shippingAddress.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </fieldset>
  
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              id="country"
              value={shippingAddress.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="BD">Bangladesh</option>
            </select>
          </div>
  
          <button
            type="button"
            onClick={onNext}
            disabled={!isValid}
            className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </button>
        </form>
      </div>
    );
  }
  