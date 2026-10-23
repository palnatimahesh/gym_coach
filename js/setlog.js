/* --- SET LOGGING: log types, set rows, set timer, rest --- ES5 ---
   The log type is derived from the PRESCRIPTION (e.g. "40s", "8/side", "40m", "10-12"),
   not only from the exercise, so rep-based and time-based variations never mix.

   Kinds:
     weighted        load + reps
     weighted_bw     added load (optional) + reps
     bodyweight      reps
     per_side        load (optional) + reps per side
     timed           seconds, with start timer
     timed_bilateral seconds per side, timer runs both sides
     distance        load + metres                                           */

var TIMED_EXERCISES   = { plank: true, wall_sit: true, hollow_body_hold: true, mountain_climber: true, high_knees: true, jump_rope: true, superman: true };
var TIMED_BILATERAL   = { hip_flexor_stretch: true };
var WEIGHTED_BW       = { pullup: true, chinup: true, inverted_row: true, bodyweight_tricep_dip: true };
var DISTANCE_EXERCISES = { farmer_carry: true };
var REPS_ONLY_EQUIPMENT = { bodyweight: true, pullup_bar: true, resistance_band: true };
var PR_KINDS = { weighted: true, weighted_bw: true, per_side: true };
var PER_SIDE_EXERCISES = { dead_bug: true, bicycle_crunch: true, single_leg_glute_bridge: true, step_up: true, reverse_lunge: true, bulgarian_split_squat: true, nordic_curl: true };

/* Default kind from the exercise alone (used when there is no prescription) */
function getLogType(exId) {
  var ex = EXERCISES[exId];
  if (!ex) return 'weighted';
  if (DISTANCE_EXERCISES[exId])  return 'distance';
  if (TIMED_BILATERAL[exId])     return 'timed_bilateral';
  if (TIMED_EXERCISES[exId])     return 'timed';
  if (PER_SIDE_EXERCISES[exId])  return 'per_side';
  return repsKind(exId);
}

/* Reps-based kind for an exercise */
function repsKind(exId) {
  var ex = EXERCISES[exId];
  if (WEIGHTED_BW[exId]) return 'weighted_bw';
  if (ex && REPS_ONLY_EQUIPMENT[ex.equipment]) return 'bodyweight';
  return 'weighted';
}

/* Kind for an exercise given its prescribed reps string */
function getLogTypeFor(exId, repsSpec) {
  var spec = String(repsSpec || '').toLowerCase();
  if (!spec) return getLogType(exId);
  var perSide = /(\/\s*side|each|per side|\/\s*leg|\/\s*arm)/.test(spec);
  if (/\d\s*m\b/.test(spec) && !/min/.test(spec)) return 'distance';
  if (/\d\s*(s|sec|secs|seconds|min)\b/.test(spec)) return perSide ? 'timed_bilateral' : 'timed';
  if (perSide) return 'per_side';
  var base = getLogType(exId);
  if (base === 'timed' || base === 'timed_bilateral' || base === 'distance' || base === 'per_side') return repsKind(exId);
  return base;
}

function isTimedKind(k) { return k === 'timed' || k === 'timed_bilateral'; }

/* "30s" -> 30, "30-60s" -> 30, "60s/side" -> 60, "2 min" -> 120 */
function parseTimedSecs(repsStr) {
  var s = String(repsStr || '').toLowerCase();
  var mins = s.match(/(\d+)\s*min/);
  if (mins) return parseInt(mins[1], 10) * 60;
  var range = s.match(/(\d+)\s*-\s*\d+\s*s/);
  if (range) return parseInt(range[1], 10);
  var single = s.match(/(\d+)\s*(?:s|sec|secs|seconds)\b/);
  return single ? parseInt(single[1], 10) : 0;
}

function findSessionExercise(key) {
  var list = activeWorkout.exercises || [];
  for (var i = 0; i < list.length; i++) {
    if ((list[i]._key || (list[i].id + '_' + i)) === key) return list[i];
  }
  return null;
}

