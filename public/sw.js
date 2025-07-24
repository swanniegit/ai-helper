// DevPath Chronicles Service Worker
// Version 1.0 - Mobile-First PWA with Offline Quiz Support

const CACHE_NAME = 'devpath-chronicles-v1.0.0';
const STATIC_CACHE_NAME = 'devpath-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'devpath-dynamic-v1.0.0';
const QUIZ_CACHE_NAME = 'devpath-quiz-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/quiz',
  '/mentor-chat',
  '/gamification',
  '/manifest.json',
  '/favicon.svg',
  '/images/ai-mentor-logo.svg'
];

// API routes to cache for offline quiz functionality
const CACHEABLE_APIS = [
  '/api/quiz/templates',
  '/api/gamification/progress',
  '/api/auth/me'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing DevPath Chronicles Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating DevPath Chronicles Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== QUIZ_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch Event - Network strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request, url));
});

async function handleFetch(request, url) {
  try {
    // Quiz API - Cache First (for offline quiz functionality)
    if (url.pathname.startsWith('/api/quiz/') || 
        url.pathname.startsWith('/api/gamification/')) {
      return await cacheFirstStrategy(request, QUIZ_CACHE_NAME);
    }
    
    // API routes - Network First
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request, DYNAMIC_CACHE_NAME);
    }
    
    // Static assets - Cache First
    if (STATIC_ASSETS.some(asset => url.pathname === asset) ||
        url.pathname.startsWith('/images/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2)$/)) {
      return await cacheFirstStrategy(request, STATIC_CACHE_NAME);
    }
    
    // Navigation requests - Network First with offline fallback
    if (request.mode === 'navigate') {
      return await navigationStrategy(request);
    }
    
    // Default - Network First
    return await networkFirstStrategy(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Cache hit:', request.url);
    
    // Update cache in background
    fetchAndCache(request, cache);
    
    return cachedResponse;
  }
  
  // Not in cache, fetch and cache
  return await fetchAndCache(request, cache);
}

// Network First Strategy
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Navigation Strategy - Handle page navigation with offline fallback
async function navigationStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Navigation network failed, trying cache');
    
    // Try cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    return await getOfflineFallback(request);
  }
}

// Fetch and Cache Helper
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[SW] Fetch failed:', request.url, error);
    throw error;
  }
}

// Offline Fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Return appropriate offline content based on route
  if (url.pathname === '/quiz' || url.pathname.startsWith('/quiz/')) {
    return new Response(JSON.stringify({
      offline: true,
      message: 'Quiz functionality is available offline with cached content',
      fallback_quiz: {
        skill_category: 'Offline Practice',
        questions: []
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Generic offline fallback
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DevPath Chronicles - Offline</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #22c55e 0%, #1a1a1a 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          padding: 2rem;
          background: rgba(255,255,255,0.1);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
        h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
        p { margin: 0 0 1.5rem 0; opacity: 0.9; }
        .retry-btn {
          background: white;
          color: #22c55e;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
        }
        .retry-btn:hover { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1>You&apos;re Offline</h1>
        <p>Don&apos;t worry! Your DevPath Chronicles adventure continues. Some features are available offline.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background Sync for Quiz Results
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'quiz-result-sync') {
    event.waitUntil(syncQuizResults());
  }
});

async function syncQuizResults() {
  // Implementation for syncing quiz results when back online
  console.log('[SW] Syncing quiz results...');
  
  try {
    // Get cached quiz results from IndexedDB or localStorage
    // Send them to the server when connection is restored
    // This would integrate with the offline quiz system
  } catch (error) {
    console.error('[SW] Quiz sync failed:', error);
  }
}

// Push Notifications for Engagement
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/ai-mentor-logo.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'devpath-notification',
    data: data.url || '/dashboard',
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/favicon.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/dashboard')
    );
  }
});

console.log('[SW] DevPath Chronicles Service Worker loaded successfully!');