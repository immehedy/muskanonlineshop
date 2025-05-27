export default function StepIndicator({ step }: { step: number }) {
    const steps = [
      { num: 1, label: 'Shipping' },
      { num: 2, label: 'Payment' },
      { num: 3, label: 'Review' }
    ];
  
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((stepInfo, index) => (
          <div key={stepInfo.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 md:w-12 h-8 md:h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  step >= stepInfo.num
                    ? step === stepInfo.num
                      ? 'bg-gradient-to-tr from-blue-600 to-blue-400 scale-110'
                      : 'bg-gradient-to-tr from-green-500 to-green-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                } text-white font-semibold text-lg`}
              >
                {stepInfo.num}
              </div>
              <span className="mt-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide">
                {stepInfo.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 md:w-16 h-1 bg-gray-300 dark:bg-gray-600 mx-2 rounded-full" />
            )}
          </div>
        ))}
      </div>
    );
  }
  