function setKindForKey(key) {
  var ex = findSessionExercise(key);
  return ex ? getLogTypeFor(ex.id, ex.reps) : getLogType(key.replace(/_\d+$/, ''));
}

/* Rest between sets, from prescription, not a flat per-exercise number */
function getRestSeconds(ex) {
  if (ex._rest !== undefined) return ex._rest;
  var data = EXERCISES[ex.id] || {};
  var kind = getLogTypeFor(ex.id, ex.reps);
  var rest = data.rest || 60;
  if (isTimedKind(kind) || ex._isCore) return Math.min(rest, 45);
  if (kind === 'weighted') {
    var hi = HistoryStore.parseRepRange(ex.reps).hi;
    if (hi <= 6) return Math.max(rest, 180);
    if (hi <= 10 && (data.category === 'legs' || data.category === 'push' || data.category === 'pull')) return Math.max(rest, 90);
  }
  return rest;
}

/* Fill target seconds when a timed set is ticked without typing a value */
function autoFillTimed(key, set) {
  var ex = findSessionExercise(key);
  if (!ex || set.reps) return;
  var kind = getLogTypeFor(ex.id, ex.reps);
  if (isTimedKind(kind)) set.reps = String(parseTimedSecs(ex.reps) || 30);
}

/* ---- ROW RENDERING ---- */
function numInput(key, setIdx, field, ph, val, width, mode) {
  return '<input class="set-input" type="number" placeholder="' + ph + '" value="' + esc(val || '') + '" ' +
    'oninput="updateSetData(\'' + key + '\',' + setIdx + ',\'' + field + '\',this.value)" style="max-width:' + width + 'px" inputmode="' + mode + '">';
}

function renderSetRow(key, setIdx, setData) {
  var ex      = findSessionExercise(key);
  var exId    = ex ? ex.id : key.replace(/_\d+$/, '');
  var kind    = ex ? getLogTypeFor(ex.id, ex.reps) : getLogType(exId);
  var units   = STATE.settings.units;
  var done    = setData.done;
  var inner   = '';
  var lbl     = function(t) { return '<span class="set-label">' + t + '</span>'; };

  if (kind === 'weighted') {
    inner = numInput(key, setIdx, 'weight', units, setData.weight, 60, 'decimal') + lbl(units) +
            numInput(key, setIdx, 'reps', 'Reps', setData.reps, 52, 'numeric') + lbl('reps');
  } else if (kind === 'bodyweight') {
    inner = '<div style="flex:1;text-align:center;font-size:0.78rem;color:var(--text-muted)">Bodyweight</div>' +
            numInput(key, setIdx, 'reps', 'Reps', setData.reps, 60, 'numeric') + lbl('reps');
  } else if (kind === 'weighted_bw') {
    inner = numInput(key, setIdx, 'weight', '+' + units, setData.weight, 58, 'decimal') + lbl('+' + units) +
            numInput(key, setIdx, 'reps', 'Reps', setData.reps, 52, 'numeric') + lbl('reps');
  } else if (kind === 'per_side') {
    inner = numInput(key, setIdx, 'weight', units, setData.weight, 52, 'decimal') + lbl(units) +
            numInput(key, setIdx, 'reps', 'Reps', setData.reps, 46, 'numeric') + lbl('reps/side');
  } else if (kind === 'timed' || kind === 'timed_bilateral') {
    var target = ex ? parseTimedSecs(ex.reps) : 0;
    inner = numInput(key, setIdx, 'reps', target || 'sec', setData.reps, 62, 'numeric') +
            lbl(kind === 'timed_bilateral' ? 'sec/side' : 'sec') +
            (done ? '<div style="flex:1"></div>' :
              '<button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="startSetTimer(\'' + key + '\',' + setIdx + ')">' + icon('play', 12) + ' Timer</button>');
  } else if (kind === 'distance') {
    inner = numInput(key, setIdx, 'weight', units, setData.weight, 58, 'decimal') + lbl(units) +
            numInput(key, setIdx, 'reps', 'm', setData.reps, 50, 'numeric') + lbl('m');
  }

  return '<div class="set-row ' + (done ? 'completed' : '') + '" id="set-' + key + '-' + setIdx + '">' +
    '<div class="set-num">' + (setIdx + 1) + '</div>' + inner +
    '<button class="set-check" onclick="completeSet(\'' + key + '\',' + setIdx + ')" aria-label="Complete set">' +
      (done ? icon('check', 16) : '') +
    '</button>' +
  '</div>';
}

