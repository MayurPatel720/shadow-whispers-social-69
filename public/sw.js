
// Service Worker for Push Notifications
const CACHE_NAME = 'undercover-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification data:', data);
    
    const options = {
      body: data.body || data.message || 'New notification',
      icon: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
      badge: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
      tag: data.tag || 'notification',
      data: data.data || {},
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    console.log('Showing notification with options:', options);
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'UnderCover', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('UnderCover', {
        body: 'You have a new notification',
        icon: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
        badge: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
        tag: 'fallback'
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
