/* Cleans up the retired offline worker that queued Analyze requests. */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('fasalsathi-'))
        .map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
  );
});
