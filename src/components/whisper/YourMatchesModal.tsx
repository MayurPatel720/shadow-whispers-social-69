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
import MatchList from "./MatchList";
import MatchesPagination from "./MatchesPagination";
import PremiumUnlockBox from "./PremiumUnlockBox";

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
              <MatchList
                matches={data.matches}
                isPremium={isPremium}
                onSelect={(profile) => {
                  onOpenChange(false);
                  navigate(`/profile/${profile._id}`, {
                    state: { anonymousAlias: profile.anonymousAlias }
                  });
                }}
              />
            )}
            <MatchesPagination
              page={page}
              total={data.total}
              maxResults={data.maxResults}
              onPageChange={setPage}
            />
            {!isPremium && data.total > 3 && (
              <PremiumUnlockBox onClick={startPayment} isPaying={isPaying} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YourMatchesModal;
