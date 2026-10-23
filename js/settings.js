/* settings.js - ES5 */

function renderSettings() {
  var s         = STATE.settings;
  var bw        = s.bodyWeight || 80;
  var phase     = PROGRAMS.phases[STATE.phase];
  var phaseName = phase ? phase.name : 'Foundation';

  var phasesOptions = PROGRAMS.phases.map(function(p) {
    return '<option value="' + p.id + '"' + (p.id === STATE.phase ? ' selected' : '') + '>' +
      'Phase ' + p.id + ': ' + p.name + ' (' + p.duration + ')' +
    '</option>';
  }).join('');

  var prs  = STATE.personalRecords;
  var prKeys = Object.keys(prs);
  var prHtml = '';
  if (prKeys.length > 0) {
    var units = s.units || 'kg';
    prHtml = '<div class="section-header"><h3>Personal Records</h3><button class="btn btn-ghost btn-sm" onclick="clearPRs()">Clear</button></div>' +
      '<div class="card mb-16">' +
        prKeys.map(function(id) {
          var ex = EXERCISES[id];
          var pr = prs[id];
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">' +
            '<div><div style="font-size:0.88rem;font-weight:500">' + (ex ? ex.name : id) + '</div>' +
              '<div style="font-size:0.75rem;color:var(--text-muted)">' + pr.date + ' &bull; ' + pr.reps + ' reps</div></div>' +
            '<div style="text-align:right">' +
              '<div style="font-size:0.9rem;font-weight:700;color:var(--yellow)">' + pr.weight + ' ' + units + '</div>' +
              '<div style="font-size:0.72rem;color:var(--text-muted)">e1RM: ' + pr.oneRM + ' ' + units + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
  }

  el('settings-content').innerHTML =
    '<div class="top-header"><h2>Settings</h2><span class="badge badge-muted">Your Profile</span></div>' +

    '<div class="card-accent mb-16">' +
      '<div style="display:flex;gap:14px;align-items:center">' +
        '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#0093e7);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">&#x1F3CB;</div>' +
        '<div style="flex:1">' +
          '<h3>Athletic Physique Builder</h3>' +
          '<p style="font-size:0.83rem;margin-top:2px">Phase ' + STATE.phase + ': ' + phaseName + '</p>' +
          '<div style="display:flex;gap:6px;margin-top:6px">' +
            '<span class="badge badge-accent">Streak: ' + STATE.streak + '</span>' +
            '<span class="badge badge-green">Sessions: ' + STATE.completedWorkouts.length + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="section-header"><h3>Training Phase</h3></div>' +
    '<div class="card mb-16">' +
      '<div class="input-group" style="margin-bottom:10px"><label>Current Phase</label>' +
        '<select id="phase-select" onchange="updatePhase(this.value)">' + phasesOptions + '</select>' +
      '</div>' +
      '<div class="input-group" style="margin-bottom:10px"><label>Week in Phase</label>' +
        '<input type="number" id="week-input" min="1" max="12" value="' + STATE.weekInPhase + '" onchange="updateWeek(this.value)">' +
      '</div>' +
      '<div class="input-group" style="margin-bottom:10px"><label>Training Level</label>' +
        '<select id="level-select" onchange="updateLevel(this.value)">' +
          '<option value="experienced"' + (s.level !== 'beginner' ? ' selected' : '') + '>Experienced (returns via Momentum Circuit)</option>' +
          '<option value="beginner"' + (s.level === 'beginner' ? ' selected' : '') + '>Beginner (returns via Break Recovery)</option>' +
        '</select>' +
      '</div>' +
      '<div class="input-group"><label>Running Plan Week</label>' +
        '<input type="number" id="run-week-input" min="1" max="10" value="' + STATE.runningWeek + '" onchange="updateRunWeek(this.value)">' +
      '</div>' +
    '</div>' +

    '<div class="section-header"><h3>Training Mode</h3></div>' +
    '<div class="card mb-16">' +
      '<p style="font-size:0.85rem;margin-bottom:12px">Controls which exercise variations are shown.</p>' +
      '<div class="mode-toggle">' +
        '<button class="mode-btn ' + (STATE.mode === 'gym'        ? 'active' : '') + '" onclick="updateMode(\'gym\')">Gym</button>' +
        '<button class="mode-btn ' + (STATE.mode === 'home'       ? 'active' : '') + '" onclick="updateMode(\'home\')">Home</button>' +
        '<button class="mode-btn ' + (STATE.mode === 'bodyweight' ? 'active' : '') + '" onclick="updateMode(\'bodyweight\')">No Kit</button>' +
      '</div>' +
    '</div>' +

    '<div class="section-header"><h3>Body Weight</h3></div>' +
    '<div class="card mb-16">' +
      '<div class="input-group"><label>Current weight (' + (s.units || 'kg') + ')</label>' +
        '<input type="number" id="bw-setting" value="' + bw + '" min="30" max="200" inputmode="decimal" onchange="updateBodyWeight(this.value)">' +
      '</div>' +
    '</div>' +

    '<div class="section-header"><h3>Preferences</h3></div>' +
    '<div class="card mb-16">' +
      '<div class="input-group" style="margin-bottom:10px"><label>Weight Units</label>' +
        '<select id="units-select" onchange="updateUnits(this.value)">' +
          '<option value="kg"'  + (s.units === 'kg'  ? ' selected' : '') + '>Kilograms (kg)</option>' +
          '<option value="lbs"' + (s.units === 'lbs' ? ' selected' : '') + '>Pounds (lbs)</option>' +
        '</select>' +
      '</div>' +
      '<div class="toggle-row">' +
        '<div><div style="font-size:0.9rem;font-weight:500">Timer Sound</div>' +
          '<div style="font-size:0.78rem;color:var(--text-muted)">Beep on rest timer end and set completion</div></div>' +
        '<label class="toggle-switch">' +
          '<input type="checkbox"' + (typeof SoundSystem !== 'undefined' && SoundSystem.isOn() ? ' checked' : '') + ' onchange="toggleGlobalSound()">' +
          '<span class="toggle-thumb"></span>' +
        '</label>' +
      '</div>' +
    '</div>' +

    prHtml +

    '<div class="section-header"><h3>Returning from Break?</h3></div>' +
    '<div class="card mb-16">' +
      '<div class="input-group"><label>How long was your break?</label>' +
        '<select id="settings-break-duration">' +
          '<option value="">Select...</option>' +
          '<option value="1_week">1 week</option>' +
          '<option value="2_3_weeks">2-3 weeks</option>' +
          '<option value="1_month">1 month</option>' +
          '<option value="2_3_months">2-3 months</option>' +
          '<option value="6_months_plus">6+ months</option>' +
        '</select>' +
      '</div>' +
      '<button class="btn btn-secondary btn-full btn-sm" onclick="assessBreakSettings()">Get Coach Recommendation</button>' +
      '<div id="settings-break-result" style="margin-top:10px"></div>' +
    '</div>' +

    '<div class="section-header"><h3>Data Backup</h3></div>' +
    '<div class="card mb-16">' +
      '<p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:12px">Export saves everything (plan position, workouts, PRs, body log, settings) as one JSON file. On phones it opens the share sheet - save it to Files or Drive. Import restores from a previous export.</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
        '<button class="btn btn-secondary" onclick="exportData()">' + icon('award', 14) + ' Export</button>' +
        '<button class="btn btn-secondary" onclick="triggerImport()">' + icon('refresh', 14) + ' Import</button>' +
      '</div>' +
      '<input type="file" id="import-file-input" accept=".json,application/json,text/plain" style="display:none" onchange="importData(this)">' +
      '<div id="import-result" style="margin-top:6px"></div>' +
      '<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">' +
        '<div style="text-align:center;font-size:0.72rem;color:var(--text-muted);margin:12px 0">Version ' + esc(APP_VERSION) + '</div>' +
      '<button class="btn btn-ghost btn-full" style="color:var(--red);border-color:rgba(239,68,68,0.3)" onclick="resetAllData()">Reset All Data</button>' +
      '</div>' +
    '</div>' +

    '<div style="text-align:center;padding:20px 0;color:var(--text-muted);font-size:0.78rem">Athletic Coach PWA v1.0</div>';
}

function updatePhase(val) {
  Progression.setPhase(parseInt(val, 10), 1);
  showToast('Phase updated to ' + PROGRAMS.phases[STATE.phase].name, 'success');
}
function updateWeek(val) {
  Progression.setWeek(val);
  showToast('Week updated', 'success');
  renderSettings();
}
function updateLevel(val) {
  STATE.settings.level = val === 'beginner' ? 'beginner' : 'experienced';
  Store.save('settings', STATE.settings);
  showToast('Level: ' + STATE.settings.level, 'success');
}
function updateRunWeek(val) {
  STATE.runningWeek = Math.max(1, Math.min(10, parseInt(val) || 1));
  Store.save('runningWeek', STATE.runningWeek);
  showToast('Running week updated', 'success');
}
function updateMode(mode) {
  STATE.mode = mode;
  Store.save('mode', mode);
  renderSettings();
  showToast('Mode: ' + (mode === 'gym' ? 'Gym' : mode === 'home' ? 'Home' : 'No Kit'), 'success');
}
function updateUnits(val) {
  STATE.settings.units = val;
  Store.save('settings', STATE.settings);
  showToast('Units set to ' + val, 'success');
}
function updateBodyWeight(val) {
  var bw = parseFloat(val);
  if (!bw || bw < 30 || bw > 200) return;
  STATE.settings.bodyWeight = bw;
  Store.save('settings', STATE.settings);
  showToast('Body weight updated', 'success');
}
function assessBreakSettings() {
  var sel = el('settings-break-duration');
  var val = sel ? sel.value : '';
  if (!val) { showToast('Select a break duration'); return; }
  var rec = PROGRAMS.breakRecoveryMatrix[val];
  var r = el('settings-break-result');
  if (!rec || !r) return;
  var beginner = STATE.settings.level === 'beginner';
  var msg = beginner
    ? 'Beginner level: ' + PROGRAMS.phases[rec.beginnerPhase].name + ' (Phase ' + rec.beginnerPhase + ').'
    : rec.message;
  r.innerHTML = '<div class="coach-tip" style="margin:0">' +
    '<div class="coach-avatar">&#x1F9E0;</div>' +
    '<div><div class="coach-name">Recommendation</div>' +
      '<p style="font-size:0.83rem">' + esc(msg) + '</p>' +
      '<button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="Progression.applyBreak(\'' + val + '\')">Apply</button>' +
    '</div></div>';
}

/* ---- BACKUP: all ac_* keys, mobile-safe (share sheet -> download -> copy text) ---- */
function buildBackup() {
  var keys = {};
  Store.keys().forEach(function(k) { var v = Store.rawGet(k); if (v !== null) keys[k] = v; });
  return { app: 'athletic-coach', version: Store.SCHEMA, exportDate: new Date().toISOString(), keys: keys };
}

function setBackupMessage(html) {
  var r = el('import-result');
  if (r) r.innerHTML = html;
}

function backupError(msg) {
  return '<div class="mistake-item mt-4">' + icon('warning', 12) + ' ' + esc(msg) + '</div>';
}

function exportData() {
  var json, name = 'athletic-coach-backup-' + todayStr() + '.json';
  try { json = JSON.stringify(buildBackup()); } catch(e) { showToast('Export failed.', 'error'); return; }
  var blob = new Blob([json], { type: 'application/json' });
  var file = null;
  try { file = new File([blob], name, { type: 'application/json' }); } catch(e) {}

  /* Share sheet: the only reliable way to save files from iOS standalone / many Android WebViews */
  if (file && navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: 'Athletic Coach backup' })
      .then(function() { showToast('Backup shared', 'success'); })
      .catch(function(err) { if (!err || err.name !== 'AbortError') downloadBackup(blob, name, json); });
    return;
  }
  downloadBackup(blob, name, json);
}

