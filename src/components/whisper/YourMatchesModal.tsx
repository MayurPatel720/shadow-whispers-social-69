
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchMatches } from "@/lib/api-match";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MatchProfile } from "@/types/match";

interface YourMatchesModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

const YourMatchesModal: React.FC<YourMatchesModalProps> = ({ open, onOpenChange }) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["matches", page],
    queryFn: () => fetchMatches(page),
    enabled: open,
    retry: false,
  });

  // Analyze error for user-friendly messages
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Matches</DialogTitle>
          <DialogDescription>
            View people you have been matched with. For best results, complete your interests and gender in profile.
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.matches.map((profile: MatchProfile) => (
                  <Card className="p-4 flex items-center gap-3" key={profile._id}>
                    <div className="text-3xl">{profile.avatarEmoji}</div>
                    <div>
                      <div className="font-medium">{profile.anonymousAlias}</div>
                      <div className="text-xs text-gray-500">{profile.bio}</div>
                      <div className="text-xs text-gray-500">Interests: {profile.interests?.join(", ")}</div>
                      <div className="text-xs">
                        Gender: <span className="capitalize">{profile.gender}</span>
                      </div>
                    </div>
                  </Card>
                ))}
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
            {/* Premium Upgrade Notice */}
            {!data.isPremium && data.total > 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center mt-6">
                <div className="text-yellow-500 font-semibold">Premium required to see more than 3 matches</div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YourMatchesModal;
