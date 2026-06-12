/* Rainbow Code — service worker
 * Serves per-card manifest + icon from IndexedDB,
 * and acts as the SPA shell for offline cold-starts.
 */
const VERSION = 'v1';
const SHELL_CACHE = `rc-shell-${VERSION}`;
const SHELL_URL = new URL('./', self.registration.scope).pathname;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll([SHELL_URL])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('keyval-store', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('keyval');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readMemberships() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keyval', 'readonly');
    const req = tx.objectStore('keyval').get('memberships');
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function findMembership(id) {
  const all = await readMemberships();
  return all.find((m) => m.id === id);
}

function jsonResponse(obj, init = {}) {
  return new Response(JSON.stringify(obj), {
    headers: { 'content-type': 'application/manifest+json' },
    ...init,
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const scopePath = SHELL_URL;
  if (!url.pathname.startsWith(scopePath)) return;

  const rel = url.pathname.slice(scopePath.length);

  // /m/<id>/manifest.webmanifest
  const manifestMatch = rel.match(/^m\/([^/]+)\/manifest\.webmanifest$/);
  if (manifestMatch) {
    const id = decodeURIComponent(manifestMatch[1]);
    event.respondWith(
      (async () => {
        const m = await findMembership(id);
        if (!m) return new Response('Not found', { status: 404 });
        const startUrl = `${scopePath}m/${encodeURIComponent(id)}/`;
        const iconUrl = `${scopePath}m/${encodeURIComponent(id)}/icon-512.png`;
        return jsonResponse({
          id: startUrl,
          name: m.name,
          short_name: m.name,
          start_url: startUrl,
          scope: startUrl,
          display: 'standalone',
          orientation: 'portrait',
          theme_color: m.color,
          background_color: m.color,
          icons: [
            { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        });
      })(),
    );
    return;
  }

  // /m/<id>/icon-*.png
  const iconMatch = rel.match(/^m\/([^/]+)\/icon-(?:192|512)\.png$/);
  if (iconMatch) {
    const id = decodeURIComponent(iconMatch[1]);
    event.respondWith(
      (async () => {
        const m = await findMembership(id);
        if (!m || !m.iconBlob) return new Response('Not found', { status: 404 });
        return new Response(m.iconBlob, { headers: { 'content-type': 'image/png' } });
      })(),
    );
    return;
  }

  // Navigation requests inside the scope → serve cached shell (index.html).
  if (req.mode === 'navigate') {
    event.respondWith(
      caches
        .match(SHELL_URL)
        .then((cached) => cached || fetch(SHELL_URL))
        .catch(() => fetch(SHELL_URL)),
    );
    return;
  }
});
