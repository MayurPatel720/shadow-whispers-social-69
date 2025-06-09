# OneSignal Push Notifications Setup Guide

This application uses OneSignal for modern, production-ready push notifications across web, mobile, and all platforms.

## Features

✅ **Modern OneSignal SDK Integration**
✅ **Cross-Platform Support** (Web, Android, iOS)
✅ **Admin Panel** for sending notifications
✅ **User Permission Management**
✅ **Duplicate Prevention**
✅ **Subscribe/Unsubscribe Functionality**
✅ **Offline User Support**
✅ **Error Handling & Logging**
✅ **Production-Ready Implementation**

## Setup Instructions

### 1. OneSignal Account Setup

1. Go to [OneSignal.com](https://onesignal.com) and create a free account
2. Create a new app in your OneSignal dashboard
3. Configure your app for the platforms you want to support:
   - **Web**: Add your website URL and upload optional web icons
   - **Android**: Configure with your Firebase Server Key (if using React Native)
   - **iOS**: Upload your APNs certificates/keys (if using React Native)

### 2. Environment Variables

Add these environment variables to your backend `.env` file:

```env
# OneSignal Configuration
ONESIGNAL_APP_ID=your_onesignal_app_id_here
ONESIGNAL_API_KEY=your_onesignal_rest_api_key_here
```

Add this to your frontend environment (for web notifications):

```env
# Frontend OneSignal Configuration
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id_here
VITE_ONESIGNAL_SAFARI_WEB_ID=your_safari_web_id_here (optional, for Safari)
```

### 3. Finding Your OneSignal Credentials

In your OneSignal dashboard:

1. **App ID**: Found in Settings > Keys & IDs
2. **REST API Key**: Found in Settings > Keys & IDs
3. **Safari Web ID**: Found in Settings > Platforms > Safari (if you plan to support Safari)

### 4. Web Notifications Setup

Web notifications are automatically configured when users visit your app. The `NotificationManager` component handles:

- Permission requests
- Service worker registration
- Subscription management
- User preferences

### 5. Mobile Notifications (React Native)

If you're building a mobile app with React Native:

1. Install OneSignal React Native SDK:
   ```bash
   npm install react-native-onesignal
   ```

2. Follow OneSignal's platform-specific setup guides:
   - [Android Setup](https://documentation.onesignal.com/docs/react-native-sdk-setup#android-setup)
   - [iOS Setup](https://documentation.onesignal.com/docs/react-native-sdk-setup#ios-setup)

### 6. Admin Panel Access

Admins can send notifications through the Admin Panel:

1. Navigate to `/admin` (requires admin authentication)
2. Go to the "Push Notifications" tab
3. Compose and send notifications to all users or specific platforms

## Usage

### For Users

1. **Enable Notifications**: Click the "Enable Notifications" button when prompted
2. **Browser Permission**: Allow notifications when your browser asks
3. **Manage Preferences**: Use the notification settings to subscribe/unsubscribe

### For Admins

1. **Send Notifications**: Use the admin panel to compose and send notifications
2. **Target Platforms**: Choose to send to all platforms, web only, or mobile only
3. **Rich Notifications**: Add images and action URLs for enhanced notifications
4. **Test First**: Use "Send Test" to verify notifications before sending to all users

## API Endpoints

### User Endpoints

- `POST /api/notifications/save-player-id` - Save user's OneSignal player ID
- `GET /api/notifications/subscription-status` - Get user's subscription status

### Admin Endpoints

- `GET /api/admin/notifications/stats` - Get notification statistics
- `GET /api/admin/notifications/history` - Get notification history
- `POST /api/admin/notifications/send` - Send notification to all users
- `POST /api/admin/notifications/test` - Send test notification to admin

## Components

### `NotificationManager`
The main component for user notification management. Place it in your app where users should see notification prompts.

```tsx
import NotificationManager from '@/components/notifications/NotificationManager';

// In your component
<NotificationManager 
  onSubscriptionChange={(isSubscribed, playerId) => {
    // Handle subscription changes
  }}
/>
```

### `NotificationAdminPanel`
Admin interface for sending push notifications. Integrated into the main admin panel.

## Security Considerations

- ✅ Admin routes are protected with authentication middleware
- ✅ OneSignal API keys are stored securely in environment variables
- ✅ User consent is properly requested before subscribing
- ✅ Subscription data is mapped to your app's user IDs

## Browser Support

- ✅ Chrome 50+
- ✅ Firefox 52+
- ✅ Safari 16+ (with Safari Web ID configuration)
- ✅ Edge 79+
- ✅ Opera 37+

## Mobile Support

- ✅ Android via React Native or Progressive Web App
- ✅ iOS via React Native (requires APNs setup)
- ✅ Works offline when app is closed

## Troubleshooting

### Common Issues

1. **"OneSignal not configured" error**
   - Ensure `ONESIGNAL_APP_ID` and `ONESIGNAL_API_KEY` are set in your backend environment

2. **Notifications not appearing on mobile**
   - Check that you've configured the correct platform settings in OneSignal
   - Verify APNs certificates for iOS or Firebase settings for Android

3. **Permission denied**
   - Users can enable notifications in browser settings if previously denied
   - Provide clear instructions for re-enabling in browser settings

4. **Test notifications not working**
   - Ensure the admin user is subscribed to notifications
   - Check browser console for any errors

### Debug Mode

Enable debug logging by setting in your frontend:

```javascript
// In your OneSignal initialization
OneSignal.init({
  // ... other config
  debug: process.env.NODE_ENV === 'development',
});
```

## Production Deployment

1. ✅ Replace development OneSignal app with production app
2. ✅ Update environment variables with production credentials
3. ✅ Configure proper CORS origins in OneSignal dashboard
4. ✅ Test notifications on production domain
5. ✅ Set up proper SSL certificates (required for web notifications)

## Migration from Old System

The old Firebase/web-push notification system has been completely removed and replaced with OneSignal. This provides:

- Better cross-platform support
- More reliable delivery
- Advanced targeting and segmentation
- Better analytics and reporting
- Easier setup and maintenance

All old notification code has been removed, ensuring no conflicts with the new system.
