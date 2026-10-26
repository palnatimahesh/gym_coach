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

    /* Sleep: when real stages (light/deep/REM) exist for a night, only those count. A generic whole-night
       "sleeping" record also contains the awake time and would overstate the total. */
    var nights = {}, windows = {};
    (raw.sleep || []).forEach(function(s) {
      if (!s.startDate || !s.endDate || !isAsleep(s)) return;
      var end = new Date(s.endDate), start = new Date(s.startDate);
      if (isNaN(end.getTime()) || isNaN(start.getTime())) return;
      var stage = String(s.sleepState || '').toLowerCase().replace(/[^a-z]/g, '');
      var n = nights[wakeKey(end)] = nights[wakeKey(end)] || { staged: [], generic: [] };
      (stage === 'light' || stage === 'deep' || stage === 'rem' ? n.staged : n.generic).push([start.getTime(), end.getTime()]);
    });
    Object.keys(nights).forEach(function(k) {
      var iv = nights[k].staged.length ? nights[k].staged : nights[k].generic;
      var mins = unionMinutes(iv);
      if (mins <= 0) return;
      slot(k).sleepH = round1(mins / 60);
      windows[k] = [Math.min.apply(null, iv.map(function(i) { return i[0]; })), Math.max.apply(null, iv.map(function(i) { return i[1]; }))];
    });

    /* Group readings by wake-up day, with their time */
    function byDay(samples) {
      var acc = {};
      (samples || []).forEach(function(s) {
        var v = parseFloat(s.value), when = s.endDate || s.startDate;
        if (isNaN(v) || v <= 0 || !when) return;
        var t = new Date(when);
        if (isNaN(t.getTime())) return;
        (acc[wakeKey(t)] = acc[wakeKey(t)] || []).push({ v: v, t: t.getTime() });
      });
      return acc;
    }
    function mean(list) { return list.reduce(function(a, b) { return a + b.v; }, 0) / list.length; }

    /* Resting heart rate: the latest reading */
    var rhr = byDay(raw.rhr);
    Object.keys(rhr).forEach(function(k) {
      slot(k).rhr = round1(rhr[k].sort(function(a, b) { return b.t - a.t; })[0].v);
    });
    /* HRV: average over last night's sleep window (daytime readings are lower and not comparable) */
    var hrv = byDay(raw.hrv);
    Object.keys(hrv).forEach(function(k) {
      var w = windows[k];
      var inSleep = w ? hrv[k].filter(function(x) { return x.t >= w[0] && x.t <= w[1]; }) : [];
      slot(k).hrv = round1(mean(inSleep.length ? inSleep : hrv[k]));
    });
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
  function dedupe(list) {
    var seen = {}, out = [];
    list.forEach(function(s) {
      var k = [s.startDate, s.endDate, s.value].join('|');
      if (!seen[k]) { seen[k] = true; out.push(s); }
    });
    return out;
  }

  /* Two reads per sample type: a short recent window with a large limit (so the newest readings can never be
     cut off when the plugin returns oldest-first) plus the 30-day history. Errors are recorded, not swallowed. */
  function fetchRaw() {
    var P = plugin();
    var end = new Date(), errors = {};
    function win(days) { return { startDate: new Date(end.getTime() - days * 86400000).toISOString(), endDate: end.toISOString() }; }
    function fail(type) { return function(e) { errors[type] = String((e && e.message) || e); return null; }; }
    function samples(type, days, limit) {
      var w = win(days);
      return P.readSamples({ dataType: type, startDate: w.startDate, endDate: w.endDate, limit: limit })
        .then(function(r) { return (r && r.samples) || []; }, function(e) { fail(type)(e); return []; });
    }
    function both(type, limit) {
      return Promise.all([samples(type, 3, 5000), samples(type, DAYS, limit)]).then(function(r) { return dedupe(r[0].concat(r[1])); });
    }
    var w30 = win(DAYS);
    var steps = P.queryAggregated({ dataType: 'steps', startDate: w30.startDate, endDate: w30.endDate, bucket: 'day', aggregation: 'sum' })
      .then(function(r) { return (r && r.samples) || []; }, function(e) { fail('steps')(e); return []; });
    return Promise.all([steps, both('sleep', 3000), both('restingHeartRate', 500), both('heartRateVariability', 3000)]).then(function(r) {
      return { raw: { steps: r[0], sleep: r[1], rhr: r[2], hrv: r[3] }, errors: errors };
    });
  }

  /* What the last read actually returned, shown in Settings so a silent failure is visible */
  function saveDiag(raw, errors) {
    var diag = { at: Date.now(), counts: {}, newest: {}, errors: errors };
    Object.keys(raw).forEach(function(k) {
      diag.counts[k] = raw[k].length;
      var newest = '';
      raw[k].forEach(function(s) { var d = s.endDate || s.startDate || ''; if (d > newest) newest = d; });
      diag.newest[k] = newest ? dayKey(new Date(newest)) : null;
    });
    Store.save('healthdiag', diag);
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
    inflight = fetchRaw().then(function(res) {
      var raw = res.raw;
      saveDiag(raw, res.errors);
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

  /* Newest recorded value for a field: { value, date } or null (sleep/HRV land on the wake-up day, steps build up all day) */
  function latest(field) {
    var H = Store.get('health', {});
    var keys = Object.keys(H).sort().reverse();
    for (var i = 0; i < keys.length; i++) {
      if (typeof H[keys[i]][field] === 'number') return { value: H[keys[i]][field], date: keys[i] };
    }
    return null;
  }

  function ageLabel(date) {
    var d = dayDiff(date, HistoryStore.localDate());
    return d <= 0 ? 'today' : (d === 1 ? 'yesterday' : date.slice(5));
  }

  return {
    available: available, connected: connected, connect: connect, sync: sync, disconnect: disconnect,
    openSettings: openSettings, today: today, latest: latest, ageLabel: ageLabel, summarize: summarize, merge: merge, unionMinutes: unionMinutes
  };
})();
