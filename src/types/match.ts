
export interface MatchProfile {
  _id: string;
  username: string;
  fullName: string;
  anonymousAlias: string;
  avatarEmoji: string;
  bio?: string;
  interests: string[];
  gender: "male" | "female" | "other";
}
export interface MatchResult {
  matches: MatchProfile[];
  isPremium: boolean;
  total: number;
  maxResults: number;
}
