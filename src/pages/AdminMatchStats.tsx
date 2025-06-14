
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const fetchMatchStats = async () => {
  const resp = await api.get("/api/admin/match-stats");
  return resp.data;
};

const AdminMatchStats: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "match-stats"],
    queryFn: fetchMatchStats,
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="text-red-500 p-8">Could not load match stats.</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-6">Match Statistics</h1>
      <Card className="p-6">
        <div className="text-lg">Total Premium Unlocks:</div>
        <div className="text-2xl font-bold">{data?.totalPremiumUnlocks ?? 0}</div>
      </Card>
      {/* Expand this section with more stats as needed */}
    </div>
  );
};

export default AdminMatchStats;
