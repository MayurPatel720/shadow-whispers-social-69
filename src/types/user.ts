export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  posts: string[];
  anonymousAlias: string;
  avatarEmoji: string;
  referralCode?: string;
  referralCount: number;
  referredBy?: string;
  friends: string[];
  ghostCircles: string[];
  recognizedUsers: string[];
  identityRecognizers: string[];
  recognitionAttempts: number;
  successfulRecognitions: number;
  recognitionRevocations: string[];
  bio: string;
  claimedRewards: Array<{
    tierLevel: number;
    rewardType: "badge" | "cash" | "premium";
    rewardDescription: string;
    status: "pending" | "completed";
    claimedAt: Date;
    paymentDetails?: string;
  }>;
  gender?: "male" | "female" | "other";
  interests: string[];
  premiumMatchUnlocks: number;
  isEmailVerified: boolean;
  emailVerificationOTP?: string;
  emailVerificationOTPExpire?: Date;
  // New onboarding fields
  college?: string;
  area?: string;
  onboardingComplete?: boolean;
}

export interface Post {
  _id: string;
  content: string;
  author: User;
  likes: string[];
  comments: string[];
  createdAt: Date;
  updatedAt: Date;
  anonymousAlias: string;
  imageUrl?: string;
  images?: string[];
  videos?: Array<{ url: string; thumbnail?: string; duration?: number }>;
  ghostCircleId?: string;
  feedType?: "global" | "college" | "area";
  college?: string;
  area?: string;
  shareCount: number;
}
