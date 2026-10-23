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
    var layers = ['plan-modal', 'media-modal', 'onb-modal'];
    for (var i = 0; i < layers.length; i++) {
      var layer = el(layers[i]);
      if (layer) { layer.parentNode.removeChild(layer); return; }
    }
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
    Notify.apply(false).catch(function() {});
    Health.sync().then(function(res) { if (res) refreshVisible(); });
    /* Keep wearable data fresh while the app stays open */
    setInterval(function() { Health.sync().then(function(res) { if (res) refreshVisible(); }); }, 30 * 60 * 1000);
  }

  return { isNative: isNative, plugin: plugin, init: init, keepAwake: keepAwake, haptic: haptic, refreshVisible: refreshVisible };
})();

/* --- LOCAL REMINDERS (Android): scheduled by the OS, so they fire with the app closed --- */
var Notify = (function() {

  var WATER_HOURS = [10, 12, 14, 16, 18, 20];

  function get() {
    var r = Store.get('reminders', null) || {};
    return {
      train: { on: !!(r.train && r.train.on), time: (r.train && r.train.time) || '17:30' },
      water: { on: !!(r.water && r.water.on) },
      backup: { on: !!(r.backup && r.backup.on) }
    };
  }

  /* Pure: reminder settings -> notification list for the plugin */
  function plan(rem) {
    var list = [];
    if (rem.train.on) {
      var m = /^(\d{1,2}):(\d{2})$/.exec(rem.train.time);
      var h = m ? parseInt(m[1], 10) : -1, min = m ? parseInt(m[2], 10) : -1;
      if (h >= 0 && h < 24 && min >= 0 && min < 60) {
        list.push({ id: 1, title: 'Time to train', body: 'Your session is ready. Open Athletic Coach.', schedule: { on: { hour: h, minute: min }, allowWhileIdle: true } });
      }
    }
    if (rem.water.on) {
      WATER_HOURS.forEach(function(hr, i) {
        list.push({ id: 10 + i, title: 'Drink water', body: 'Keep your hydration on track today.', schedule: { on: { hour: hr, minute: 0 }, allowWhileIdle: true } });
      });
    }
    if (rem.backup && rem.backup.on) {
      /* weekday 1 = Sunday */
      list.push({ id: 20, title: 'Weekly backup', body: 'Share your backup to Drive or Files so your data is safe.', schedule: { on: { weekday: 1, hour: 20, minute: 0 }, allowWhileIdle: true } });
    }
    return list;
  }

  /* Replace everything scheduled with the current settings. askPermission: show the Android prompt if needed. */
  function apply(askPermission) {
    var P = Native.plugin('LocalNotifications');
    if (!P) return Promise.resolve(false);
    var list = plan(get());
    var perm = list.length && askPermission ? P.requestPermissions() : P.checkPermissions();
    return perm.then(function(r) {
      if (list.length && r.display !== 'granted') throw new Error('Notifications are blocked. Allow them in Android settings.');
      return P.getPending();
    }).then(function(p) {
      return p.notifications && p.notifications.length ? P.cancel({ notifications: p.notifications }) : null;
    }).then(function() {
      return list.length ? P.schedule({ notifications: list }) : null;
    }).then(function() { return true; });
  }

  function set(kind, field, value) {
    var r = get();
    r[kind][field] = value;
    Store.save('reminders', r);
    return apply(true);
  }

  return { get: get, plan: plan, apply: apply, set: set };
})();