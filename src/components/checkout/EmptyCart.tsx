import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyCart() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/60">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#207b95]/10">
          <ShoppingBag className="h-10 w-10 text-[#207b95]" />
        </div>

        {/* Content */}
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-gray-900">
            আপনার কার্ট খালি
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            এখনো কোনো পণ্য যোগ করা হয়নি। আপনার পছন্দের
            পণ্য নির্বাচন করে শপিং শুরু করুন।
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#207b95] px-5 text-sm font-bold text-white shadow-lg shadow-[#207b95]/25 transition hover:scale-[1.02] hover:bg-[#1b6a80]"
        >
          শপিং শুরু করুন
        </button>
      </div>
    </div>
  );
}