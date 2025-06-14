
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { unlockPremiumMatches } from "@/lib/api-match";
import { useQueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_AMOUNT = 3900; // 39 INR in paise

export const useRazorpayPayment = (onSuccess: () => void) => {
  const [isPaying, setIsPaying] = useState(false);
  const queryClient = useQueryClient();

  const startPayment = () => {
    setIsPaying(true);
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: RAZORPAY_AMOUNT,
      currency: "INR",
      name: "UnderCover Premium Matches",
      description: "Unlock all 10 premium matches immediately.",
      image: "/lovable-uploads/UnderKover_logo2.png",
      handler: async function (response: any) {
        toast({ title: "Payment successful!", description: "Unlocking premium matches..." });
        try {
          await unlockPremiumMatches();
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            toast({ title: "Premium Unlocked!", description: "You can now view up to 10 matches." });
            onSuccess();
          }, 300);
        } catch (e) {
          toast({ variant: "destructive", title: "Error", description: "Unlock failed. Contact support." });
        }
      },
      prefill: {},
      theme: { color: "#7c3aed" }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        toast({ variant: "destructive", title: "Payment failed", description: "Try again or use a different method." });
      });
      rzp.open();
    } else {
      toast({ variant: "destructive", title: "Razorpay not loaded", description: "Please refresh and try again." });
    }
    setIsPaying(false);
  };

  return { isPaying, startPayment };
};
