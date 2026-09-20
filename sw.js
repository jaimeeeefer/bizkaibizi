// Service Worker básico para permitir instalación PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Passthrough simple, no cacheamos nada para que siempre esté actualizado
  e.respondWith(fetch(e.request));
});
