
import { api } from "./api";

// Whisper-related API functions

export const getWhisperConversationPaginated = async ({
  userId,
  limit = 20,
  before = null,
}: {
  userId: string,
  limit?: number,
  before?: string | null
}): Promise<{ messages: any[]; partner: any; hasRecognized: boolean; hasMore: boolean }> => {
  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (before) params.push(`before=${before}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const response = await api.get(`/api/whispers/${userId}${query}`);
  return response.data;
};

export const sendWhisper = async (
  receiverId: string,
  content: string
): Promise<any> => {
  const response = await api.post("/api/whispers", { receiverId, content });
  return response.data;
};

export async function editWhisper(messageId: string, content: string) {
  const res = await api.put(`/api/whispers/message/${messageId}`, { content });
  return res.data;
}

export async function deleteWhisperMessage(messageId: string) {
  const res = await api.delete(`/api/whispers/message/${messageId}`);
  return res.data;
}

// ... add more whisper-related functions as needed
