
export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  anonymousAlias: string;
  avatarEmoji: string;
  friends: string[];
  recognizedUsers: string[];
  identityRecognizers?: User[];
  referralCode: string;
  oneSignalPlayerId?: string;
  bio: string;
  gender?: 'male' | 'female' | 'other';
  interests: string[];
  premiumMatchUnlocks: number;
  isEmailVerified: boolean;
  recognitionAttempts?: number;
  successfulRecognitions?: number;
  claimedRewards?: {
    tierLevel: number;
    rewardType: 'badge' | 'cash' | 'premium';
    rewardDescription: string;
    status: 'pending' | 'completed';
    claimedAt: Date;
    paymentDetails?: string;
  }[];
}

export interface Recognition {
  stats: {
    totalRecognized: number;
    totalRecognizers: number;
    recognitionRate: number;
    successfulRecognitions: number;
    recognitionAttempts: number;
  };
  recognized: User[];
  recognizers: User[];
}

export interface Post {
  _id: string;
  user: string;
  content: string;
  imageUrl?: string;
  images?: string[];
  videos?: Array<{
    url: string;
    thumbnail?: string;
    duration?: number;
  }>;
  likes: string[];
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
  ghostCircle?: string;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: string;
  content: string;
  anonymousAlias: string;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

export interface Reply {
  _id: string;
  user: string;
  content: string;
  anonymousAlias: string;
  createdAt: string;
  updatedAt: string;
}
