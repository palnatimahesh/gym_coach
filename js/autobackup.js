/* AUTOMATIC BACKUP (Android APK) - ES5
   Writes one JSON file per day (last 7 kept) to Documents/AthleticCoach, falling back to private app storage.
   Runs on the first open of each day, when the app goes to the background after changes, and shortly after changes.
   Android also backs the app data up to the user's Google account on its own (Auto Backup).
   Android cannot run web code while the app is closed, so "nightly" means: the first time the app is opened
   or backgrounded after midnight, plus the system Auto Backup. */

var AutoBackup = (function() {

  var DIR = 'AthleticCoach';
  var KEEP = 7;
  var DEBOUNCE_MS = 120000;
  var CHECK_MS = 30 * 60 * 1000;
  var NAME_RE = /^backup-\d{4}-\d{2}-\d{2}\.json$/;
  /* Writes that do not make the backup stale (derived or bookkeeping data) */
  var IGNORE = /^ac_(backupmeta|health|healthSyncAt|healthConnected|schema)$/;

  var dirty = false, busy = false, timer = null;

  function fs() { return Native.plugin('Filesystem'); }
  function enabled() { return !!fs(); }
  function meta() { return Store.get('backupmeta', {}); }

  function noteWrite(key) {
    if (!enabled() || IGNORE.test(key)) return;
    dirty = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() { run('change', false); }, DEBOUNCE_MS);
  }

  function writeTo(directory, name, json) {
    return fs().writeFile({ path: DIR + '/' + name, data: json, directory: directory, encoding: 'utf8', recursive: true })
      .then(function() { return directory; });
  }

  function write(name, json) {
    return writeTo('DOCUMENTS', name, json).catch(function() { return writeTo('DATA', name, json); });
  }

  function names(directory) {
    return fs().readdir({ path: DIR, directory: directory }).then(function(res) {
      return (res.files || []).map(function(f) { return typeof f === 'string' ? f : f.name; }).filter(function(n) { return NAME_RE.test(n); });
    }).catch(function() { return []; });
  }

  function prune(directory) {
    return names(directory).then(function(list) {
      list.sort();
      var old = list.slice(0, Math.max(0, list.length - KEEP));
      return Promise.all(old.map(function(n) {
        return fs().deleteFile({ path: DIR + '/' + n, directory: directory }).catch(function() {});
      }));
    });
  }

  /* reason: label only. force: back up even if today's file is current. Resolves true when a file was written. */
  function run(reason, force) {
    if (!enabled() || busy) return Promise.resolve(false);
    var today = HistoryStore.localDate();
    var m = meta();
    if (!force && !dirty && m.date === today && !m.error) return Promise.resolve(false);

    busy = true;
    var name = 'backup-' + today + '.json';
    var json;
    try { json = JSON.stringify(buildBackup()); }
    catch(e) { busy = false; return Promise.resolve(false); }

    return write(name, json).then(function(where) {
      dirty = false;
      Store.save('backupmeta', { date: today, ts: Date.now(), where: where, name: name, reason: reason, bytes: json.length });
      return prune(where).then(function() { return true; });
    }).catch(function(err) {
      Store.save('backupmeta', { date: m.date || null, ts: m.ts || null, where: m.where || null, name: m.name || null, error: String((err && err.message) || err || 'write failed') });
      return false;
    }).then(function(ok) { busy = false; return ok; });
  }

  /* [{ name, where }] newest first, across both locations */
  function list() {
    if (!enabled()) return Promise.resolve([]);
    return Promise.all([names('DOCUMENTS'), names('DATA')]).then(function(r) {
      var out = [], seen = {};
      r[0].forEach(function(n) { out.push({ name: n, where: 'DOCUMENTS' }); seen[n] = true; });
      r[1].forEach(function(n) { if (!seen[n]) out.push({ name: n, where: 'DATA' }); });
      out.sort(function(a, b) { return a.name < b.name ? 1 : -1; });
      return out;
    });
  }

  /* Resolves with the result object of restoreBackup() */
  function restore(name, where) {
    if (!enabled() || !NAME_RE.test(name) || (where !== 'DOCUMENTS' && where !== 'DATA')) {
      return Promise.resolve({ ok: false, msg: 'Backup not available.' });
    }
    return fs().readFile({ path: DIR + '/' + name, directory: where, encoding: 'utf8' }).then(function(res) {
      return restoreBackup(String(res.data));
    }).catch(function() { return { ok: false, msg: 'Could not read that backup.' }; });
  }

  function init() {
    if (!enabled()) return;
    Store.onWrite = noteWrite;
    run('open', false);
    setInterval(function() { run('timer', false); }, CHECK_MS);
  }

  return { enabled: enabled, init: init, run: run, list: list, restore: restore, meta: meta, noteWrite: noteWrite };
})();
