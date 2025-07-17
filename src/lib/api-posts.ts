
import { api } from "./api";
import { Post } from "@/types/user";

// Post-related API functions

export const getPaginatedPosts = async ({
  limit = 20,
  after = null,
  feedType = "global",
  college = null,
  area = null,
}: { 
  limit?: number; 
  after?: string | null;
  feedType?: "global" | "college" | "area";
  college?: string | null;
  area?: string | null;
} = {}): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (after) params.push(`after=${after}`);
  if (feedType === "college" && college) params.push(`college=${encodeURIComponent(college)}`);
  if (feedType === "area" && area) params.push(`area=${encodeURIComponent(area)}`);
  
  const query = params.length ? `?${params.join('&')}` : '';
  
  let endpoint = "/api/posts/global";
  if (feedType === "college") endpoint = "/api/posts/college";
  if (feedType === "area") endpoint = "/api/posts/area";
  
  const response = await api.get(`${endpoint}${query}`);
  return response.data;
};
