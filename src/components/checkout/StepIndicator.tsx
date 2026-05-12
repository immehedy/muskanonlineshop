import { Check } from "lucide-react";

export default function StepIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: "শিপিং" },
    { num: 2, label: "পেমেন্ট" },
    { num: 3, label: "রিভিউ" },
  ];

  return (
    <div className="mb-8 w-full">
      <div className="mx-auto flex max-w-lg items-start justify-between px-4">
        {steps.map((stepInfo, index) => {
          const isCompleted = step > stepInfo.num;
          const isActive = step === stepInfo.num;
          const isUpcoming = step < stepInfo.num;

          return (
            <div key={stepInfo.num} className="flex flex-1 items-start">
              <div className="relative flex min-w-16 flex-col items-center">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 md:h-12 md:w-12 md:text-base",
                    isCompleted &&
                      "border-[#207b95] bg-[#207b95] text-white shadow-md shadow-[#207b95]/25",
                    isActive &&
                      "scale-110 border-[#207b95] bg-[#207b95] text-white shadow-lg shadow-[#207b95]/30 ring-4 ring-[#207b95]/15",
                    isUpcoming &&
                      "border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : stepInfo.num}
                </div>

                <span
                  className={[
                    "mt-3 text-center text-xs font-semibold transition-colors md:text-sm",
                    isActive && "text-[#207b95]",
                    isCompleted && "text-[#207b95]",
                    isUpcoming && "text-gray-500 dark:text-gray-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {stepInfo.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="mx-2 mt-5 h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 md:mx-3 md:mt-6">
                  <div
                    className={[
                      "h-full rounded-full bg-[#207b95] transition-all duration-500",
                      step > stepInfo.num ? "w-full" : "w-0",
                    ].join(" ")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}