function downloadBackup(blob, name, json) {
  try {
    var url = URL.createObjectURL(blob);
    var a   = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
    showToast('Backup saved', 'success');
  } catch(e) {
    setBackupMessage(
      '<p style="font-size:0.8rem;color:var(--text-muted);margin:6px 0">Download blocked. Copy this text and save it somewhere safe.</p>' +
      '<textarea id="backup-text" readonly rows="5" style="width:100%;font-size:0.7rem">' + esc(json) + '</textarea>' +
      '<button class="btn btn-secondary btn-sm mt-8" onclick="var t=el(\'backup-text\');t.select();document.execCommand(\'copy\');showToast(\'Copied\',\'success\')">Copy</button>');
  }
}

function triggerImport() {
  var inp = el('import-file-input');
  if (inp) inp.click();
}

function importData(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) { setBackupMessage(backupError('File too large for a backup.')); input.value = ''; return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    var res = restoreBackup(String(e.target.result));
    input.value = '';
    if (!res.ok) { setBackupMessage(backupError(res.msg)); return; }
    setBackupMessage(
      '<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:var(--radius-sm);padding:10px;margin-top:6px">' +
        icon('check', 14) + ' <span style="font-size:0.85rem;color:var(--green);font-weight:600">Import successful</span>' +
        '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">' + res.count + ' data sets restored' +
        (res.date ? '<br>Backup from: ' + esc(new Date(res.date).toLocaleDateString()) : '') + '</div>' +
      '</div>');
    setTimeout(function() { renderSettings(); }, 1500);
  };
  reader.onerror = function() { setBackupMessage(backupError('Could not read the file.')); };
  reader.readAsText(file);
}

