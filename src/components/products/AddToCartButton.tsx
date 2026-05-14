"use client";

import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

type OrderNowButtonProps = {
  product: any;
  disabled?: boolean;
  className?: string;
};

export default function OrderNowButton({
  product,
  disabled = false,
  className = "",
}: OrderNowButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleOrderNow = () => {
    setIsProcessing(true);

    addToCart(product, 1);

    if (typeof window !== "undefined") {
      const cartItems = useCartStore.getState().items;
      sessionStorage.setItem("cart", JSON.stringify(cartItems));
    }

    router.push("/checkout");
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={handleOrderNow}
        disabled={disabled || isProcessing}
        className={`
          group relative h-14 w-full overflow-hidden rounded-2xl
          border border-white/10
          bg-[#207b95]
          text-base font-bold text-white
          shadow-[0_10px_30px_rgba(32,123,149,0.35)]
          transition-all duration-300
          hover:bg-[#17687f]
          hover:shadow-[0_14px_40px_rgba(32,123,149,0.45)]
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:bg-slate-400
          disabled:shadow-none
          ${className}
        `}
      >
        {/* Shine Effect */}
        <span className="absolute inset-0 overflow-hidden rounded-2xl">
          <span
            className="
              absolute inset-y-0 -left-1/2 w-1/2
              skew-x-[-20deg]
              bg-gradient-to-r from-transparent via-white/20 to-transparent
              transition-transform duration-700
              group-hover:translate-x-[250%]
            "
          />
        </span>

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Order Now
            </>
          )}
        </span>
      </Button>
    </div>
  );
}