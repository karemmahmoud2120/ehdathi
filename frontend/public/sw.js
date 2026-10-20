// إحداثي PWA - Service Worker v1.0
const CACHE_NAME = 'ehdathi-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// التثبيت: تخزين الأصول الثابتة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// التفعيل: حذف الكاشات القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// الاعتراض: استراتيجية Network-First للـ API، Cache-First للأصول
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // تجاهل الطلبات التي ليست GET
  if (event.request.method !== 'GET') return;
  
  // طلبات API - تجرب الشبكة أولاً ثم الكاش
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const cloned = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, cloned));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // طلبات الخرائط - تجرب الكاش أولاً
  if (url.hostname.includes('tile.openstreetmap') || url.hostname.includes('basemaps')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          const cloned = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, cloned));
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }
  
  // بقية الأصول - Cache First مع fallback للشبكة
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});