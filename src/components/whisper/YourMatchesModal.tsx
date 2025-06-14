import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchMatches, unlockPremiumMatches } from "@/lib/api-match";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MatchProfile } from "@/types/match";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import LockedMatchCard from "./LockedMatchCard";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface YourMatchesModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  requireProfileEdit?: () => void;
}

const YourMatchesModal: React.FC<YourMatchesModalProps> = ({ open, onOpenChange, requireProfileEdit }) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Remove local 'premiumUnlocked'. Only trust backend flag.
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["matches", page],
    queryFn: () => fetchMatches(page),
    enabled: open,
    retry: false,
  });

  // Razorpay hook, calling refetch on payment success
  const { isPaying, startPayment } = useRazorpayPayment(() => refetch());

  useEffect(() => {
    if (
      isError &&
      error &&
      (error as any).response &&
      (error as any).response.status === 400 &&
      (error as any).response.data &&
      ((error as any).response.data.message || "").includes("gender")
    ) {
      onOpenChange(false);
      if (requireProfileEdit) requireProfileEdit();
    }
  }, [isError, error, requireProfileEdit, onOpenChange]);

  let errorMsg: string | null = null;
  if (isError && error) {
    if (
      (error as any).response &&
      (error as any).response.status === 400 &&
      (error as any).response.data &&
      ((error as any).response.data.message || "").includes("gender")
    ) {
      errorMsg = "Please complete your profile with gender and interests to see matches.";
    } else {
      errorMsg = "Could not load matches.";
    }
  }

  // Always use backend 'isPremium' flag
  const isPremium = data && data.isPremium;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Your Matches</DialogTitle>
          <DialogDescription>
            View people you have been matched with.<br />
            Complete your interests and gender in profile for best results.
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-purple-600" />
          </div>
        )}

        {errorMsg && (
          <div className="text-red-500 text-center p-4">{errorMsg}</div>
        )}

        {data && (
          <>
            {data.matches.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No matches found. Please update your interests.
              </div>
            ) : (
              <div
                className={`grid gap-3 py-2 ${
                  data.matches.length <= 2 ? "grid-cols-1" : "sm:grid-cols-2"
                }`}
              >
                {(isPremium
                  ? data.matches.slice(0, 10)
                  : data.matches.slice(0, 3)
                ).map((profile: MatchProfile) => (
                  <button
                    key={profile._id}
                    className="block w-full text-left focus:outline-none"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/profile/${profile._id}`, {
                        state: { anonymousAlias: profile.anonymousAlias }
                      });
                    }}
                  >
                    <Card
                      className={`relative p-4 flex items-center gap-3 hover:bg-undercover-purple/10 transition-colors cursor-pointer`}
                    >
                      <div className="text-2xl sm:text-3xl">{profile.avatarEmoji}</div>
                      <div>
                        <div className="font-medium">{profile.anonymousAlias}</div>
                        <div className="text-xs text-gray-500">{profile.bio}</div>
                        <div className="text-xs text-gray-500">
                          Interests: {Array.isArray(profile.interests) && profile.interests.length > 0
                            ? profile.interests.join(", ")
                            : "Not specified"}
                        </div>
                        <div className="text-xs">
                          Gender: <span className="capitalize">{profile.gender || "N/A"}</span>
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
                {/* Display locked cards for non-premium users */}
                {!isPremium && data.matches.length > 3 &&
                  Array.from({length: Math.min(10, data.matches.length) - 3}).map((_, i) => (
                    <LockedMatchCard idx={i} key={`locked-${i}`} />
                  ))
                }
              </div>
            )}
            {/* Pagination */}
            <div className="flex gap-2 justify-between items-center mt-4">
              <Button
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                variant="outline"
              >
                Prev
              </Button>
              <span>Page {page}</span>
              <Button
                size="sm"
                disabled={data && (page * data.maxResults) >= data.total}
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
            {/* Premium Unlock Notice */}
            {!isPremium && data.total > 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center mt-6 space-y-2">
                <div className="text-yellow-500 font-semibold">
                  Unlock all matches for <span className="font-bold">₹39</span>
                </div>
                <Button
                  size="lg"
                  className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                  onClick={startPayment}
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
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YourMatchesModal;
