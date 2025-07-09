
import { api } from "./api";
import { Post } from "@/types/user";

// Post-related API functions

export const getPaginatedPosts = async ({
  limit = 20,
  after = null,
}: { limit?: number; after?: string | null } = {}): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (after) params.push(`after=${after}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const response = await api.get(`/api/posts/global${query}`);
  return response.data;
};
