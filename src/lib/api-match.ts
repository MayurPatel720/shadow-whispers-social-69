
import { api } from "./api";
import type { MatchResult } from "@/types/match";

// Fetch paginated matches (limited to either 3 or 10 based on premium unlock)
export const fetchMatches = async (page = 1): Promise<MatchResult> => {
  const resp = await api.get(`/api/match?page=${page}`);
  return resp.data;
};

// Unlock premium matches (should be called after confirmed razorpay payment)
export const unlockPremiumMatches = async (): Promise<{ message: string; premiumMatchUnlocks: number }> => {
  const resp = await api.post("/api/match/unlock");
  return resp.data;
};
