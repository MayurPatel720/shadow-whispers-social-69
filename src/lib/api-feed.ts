
import { api } from "./api";
import { Post } from "@/types/user";

export interface FeedFilters {
  limit?: number;
  after?: string | null;
  college?: string;
  area?: string;
  tag?: string | null;
  tags?: string[];
}

export const getGlobalFeed = async (filters: FeedFilters): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const params = [];
  if (filters.limit) params.push(`limit=${filters.limit}`);
  if (filters.after) params.push(`after=${filters.after}`);
  if (filters.tag) params.push(`tag=${encodeURIComponent(filters.tag)}`);
  if (filters.tags && filters.tags.length > 0) params.push(`tags=${encodeURIComponent(filters.tags.join(','))}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const response = await api.get(`/api/posts/global${query}`);
  return response.data;
};

export const getCollegeFeed = async (filters: FeedFilters): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const params = [];
  if (filters.limit) params.push(`limit=${filters.limit}`);
  if (filters.after) params.push(`after=${filters.after}`);
  if (filters.college) params.push(`college=${encodeURIComponent(filters.college)}`);
  if (filters.tag) params.push(`tag=${encodeURIComponent(filters.tag)}`);
  if (filters.tags && filters.tags.length > 0) params.push(`tags=${encodeURIComponent(filters.tags.join(','))}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const response = await api.get(`/api/posts/college${query}`);
  return response.data;
};

export const getAreaFeed = async (filters: FeedFilters): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const params = [];
  if (filters.limit) params.push(`limit=${filters.limit}`);
  if (filters.after) params.push(`after=${filters.after}`);
  if (filters.area) params.push(`area=${encodeURIComponent(filters.area)}`);
  if (filters.tag) params.push(`tag=${encodeURIComponent(filters.tag)}`);
  if (filters.tags && filters.tags.length > 0) params.push(`tags=${encodeURIComponent(filters.tags.join(','))}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const response = await api.get(`/api/posts/area${query}`);
  return response.data;
};

export const updateUserProfile = async (updates: { college?: string; area?: string }) => {
  const response = await api.put('/api/users/profile', updates);
  return response.data;
};
