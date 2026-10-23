/* --- NATIVE GLUE (Android APK via Capacitor) --- ES5 ---
   Everything here is a no-op in a normal browser. Plugins are reached through window.Capacitor.Plugins. */

var Native = (function() {

  function cap() { return window.Capacitor || null; }

  function isNative() {
    var c = cap();
    return !!(c && typeof c.isNativePlatform === 'function' && c.isNativePlatform());
  }

  function plugin(name) {
    var c = cap();
    return (isNative() && c.Plugins && c.Plugins[name]) || null;
  }

  /* The bundled app never needs the service worker (assets ship inside the APK) and a stale
     cache from an old build must not shadow a new one. */
  function dropServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(rs) { rs.forEach(function(r) { r.unregister(); }); });
      }
      if (window.caches) caches.keys().then(function(ks) { ks.forEach(function(k) { caches.delete(k); }); });
    } catch(e) {}
  }

  function refreshVisible() {
    var p = STATE.currentPage;
    if (p === 'dashboard' || p === 'progress' || p === 'settings') renderPage(p);
  }

  function onResume() {
    Health.sync().then(function(res) { if (res) refreshVisible(); });
    AutoBackup.run('resume', false);
  }

  function onPause() { AutoBackup.run('pause', false); }

  function handleBack() {
    var swap = el('swap-modal');
    if (swap && swap.classList.contains('open')) { closeSwapModal(); return; }
    var guided = el('guided-overlay');
    if (guided && !guided.classList.contains('hidden')) { closeGuide(); return; }
    if (typeof SetTimer !== 'undefined' && SetTimer.overlay) { cancelSetTimer(); return; }
    if (STATE.currentPage !== 'dashboard') { navigate('dashboard'); return; }
    var app = plugin('App');
    if (app) app.exitApp();
  }

  /* Screen stays on during a workout (rest timers, set timers) */
  var wakeLock = null;
  function keepAwake(on) {
    try {
      if (on && navigator.wakeLock && !wakeLock) {
        navigator.wakeLock.request('screen').then(function(l) {
          wakeLock = l;
          l.addEventListener('release', function() { wakeLock = null; });
        }).catch(function() {});
      } else if (!on && wakeLock) {
        wakeLock.release(); wakeLock = null;
      }
    } catch(e) {}
  }

  function haptic(kind) {
    var h = plugin('Haptics');
    if (!h) return;
    try {
      if (kind === 'success' && h.notification) h.notification({ type: 'SUCCESS' });
      else if (h.impact) h.impact({ style: kind === 'heavy' ? 'HEAVY' : 'LIGHT' });
    } catch(e) {}
  }

  function init() {
    if (!isNative()) return;
    document.documentElement.classList.add('native');
    dropServiceWorker();
    var app = plugin('App');
    if (app) {
      app.addListener('appStateChange', function(s) { if (s && s.isActive) onResume(); else onPause(); });
      app.addListener('backButton', handleBack);
    }
    /* A workout screen that is open again after the OS released the lock needs it back */
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible' && typeof activeWorkout !== 'undefined' && activeWorkout.startTime) keepAwake(true);
    });
    AutoBackup.init();
    Health.sync().then(function(res) { if (res) refreshVisible(); });
  }

  return { isNative: isNative, plugin: plugin, init: init, keepAwake: keepAwake, haptic: haptic, refreshVisible: refreshVisible };
})();
