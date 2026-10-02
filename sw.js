/* Goship123 SW stub — no caching; prevents register() 404 on Pages. */
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => { /* passthrough */ });