/* Validate, write, and roll back fully if anything fails */
function restoreBackup(text) {
  var data;
  try { data = JSON.parse(text); } catch(e) { return { ok: false, msg: 'Not a valid backup file.' }; }
  var incoming = {};

  if (data && data.keys && typeof data.keys === 'object') {
    Object.keys(data.keys).forEach(function(k) {
      if (/^ac_[a-z0-9_]+$/i.test(k) && typeof data.keys[k] === 'string') incoming[k] = data.keys[k];
    });
  } else if (data && (typeof data.phase !== 'undefined' || typeof data.streak !== 'undefined')) {
    /* Legacy (v1) export */
    ['phase','weekInPhase','runningWeek','streak','lastWorkoutDate','completedWorkouts','personalRecords','settings'].forEach(function(f) {
      if (typeof data[f] !== 'undefined') incoming['ac_' + f] = JSON.stringify(data[f]);
    });
  } else {
    return { ok: false, msg: 'Not an Athletic Coach backup.' };
  }

  Object.keys(incoming).forEach(function(k) {
    try { JSON.parse(incoming[k]); } catch(e) { delete incoming[k]; }
  });
  var count = Object.keys(incoming).length;
  if (!count) return { ok: false, msg: 'Backup contains no usable data.' };

  var snapshot = {};
  Store.keys().forEach(function(k) { snapshot[k] = Store.rawGet(k); });
  var failed = false;
  Object.keys(incoming).forEach(function(k) { if (!Store.rawSet(k, incoming[k])) failed = true; });
  if (failed) {
    Object.keys(incoming).forEach(function(k) { if (!(k in snapshot)) Store.rawRemove(k); });
    Object.keys(snapshot).forEach(function(k) { Store.rawSet(k, snapshot[k]); });
    return { ok: false, msg: 'Storage full. Nothing was changed.' };
  }
  Store.loadAll();
  return { ok: true, count: count, date: data.exportDate || null };
}

function resetAllData() {
  if (!confirm('Erase all progress, PRs, and settings?')) return;
  if (!confirm('Really? Permanent.')) return;
  Store.keys().forEach(function(k) { Store.rawRemove(k); });
  location.reload();
}

function clearPRs() {
  if (!confirm('Clear all personal records?')) return;
  STATE.personalRecords = {};
  Store.save('personalRecords', {});
  renderSettings();
  showToast('PRs cleared', 'success');
}
