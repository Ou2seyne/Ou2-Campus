// Aura Campus Service Worker V3
// Strategies:
//   - /api/schedule      → Network-First + StaleWhileRevalidate fallback
//   - /_next/static/     → Cache-First (immutable hashed chunks)
//   - Fonts              → Cache-First (long-lived)
//   - Navigation (HTML)  → Network-First + offline.html fallback
//   - Other assets       → StaleWhileRevalidate

const CACHE_STATIC  = 'aura-static-v4';
const CACHE_API     = 'aura-schedule-v4';
const CACHE_FONTS   = 'aura-fonts-v1';

const STATIC_PRECACHE = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg',
  '/favicon.ico',
];

// ─── Install ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting(); // activate immediately to clear stale caches
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) =>
      cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Precache partial failure:', err);
      })
    )
  );
});

// ─── Activate ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const current = new Set([CACHE_STATIC, CACHE_API, CACHE_FONTS]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (!current.has(k) ? caches.delete(k) : undefined)))
    ).then(() => self.clients.claim())
  );
});

// ─── Message (SKIP_WAITING = user-initiated update) ────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Periodic Background Sync ──────────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'aura-schedule-refresh') {
    event.waitUntil(refreshScheduleInBackground());
  }
});

async function refreshScheduleInBackground() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length > 0) {
    const cache = await caches.open(CACHE_API);
    const keys  = await cache.keys();
    await Promise.allSettled(
      keys.map(async (req) => {
        try {
          const res = await fetch(req);
          if (res.ok) await cache.put(req, res);
        } catch {}
      })
    );
  }
}

// ─── Fetch Router ──────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  // Skip cross-origin non-font requests
  if (url.origin !== self.location.origin && !isFontRequest(url)) return;

  // In development on localhost, NEVER intercept /_next/ (Turbopack HMR safety)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    if (url.pathname.startsWith('/_next/')) return;
  }

  // A. API Schedule — Network-First + cache fallback with freshness header
  if (url.pathname.startsWith('/api/schedule')) {
    event.respondWith(handleApiSchedule(request));
    return;
  }

  // B. Fonts — Cache-First
  if (isFontRequest(url)) {
    event.respondWith(cacheFirst(request, CACHE_FONTS));
    return;
  }

  // C. Next.js immutable static chunks — Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // D. HTML navigation — Network-First + offline page fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleNavigation(request));
    return;
  }

  // E. Everything else — StaleWhileRevalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
});

// ─── Strategy helpers ──────────────────────────────────────

async function handleApiSchedule(request) {
  const cache = await caches.open(CACHE_API);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    // Non-ok response — try cache
    const cached = await cache.match(request);
    if (cached) return addOfflineHeader(cached);
    return networkResponse; // return the error response
  } catch {
    // Network failed — return cached with freshness info
    const cached = await cache.match(request);
    if (cached) return addOfflineHeader(cached);

    // No cache — return a structured error
    return new Response(
      JSON.stringify({
        success: false,
        events: [],
        error: "Hors-ligne — aucun emploi du temps mis en cache pour cette URL.",
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'X-Aura-Offline': 'true' },
      }
    );
  }
}

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_STATIC);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    return networkResponse;
  } catch {
    // Offline — try cache, fallback to offline.html
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const offline = await caches.match('/offline.html');
    return offline || new Response('<h1>Hors-ligne</h1>', { headers: { 'Content-Type': 'text/html' } });
  }
}

async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const networkResponse = await fetch(request);
  if (networkResponse.ok) await cache.put(request, networkResponse.clone());
  return networkResponse;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}

function addOfflineHeader(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Aura-Offline', 'true');
  headers.set('X-Aura-CachedAt', response.headers.get('Date') || new Date().toISOString());
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function isFontRequest(url) {
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
}
