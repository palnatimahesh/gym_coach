/* Service Worker - Athletic Coach PWA
   Strategy: stale-while-revalidate. Pages open instantly from cache and refresh in the
   background; the app shows an "Update ready" toast when a new version takes over.
   Bump VERSION on every release. */
importScripts('./js/version.js'); // defines APP_VERSION (single source of truth)
var VERSION = APP_VERSION;
var CACHE_NAME = 'athletic-coach-' + VERSION;

var STATIC_ASSETS = [
  './', './index.html', './manifest.json',
  './css/style.css', './css/components.css',
  './data/exercises.js', './data/programs.js', './data/warmups.js', './data/running.js',
  './data/recovery.js', './data/history.js', './data/progression.js', './data/readiness.js',
  './js/version.js', './js/sound.js', './js/native.js', './js/health.js', './js/autobackup.js', './js/app.js', './js/rings.js', './js/dashboard.js', './js/program.js', './js/setlog.js',
  './js/workout.js', './js/dictionary.js', './js/warmup.js', './js/running.js', './js/recovery.js',
  './js/history.js', './js/charts.js', './js/progress.js', './js/foodlog.js', './js/nutrition.js', './js/tools.js', './js/settings.js',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      /* One missing file must not abort the whole install */
      return Promise.all(STATIC_ASSETS.map(function(url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function() { return null; });
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; })
        .map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

function isFont(url) {
  return url.indexOf('fonts.googleapis.com') !== -1 || url.indexOf('fonts.gstatic.com') !== -1;
}

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = req.url;
  var sameOrigin = url.indexOf(self.location.origin) === 0;
  if (!sameOrigin && !isFont(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(req, { ignoreSearch: sameOrigin }).then(function(cached) {
        var network = fetch(req).then(function(res) {
          if (res && (res.status === 200 || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        }).catch(function() { return null; });

        if (cached) return cached;
        return network.then(function(res) {
          if (res) return res;
          if (req.mode === 'navigate') return cache.match('./index.html');
          return new Response('', { status: 503 });
        });
      });
    })
  );
});
