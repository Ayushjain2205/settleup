self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

// Network-first passthrough: keeps the installability requirement
// (a fetch handler) without risky caching semantics for live data.
self.addEventListener("fetch", () => {});
