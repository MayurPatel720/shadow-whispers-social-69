
import OneSignal from 'react-onesignal';

interface OneSignalConfig {
  appId: string;
  safariWebId?: string;
}

interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
  data?: Record<string, any>;
}

interface TargetOptions {
  userIds?: string[];
  segments?: string[];
  platform?: 'web' | 'android' | 'ios' | 'all';
}

class OneSignalService {
  private isInitialized = false;
  private config: OneSignalConfig;

  constructor(config: OneSignalConfig) {
    this.config = config;
  }

  /**
   * Initialize OneSignal SDK
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('OneSignal already initialized');
      return;
    }

    try {
      await OneSignal.init({
        appId: this.config.appId,
        safariWebId: this.config.safariWebId,
        notifyButton: {
          enable: false, // We'll handle permission requests manually
        },
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
        autoRegister: false, // Manual registration for better UX
        autoResubscribe: true,
        persistNotification: true,
        showCredit: false,
      });

      this.isInitialized = true;
      console.log('OneSignal initialized successfully');

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize OneSignal:', error);
      throw new Error('OneSignal initialization failed');
    }
  }

  /**
   * Set up OneSignal event listeners
   */
  private setupEventListeners(): void {
    // Listen for subscription changes
    OneSignal.on('subscriptionChange', (isSubscribed) => {
      console.log('Subscription changed:', isSubscribed);
      this.handleSubscriptionChange(isSubscribed);
    });

    // Listen for notification permission changes
    OneSignal.on('notificationPermissionChange', (permission) => {
      console.log('Permission changed:', permission);
    });

    // Listen for notification display
    OneSignal.on('notificationDisplay', (event) => {
      console.log('Notification displayed:', event);
    });

    // Listen for notification clicks
    OneSignal.on('notificationClick', (event) => {
      console.log('Notification clicked:', event);
      this.handleNotificationClick(event);
    });
  }

  /**
   * Request notification permission and subscribe user
   */
  async requestPermissionAndSubscribe(): Promise<{ success: boolean; playerId?: string; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if already subscribed
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      if (isSubscribed) {
        const playerId = await OneSignal.getPlayerId();
        return { success: true, playerId: playerId || undefined };
      }

      // Request permission
      const permission = await OneSignal.requestPermission();
      
      if (!permission) {
        return { success: false, error: 'Permission denied' };
      }

      // Register for push notifications
      await OneSignal.registerForPushNotifications();
      
      // Get player ID
      const playerId = await OneSignal.getPlayerId();
      
      if (!playerId) {
        return { success: false, error: 'Failed to get player ID' };
      }

      console.log('Successfully subscribed with player ID:', playerId);
      return { success: true, playerId };
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Unsubscribe from notifications
   */
  async unsubscribe(): Promise<{ success: boolean; error?: string }> {
    try {
      await OneSignal.setSubscription(false);
      console.log('Successfully unsubscribed from notifications');
      return { success: true };
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Re-subscribe to notifications
   */
  async resubscribe(): Promise<{ success: boolean; playerId?: string; error?: string }> {
    try {
      await OneSignal.setSubscription(true);
      const playerId = await OneSignal.getPlayerId();
      console.log('Successfully re-subscribed with player ID:', playerId);
      return { success: true, playerId: playerId || undefined };
    } catch (error) {
      console.error('Failed to re-subscribe:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    playerId?: string;
    permission?: NotificationPermission;
  }> {
    try {
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      const playerId = await OneSignal.getPlayerId();
      const permission = await OneSignal.getNotificationPermission();
      
      return {
        isSubscribed,
        playerId: playerId || undefined,
        permission: permission as NotificationPermission,
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { isSubscribed: false };
    }
  }

  /**
   * Set external user ID (your app's user ID)
   */
  async setExternalUserId(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await OneSignal.setExternalUserId(userId);
      console.log('External user ID set:', userId);
      return { success: true };
    } catch (error) {
      console.error('Failed to set external user ID:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Remove external user ID
   */
  async removeExternalUserId(): Promise<{ success: boolean; error?: string }> {
    try {
      await OneSignal.removeExternalUserId();
      console.log('External user ID removed');
      return { success: true };
    } catch (error) {
      console.error('Failed to remove external user ID:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Set user tags for segmentation
   */
  async setUserTags(tags: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    try {
      await OneSignal.sendTags(tags);
      console.log('User tags set:', tags);
      return { success: true };
    } catch (error) {
      console.error('Failed to set user tags:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Handle subscription changes
   */
  private async handleSubscriptionChange(isSubscribed: boolean): void {
    if (isSubscribed) {
      const playerId = await OneSignal.getPlayerId();
      console.log('User subscribed with player ID:', playerId);
      
      // You can emit events or call callbacks here
      window.dispatchEvent(new CustomEvent('onesignal:subscribed', { 
        detail: { playerId } 
      }));
    } else {
      console.log('User unsubscribed');
      window.dispatchEvent(new CustomEvent('onesignal:unsubscribed'));
    }
  }

  /**
   * Handle notification clicks
   */
  private handleNotificationClick(event: any): void {
    console.log('Notification clicked:', event);
    
    // Handle URL redirects
    if (event.data?.url) {
      window.open(event.data.url, '_blank');
    }
    
    // Emit custom event for app-specific handling
    window.dispatchEvent(new CustomEvent('onesignal:notificationClick', { 
      detail: event 
    }));
  }

  /**
   * Check if OneSignal is supported in current environment
   */
  static isSupported(): boolean {
    return OneSignal.isPushNotificationsSupported();
  }
}

// Export singleton instance
const oneSignalConfig: OneSignalConfig = {
  appId: process.env.VITE_ONESIGNAL_APP_ID || 'your-onesignal-app-id',
  safariWebId: process.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
};

export const oneSignalService = new OneSignalService(oneSignalConfig);
export default oneSignalService;
export type { NotificationPayload, TargetOptions };
