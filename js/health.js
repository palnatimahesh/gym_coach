/* --- HEALTH CONNECT SYNC (Android APK) --- ES5 ---
   WHOOP / phone -> Health Connect -> here. Reads steps, sleep, resting HR and HRV for the last 30 days
   and keeps one compact record per day in Store key "health":  { "YYYY-MM-DD": { steps, sleepH, rhr, hrv } }
   The summarize() step is pure so it can be tested in a browser with fake samples. */

var Health = (function() {

  var READ = ['steps', 'sleep', 'restingHeartRate', 'heartRateVariability'];
  var DAYS = 30;
  var SYNC_GAP_MS = 20 * 60 * 1000;
  var KEEP_DAYS = 90;
  var inflight = null;

  function plugin() { return Native.plugin('Health'); }
  function available() { return !!plugin(); }
  function connected() { return Store.get('healthConnected', false) === true; }

  /* ---- pure helpers ---- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }

  /* Sleep belongs to the day you wake up: segments ending after 18:00 count toward tomorrow. */
  function wakeKey(endDate) {
    var d = new Date(endDate.getTime());
    if (d.getHours() >= 18) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return dayKey(d);
  }

  var AWAKE = { awake: true, outofbed: true, awakeinbed: true, inbed: true };
  function isAsleep(sample) {
    var st = String(sample.sleepState || '').toLowerCase().replace(/[^a-z]/g, '');
    return !AWAKE[st];
  }

  /* Union of [startMs, endMs] intervals in minutes: two sources (WHOOP + phone) never double count */
  function unionMinutes(intervals) {
    var list = intervals.filter(function(i) { return i[1] > i[0]; }).sort(function(a, b) { return a[0] - b[0]; });
    var total = 0, curS = null, curE = null;
    list.forEach(function(i) {
      if (curS === null) { curS = i[0]; curE = i[1]; }
      else if (i[0] <= curE) { curE = Math.max(curE, i[1]); }
      else { total += curE - curS; curS = i[0]; curE = i[1]; }
    });
    if (curS !== null) total += curE - curS;
    return total / 60000;
  }

  function round1(n) { return Math.round(n * 10) / 10; }

  /* raw: { steps, sleep, rhr, hrv } arrays of plugin samples -> { date: { steps?, sleepH?, rhr?, hrv? } } */
  function summarize(raw) {
    var out = {};
    function slot(k) { return out[k] || (out[k] = {}); }

    (raw.steps || []).forEach(function(s) {
      var v = parseFloat(s.value);
      if (isNaN(v) || !s.startDate) return;
      var o = slot(dayKey(new Date(s.startDate)));
      o.steps = Math.round((o.steps || 0) + v);
    });

    var nights = {};
    (raw.sleep || []).forEach(function(s) {
      if (!s.startDate || !s.endDate || !isAsleep(s)) return;
      var end = new Date(s.endDate), start = new Date(s.startDate);
      if (isNaN(end.getTime()) || isNaN(start.getTime())) return;
      var k = wakeKey(end);
      (nights[k] = nights[k] || []).push([start.getTime(), end.getTime()]);
    });
    Object.keys(nights).forEach(function(k) {
      var mins = unionMinutes(nights[k]);
      if (mins > 0) slot(k).sleepH = round1(mins / 60);
    });

    function averaged(samples, field) {
      var acc = {};
      (samples || []).forEach(function(s) {
        var v = parseFloat(s.value), when = s.endDate || s.startDate;
        if (isNaN(v) || v <= 0 || !when) return;
        var k = dayKey(new Date(when));
        (acc[k] = acc[k] || []).push(v);
      });
      Object.keys(acc).forEach(function(k) {
        slot(k)[field] = round1(acc[k].reduce(function(a, b) { return a + b; }, 0) / acc[k].length);
      });
    }
    averaged(raw.rhr, 'rhr');
    averaged(raw.hrv, 'hrv');
    return out;
  }

  function merge(existing, incoming) {
    var out = {};
    Object.keys(existing || {}).forEach(function(k) { out[k] = existing[k]; });
    Object.keys(incoming).forEach(function(k) {
      var o = {};
      var prev = out[k] || {};
      Object.keys(prev).forEach(function(f) { o[f] = prev[f]; });
      Object.keys(incoming[k]).forEach(function(f) { o[f] = incoming[k][f]; });
      out[k] = o;
    });
    var keys = Object.keys(out).sort();
    while (keys.length > KEEP_DAYS) delete out[keys.shift()];
    return out;
  }

  /* ---- plugin calls ---- */
  function safe(promise) { return promise.then(function(r) { return r; }, function() { return null; }); }

  function fetchRaw() {
    var P = plugin();
    var end = new Date(), start = new Date(end.getTime() - DAYS * 86400000);
    var range = { startDate: start.toISOString(), endDate: end.toISOString() };
    function samples(type, limit) {
      return safe(P.readSamples({ dataType: type, startDate: range.startDate, endDate: range.endDate, limit: limit }));
    }
    return Promise.all([
      safe(P.queryAggregated({ dataType: 'steps', startDate: range.startDate, endDate: range.endDate, bucket: 'day', aggregation: 'sum' })),
      samples('sleep', 3000),
      samples('restingHeartRate', 500),
      samples('heartRateVariability', 1500)
    ]).then(function(r) {
      function list(x) { return (x && x.samples) || []; }
      return { steps: list(r[0]), sleep: list(r[1]), rhr: list(r[2]), hrv: list(r[3]) };
    });
  }

  function connect() {
    var P = plugin();
    if (!P) return Promise.reject(new Error('Health Connect is only available in the Android app.'));
    return P.isAvailable().then(function(a) {
      if (!a || !a.available) throw new Error((a && a.reason) || 'Health Connect is not available on this phone.');
      return P.requestAuthorization({ read: READ, write: [] });
    }).then(function() {
      Store.save('healthConnected', true);
      return sync(true);
    });
  }

  /* Resolves with the per-day summary when new data was read, or null when skipped */
  function sync(force) {
    if (!available() || !connected()) return Promise.resolve(null);
    var last = Store.get('healthSyncAt', 0);
    if (!force && Date.now() - last < SYNC_GAP_MS) return Promise.resolve(null);
    if (inflight) return inflight;
    inflight = fetchRaw().then(function(raw) {
      var summary = summarize(raw);
      Store.save('health', merge(Store.get('health', {}), summary));
      Store.save('healthSyncAt', Date.now());
      return summary;
    }).then(function(s) { inflight = null; return s; }, function() { inflight = null; return null; });
    return inflight;
  }

  function disconnect() { Store.save('healthConnected', false); }

  function openSettings() {
    var P = plugin();
    return P && P.openHealthConnectSettings ? P.openHealthConnectSettings() : Promise.resolve();
  }

  function today() { return (Store.get('health', {}))[HistoryStore.localDate()] || null; }

  return {
    available: available, connected: connected, connect: connect, sync: sync, disconnect: disconnect,
    openSettings: openSettings, today: today, summarize: summarize, merge: merge, unionMinutes: unionMinutes
  };
})();
