/* AUTOMATIC BACKUP (Android APK) - ES5
   Writes one JSON file per day (last 7 kept) to Documents/AthleticCoach, falling back to private app storage.
   If the user picked a folder (for example inside Google Drive), the same file is copied there too.
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
  var IGNORE = /^ac_(backupmeta|backupfolder|backupfolderstatus|health|healthSyncAt|healthConnected|healthdiag|schema)$/;

  var dirty = false, busy = false, timer = null;

  function fs() { return Native.plugin('Filesystem'); }
  function folderPlugin() { return Native.plugin('FolderBackup'); }
  function enabled() { return !!fs(); }
  function meta() { return Store.get('backupmeta', {}); }
  function folderCfg() { return Store.get('backupfolder', null); }
  function folderStatus() { return Store.get('backupfolderstatus', {}); }
  function errText(err) { return String((err && err.message) || err || 'failed'); }

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

  /* ---- chosen folder (Storage Access Framework, e.g. Google Drive) ---- */
  function folderNames(cfg) {
    return folderPlugin().listFiles({ uri: cfg.uri }).then(function(res) {
      return (res.files || []).map(function(f) { return f.name; }).filter(function(n) { return NAME_RE.test(n); });
    });
  }

  /* Resolves true when the copy worked; failures are recorded for Settings, never thrown */
  function copyToFolder(name, json) {
    var cfg = folderCfg(), P = folderPlugin();
    if (!cfg || !P) return Promise.resolve(false);
    return P.writeFile({ uri: cfg.uri, name: name, data: json }).then(function() {
      return folderNames(cfg).then(function(list) {
        list.sort();
        var old = list.slice(0, Math.max(0, list.length - KEEP));
        return Promise.all(old.map(function(n) { return P.deleteFile({ uri: cfg.uri, name: n }).catch(function() {}); }));
      }).catch(function() {});
    }).then(function() {
      Store.save('backupfolderstatus', { ts: Date.now(), name: name });
      return true;
    }, function(err) {
      var prev = folderStatus();
      Store.save('backupfolderstatus', { ts: prev.ts || null, name: prev.name || null, error: errText(err) });
      return false;
    });
  }

  /* reason: label only. force: back up even if today's file is current. Resolves true when a file was written. */
  function run(reason, force) {
    if (!enabled() || busy) return Promise.resolve(false);
    var today = HistoryStore.localDate();
    var m = meta();
    if (!force && !dirty && m.date === today && !m.error && !folderStatus().error) return Promise.resolve(false);

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
      Store.save('backupmeta', { date: m.date || null, ts: m.ts || null, where: m.where || null, name: m.name || null, error: errText(err) });
      return false;
    }).then(function(localOk) {
      return copyToFolder(name, json).then(function(folderOk) { return localOk || folderOk; });
    }).then(function(ok) { busy = false; return ok; });
  }

  /* [{ name, where }] newest first, across the local and folder locations */
  function list() {
    if (!enabled()) return Promise.resolve([]);
    var cfg = folderCfg();
    var fromFolder = (cfg && folderPlugin()) ? folderNames(cfg).catch(function() { return []; }) : Promise.resolve([]);
    return Promise.all([names('DOCUMENTS'), names('DATA'), fromFolder]).then(function(r) {
      var out = [], seen = {};
      function add(n, where) { var k = n + '|' + where; if (!seen[k]) { seen[k] = true; out.push({ name: n, where: where }); } }
      r[0].forEach(function(n) { add(n, 'DOCUMENTS'); });
      r[1].forEach(function(n) { add(n, 'DATA'); });
      r[2].forEach(function(n) { add(n, 'FOLDER'); });
      out.sort(function(a, b) { return a.name < b.name ? 1 : (a.name > b.name ? -1 : 0); });
      return out;
    });
  }

  /* Resolves with the result object of restoreBackup() */
  function restore(name, where) {
    var cfg = folderCfg();
    if (!enabled() || !NAME_RE.test(name) || (where !== 'DOCUMENTS' && where !== 'DATA' && where !== 'FOLDER')) {
      return Promise.resolve({ ok: false, msg: 'Backup not available.' });
    }
    var read = where === 'FOLDER'
      ? (cfg && folderPlugin() ? folderPlugin().readFile({ uri: cfg.uri, name: name }) : Promise.reject(new Error('no folder')))
      : fs().readFile({ path: DIR + '/' + name, directory: where, encoding: 'utf8' });
    return read.then(function(res) { return restoreBackup(String(res.data)); })
      .catch(function() { return { ok: false, msg: 'Could not read that backup.' }; });
  }

  /* Choose the Drive (or any) folder once; the first copy is made straight away */
  function chooseFolder() {
    var P = folderPlugin();
    if (!P) return Promise.reject(new Error('Choosing a folder works in the Android app.'));
    return P.pickFolder().then(function(r) {
      Store.save('backupfolder', { uri: r.uri, name: r.name });
      Store.save('backupfolderstatus', {});
      return run('folder', true).then(function() { return r; });
    });
  }

  function clearFolder() {
    Store.save('backupfolder', null);
    Store.save('backupfolderstatus', {});
  }

  function init() {
    if (!enabled()) return;
    Store.onWrite = noteWrite;
    run('open', false);
    setInterval(function() { run('timer', false); }, CHECK_MS);
  }

  return {
    enabled: enabled, folderSupported: function() { return !!folderPlugin(); }, folder: folderCfg, folderStatus: folderStatus,
    chooseFolder: chooseFolder, clearFolder: clearFolder,
    init: init, run: run, list: list, restore: restore, meta: meta, noteWrite: noteWrite
  };
})();
