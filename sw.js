// Service Worker sederhana untuk PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Biarkan request lewat secara normal
  event.respondWith(fetch(event.request));
});