/* ---- SET TIMER (timestamp based: survives mobile tab throttling) ---- */
var SetTimer = { iv: null, overlay: null };

function cancelSetTimer() {
  if (SetTimer.iv) { clearInterval(SetTimer.iv); SetTimer.iv = null; }
  if (SetTimer.overlay && SetTimer.overlay.parentNode) SetTimer.overlay.parentNode.removeChild(SetTimer.overlay);
  SetTimer.overlay = null;
}

function startSetTimer(key, setIdx) {
  var ex = findSessionExercise(key);
  if (!ex) return;
  var kind  = getLogTypeFor(ex.id, ex.reps);
  var secs  = parseTimedSecs(ex.reps) || 30;
  var sides = kind === 'timed_bilateral' ? 2 : 1;
  var name  = (EXERCISES[ex.id] || {}).name || ex.id;

  cancelSetTimer();
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.88);z-index:400;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--font);padding:20px;text-align:center';
  document.body.appendChild(overlay);
  SetTimer.overlay = overlay;

  var stage = 'ready', side = 1, total = 3, endAt = Date.now() + 3000, lastBeep = -1;

  function paint(rem) {
    var color = stage === 'ready' ? '#f59e0b' : (side === 1 ? '#3b82f6' : '#00d4b4');
    var head  = stage === 'ready' ? 'Get ready' : (sides === 2 ? 'Side ' + side + ' of 2' : 'Hold');
    var pct   = Math.round(((total - rem) / total) * 100);
    overlay.innerHTML =
      '<div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:6px">' + esc(name) + '</div>' +
      '<div style="font-size:0.9rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">' + head + '</div>' +
      '<div style="font-size:5rem;font-weight:800;color:' + color + ';font-family:var(--mono);line-height:1">' + rem + '</div>' +
      '<div style="width:200px;height:4px;background:var(--bg-card);border-radius:100px;margin:20px auto"><div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:100px"></div></div>' +
      '<button class="btn btn-secondary" onclick="cancelSetTimer()">Cancel</button>';
  }

  function tick() {
    var rem = Math.ceil((endAt - Date.now()) / 1000);
    if (rem <= 0) {
      if (stage === 'ready') {
        stage = 'work'; total = secs; endAt = Date.now() + secs * 1000; lastBeep = -1;
        if (typeof SoundSystem !== 'undefined') SoundSystem.stepDone();
        rem = secs;
      } else if (side < sides) {
        side++; total = secs; endAt = Date.now() + secs * 1000; lastBeep = -1;
        if (typeof SoundSystem !== 'undefined') SoundSystem.stepDone();
        rem = secs;
      } else {
        cancelSetTimer();
        if (typeof SoundSystem !== 'undefined') SoundSystem.restDone();
        var set = activeWorkout.sets[key] && activeWorkout.sets[key][setIdx];
        if (set && !set.done) { set.reps = String(secs); completeSet(key, setIdx); }
        return;
      }
    }
    if (rem <= 3 && rem !== lastBeep && typeof SoundSystem !== 'undefined') { lastBeep = rem; SoundSystem.countdown(rem); }
    paint(rem);
  }

  tick();
  SetTimer.iv = setInterval(tick, 250);
}
