
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PremiumUnlockBoxProps {
  onClick: () => void;
  isPaying: boolean;
}

const PremiumUnlockBox: React.FC<PremiumUnlockBoxProps> = ({ onClick, isPaying }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center mt-6 space-y-2">
    <div className="text-yellow-500 font-semibold">
      Unlock all matches for <span className="font-bold">₹39</span>
    </div>
    <Button
      size="lg"
      className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
      onClick={onClick}
      disabled={isPaying}
    >
      {isPaying ? (
        <>
          <Loader2 className="animate-spin mr-2" /> Processing...
        </>
      ) : (
        "Unlock Now"
      )}
    </Button>
    <p className="text-xs text-gray-600">See up to 10 matched users instantly!</p>
  </div>
);

export default PremiumUnlockBox;
