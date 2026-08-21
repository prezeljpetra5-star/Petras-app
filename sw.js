/* Petra's budget — service worker
   Strategija:
   - stran (index.html): najprej omrežje, ob izpadu predpomnilnik
     → posodobitve se pokažejo takoj, brez trika z ?v=
   - ikone in ostalo: najprej predpomnilnik, hitrost
*/

const RAZLICICA = 'petras-budget-v15';
const OSNOVA = [
  './',
  './index.html',
  './manifest.json',
  './ikona.png',
  './ikona192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(RAZLICICA)
      .then(c => c.addAll(OSNOVA).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== RAZLICICA).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const jeStran = req.mode === 'navigate' ||
                  (req.headers.get('accept') || '').includes('text/html');

  if (jeStran) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const kopija = res.clone();
          caches.open(RAZLICICA).then(c => c.put('./index.html', kopija)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(zadetek => {
      if (zadetek) return zadetek;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const kopija = res.clone();
          caches.open(RAZLICICA).then(c => c.put(req, kopija)).catch(() => {});
        }
        return res;
      }).catch(() => zadetek);
    })
  );
});
