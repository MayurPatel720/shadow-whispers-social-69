
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchMatches } from "@/lib/api-match";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MatchProfile } from "@/types/match";
import { useNavigate } from "react-router-dom";

interface YourMatchesModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  requireProfileEdit?: () => void;
}

const YourMatchesModal: React.FC<YourMatchesModalProps> = ({ open, onOpenChange, requireProfileEdit }) => {
  const [page, setPage] = useState(1);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false); // Local (simulate purchase)
  const navigate = useNavigate();

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

  // Effective premium flag (simulate unlock)
  const isPremium = (data && data.isPremium) || premiumUnlocked;

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
                ).map((profile: MatchProfile, idx) => (
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
                        <div className="text-xs text-gray-500">Interests: {profile.interests?.join(", ")}</div>
                        <div className="text-xs">
                          Gender: <span className="capitalize">{profile.gender}</span>
                        </div>
                        {!isPremium && idx >= 3 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-md">
                            <span className="text-yellow-300 font-semibold text-lg">Upgrade Now</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </button>
                ))}
                {/* Show blurred/locked cards for hidden users if not premium */}
                {!isPremium && data.matches.length > 3 &&
                  Array.from({length: Math.min(10, data.matches.length) - 3}).map((_, i) => (
                    <div
                      key={`locked-${i}`}
                      className="relative p-4 flex items-center gap-3 bg-muted/60 rounded-md border border-muted-foreground opacity-70"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
                      <div>
                        <div className="h-4 w-20 rounded bg-gray-300 mb-2"/>
                        <div className="h-3 w-36 rounded bg-gray-200"/>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <span className="text-yellow-500 font-bold">Locked</span>
                      </div>
                    </div>
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
                  onClick={() => {
                    setPremiumUnlocked(true);
                    setTimeout(() => refetch(), 300);
                  }}
                >
                  Unlock Now
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
