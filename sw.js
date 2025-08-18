// Service Worker for offline capabilities
// CACHE_NAME may be overridden at build time by replacing __BUILD_ID__ with a unique id.
const BUILD_ID = typeof self !== 'undefined' && self.__BUILD_ID__ ? self.__BUILD_ID__ : null;
const CACHE_NAME = BUILD_ID ? `church-cache-${BUILD_ID}` : `church-cache-${Date.now()}`;
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/favicon.ico",
  "/images/church-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

// On activate, delete any old caches that don't match the current CACHE_NAME.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  // Skip caching for chrome-extension, moz-extension, and other unsupported schemes
  const url = new URL(event.request.url);
  if (
    url.protocol === "chrome-extension:" ||
    url.protocol === "moz-extension:" ||
    url.protocol === "safari-extension:" ||
    url.protocol === "ms-browser-extension:"
  ) {
    return;
  }

  // Skip caching for non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              console.warn(
                "Failed to cache request:",
                event.request.url,
                error,
              );
            });
          });

          return response;
        })
        .catch((error) => {
          console.warn("Fetch failed:", event.request.url, error);
          // Return a fallback response or rethrow
          throw error;
        });
    }),
  );
});
