
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMatches, unlockPremiumMatches } from "@/lib/api-match";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

const MatchesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["matches", page],
    queryFn: () => fetchMatches(page),
    keepPreviousData: true,
  });

  const unlockMutation = useMutation({
    mutationFn: unlockPremiumMatches,
    onSuccess: (data) => {
      toast({
        title: "Premium Unlocked",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err: any) => {
      toast({ title: "Unlock Failed", description: err.message, variant: "destructive" });
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="text-red-500 p-8">Could not load matches.</div>;

  return (
    <div className="max-w-xl mx-auto py-6 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-4">Matches</h1>
      {data && data.matches.length === 0 && (
        <div className="text-muted-foreground text-center">No matches found. Try updating your interests!</div>
      )}
      {data && data.matches.map(profile => (
        <Card className="p-4 flex items-center gap-3" key={profile._id}>
          <div className="text-3xl">{profile.avatarEmoji}</div>
          <div className="flex-1">
            <div className="font-medium">{profile.anonymousAlias}</div>
            <div className="text-xs text-gray-500">{profile.bio}</div>
            <div className="text-xs text-gray-500">Interests: {profile.interests?.join(", ")}</div>
            <div className="text-xs">
              Gender: <span className="capitalize">{profile.gender}</span>
            </div>
          </div>
          {/* Optionally profile actions */}
        </Card>
      ))}

      <div className="flex items-center gap-2 justify-between mt-4">
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          variant="outline"
        >
          Prev
        </Button>
        <span>
          Page {page}
        </span>
        <Button
          size="sm"
          disabled={data && (page * data.maxResults) >= data.total}
          onClick={() => setPage(p => p + 1)}
          variant="outline"
        >
          Next
        </Button>
      </div>

      {/* Premium prompt */}
      {data && !data.isPremium && data.total > 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mt-6">
          <div className="flex justify-center mb-2">
            <Lock className="text-yellow-500" />
          </div>
          <div>
            <p className="mb-2">
              Upgrade to <span className="font-semibold text-yellow-600">Premium</span> to see up to 10 matches at once!
            </p>
            <Button
              size="lg"
              loading={unlockMutation.isPending}
              onClick={() => {
                // INTEGRATE with Razorpay here.
                // For now, we'll simulate successful payment then unlock.
                // Replace this block with your actual Razorpay payment integration.
                unlockMutation.mutate();
              }}
              className="bg-yellow-500 text-yellow-900 hover:bg-yellow-600"
            >
              Unlock with Razorpay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
