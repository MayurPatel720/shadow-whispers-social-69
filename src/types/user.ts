// types/user.ts
export interface User {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    anonymousAlias: string;
    avatarEmoji: string;
    bio?: string;
    referralCount?: number;
    referralCode?: string;
    referredBy?: string;
    identityRecognizers?: string[] | User[];
    recognizedUsers?: string[] | User[];
    recognitionAttempts?: number;
    successfulRecognitions?: number;
    recognitionRate?: number;
    claimedRewards?: Array<{
      tierLevel: number;
      rewardType: 'badge' | 'cash' | 'premium';
      claimedAt: string;
      paymentMethod?: 'paypal' | 'venmo' | 'giftcard';
      paymentDetails?: string;
      status: 'pending' | 'completed' | 'failed';
    }>;
    friends?: string[];
    gender?: "male" | "female" | "other";
    interests?: string[];
    premiumMatchUnlocks?: number;
    [x: string]: any;
  }

  export interface Post {
    _id: string;
    content: string;
    imageUrl?: string;
    images?: string[];
    ghostCircleId?: string;
    userId: string;
    likes: string[];
    createdAt: string;
    updatedAt: string;
  }

  export interface Recognition {
    stats: {
      recognitionRate: number;
      totalRecognized: number;
      totalRecognizers: number;
      successfulRecognitions: number;
      recognitionAttempts: number;
    };
    recognized?: User[];
    recognizers?: User[];
  }
