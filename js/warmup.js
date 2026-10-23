/* --- WARMUP & MOBILITY PAGE + GUIDED PLAYER --- */

var Guide = {
  active: false, routine: null, routineId: null, stepIndex: 0,
  timer: null, secondsLeft: 0, totalSeconds: 0, paused: false,
  breathPhase: 'in', breathTimer: null, type: 'warmup'
};

function renderWarmup() {
  try {
    var todayRec = getTodayWarmupRecommendation();

    el('warmup-content').innerHTML =
      '<div class="top-header">' +
        '<h2>Warmup & Mobility</h2>' +
      '</div>' +

      // Two prominent action cards  before and after workout
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +

        // PRE-WORKOUT warmup
        '<div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:var(--radius-lg);padding:14px">' +
          '<div style="font-size:0.72rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Before Workout</div>' +
          '<div style="font-size:0.9rem;font-weight:700;margin-bottom:4px">Warmup</div>' +
          '<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px">' +
            (todayRec && todayRec.routine ? todayRec.routine.duration : '10-12 min') + ' &bull; Raises heart rate &bull; Activates muscles' +
          '</div>' +
          '<button class="btn btn-primary btn-full btn-sm" onclick="SoundSystem.unlock();startGuidedWarmup(\'' +
            (todayRec && todayRec.map ? todayRec.map.routineId : 'full_body') +
          '\',\'warmup\')">' + icon('play', 14) + ' Start Warmup</button>' +
        '</div>' +

        // POST-WORKOUT cooldown
        '<div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:var(--radius-lg);padding:14px">' +
          '<div style="font-size:0.72rem;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">After Workout</div>' +
          '<div style="font-size:0.9rem;font-weight:700;margin-bottom:4px">Cooldown</div>' +
          '<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px">' +
            '20-25 min &bull; Stretching &bull; Foam rolling &bull; Recovery' +
          '</div>' +
          '<button class="btn btn-secondary btn-full btn-sm" onclick="SoundSystem.unlock();startGuidedWarmup(\'mobility_only\',\'cooldown\')">' + icon('heart', 14) + ' Start Cooldown</button>' +
        '</div>' +

      '</div>' +

      // Today context
      (todayRec && !todayRec.session.rest ? renderTodayWarmupContext(todayRec) : '') +

      // Tabs for explore
      '<div class="tabs" id="warmup-tabs" style="margin-top:16px">' +
        '<button class="tab active" onclick="switchWarmupTab(\'routines\',this)">Warmup Routines</button>' +
        '<button class="tab" onclick="switchWarmupTab(\'stretches\',this)">Stretch Library</button>' +
        '<button class="tab" onclick="switchWarmupTab(\'foam\',this)">Foam Rolling</button>' +
      '</div>' +
      '<div id="warmup-tab-content">' + renderWarmupRoutines() + '</div>';

  } catch(e) {
    el('warmup-content').innerHTML =
      '<div class="top-header"><h2>Warmup &amp; Mobility</h2></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
        '<button class="btn btn-primary" onclick="SoundSystem.unlock();startGuidedWarmup(\'full_body\',\'warmup\')">' + icon('play', 14) + ' Start Warmup</button>' +
        '<button class="btn btn-secondary" onclick="SoundSystem.unlock();startGuidedWarmup(\'mobility_only\',\'cooldown\')">' + icon('heart', 14) + ' Start Cooldown</button>' +
      '</div>' +
      '<div class="tabs" id="warmup-tabs">' +
        '<button class="tab active" onclick="switchWarmupTab(\'routines\',this)">Warmup Routines</button>' +
        '<button class="tab" onclick="switchWarmupTab(\'stretches\',this)">Stretch Library</button>' +
        '<button class="tab" onclick="switchWarmupTab(\'foam\',this)">Foam Rolling</button>' +
      '</div>' +
      '<div id="warmup-tab-content">' + renderWarmupRoutinesFallback() + '</div>';
    console.error('renderWarmup:', e);
  }
}

function renderTodayWarmupContext(rec) {
  var color = warmupColor((rec.map || {}).routineId);
  var session = rec.session;
  return '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:4px">' +
    '<div style="font-size:0.72rem;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Today: ' + session.focus + '</div>' +
    '<div style="font-size:0.82rem;color:var(--text-muted)">' + ((rec.map || {}).reason || 'Complete both warmup and cooldown for best results.') + '</div>' +
  '</div>';
}


/*  RECOMMENDATION ENGINE  */
var WARMUP_MAP = [
  { keywords: ['upper heavy','upper light','push','pull','me upper','de upper','max effort upper','dynamic effort upper'],
    routineId: 'upper_body', reason: 'Upper body session -- shoulder capsule, thoracic spine and scapular activation needed.',
    postRoutine: 'mobility_only', postReason: 'Post upper -- chest opener, lat stretch and spinal twist to restore shoulder position.' },
  { keywords: ['lower heavy','lower light','legs','squat','deadlift','me lower','de lower','max effort lower','dynamic effort lower'],
    routineId: 'lower_body', reason: 'Lower body session -- hip flexors, ankles and glute activation mandatory.',
    postRoutine: 'mobility_only', postReason: 'Post lower -- hip flexor, quad, hamstring and calf stretches.' },
  { keywords: ['full body','activation','athletic'],
    routineId: 'full_body', reason: 'Full body session -- raise core temperature and mobilise every major joint.',
    postRoutine: 'mobility_only', postReason: '10 min total body stretch. Focus on whatever felt tightest.' },
  { keywords: ['run','cardio','zone','long run','walk jog','hiit'],
    routineId: 'running', reason: 'Cardio session -- leg swings, ankle mobility and light jogging prepare knees.',
    postRoutine: 'mobility_only', postReason: 'Mandatory calf stretch (gastroc and soleus), hip flexor and IT band.' },
  { keywords: ['massage','recovery','mobility','active recovery','walk'],
    routineId: 'mobility_only', reason: 'Recovery day -- this IS your session.',
    postRoutine: null, postReason: null }
];

function getTodaySessionFocus() {
  var phase = PROGRAMS.phases[STATE.phase];
  if (!phase || !phase.schedule) return null;
  var todayMon = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return phase.schedule[todayMon] || null;
}

function getTodayWarmupRecommendation() {
  var session = getTodaySessionFocus();
  if (!session) return null;
  var combined = ((session.focus || '') + ' ' + (session.split || '')).toLowerCase();
  for (var i = 0; i < WARMUP_MAP.length; i++) {
    var map = WARMUP_MAP[i];
    if (map.keywords.some(function(k) { return combined.indexOf(k) !== -1; })) {
      return { session: session, map: map, routine: WARMUPS.routines[map.routineId],
               postRoutine: map.postRoutine ? WARMUPS.routines[map.postRoutine] : null };
    }
  }
  return { session: session, map: WARMUP_MAP[2], routine: WARMUPS.routines['full_body'],
           postRoutine: WARMUPS.routines['mobility_only'] };
}

function getWarmupForDay(dayIndex) {
  var phase = PROGRAMS.phases[STATE.phase];
  if (!phase || !phase.schedule) return null;
  var session = phase.schedule[dayIndex];
  if (!session) return null;
  var combined = ((session.focus || '') + ' ' + (session.split || '')).toLowerCase();
  if (session.rest && !session.walk && !session.massage) return { session: session, routineId: null, label: 'Rest', color: 'var(--text-muted)' };
  for (var i = 0; i < WARMUP_MAP.length; i++) {
    var map = WARMUP_MAP[i];
    if (map.keywords.some(function(k) { return combined.indexOf(k) !== -1; })) {
      return { session: session, routineId: map.routineId, map: map, label: (WARMUPS.routines[map.routineId] || {}).name || map.routineId, color: warmupColor(map.routineId) };
    }
  }
  return { session: session, routineId: 'full_body', label: 'Full Body Warmup', color: '#10b981' };
}

function warmupColor(id) {
  return { upper_body:'#00d4b4', lower_body:'#f59e0b', full_body:'#10b981', running:'#6366f1', mobility_only:'#8b5cf6' }[id] || '#888';
}

/*  TODAY BANNER  */
function renderTodayWarmupBanner(rec) {
  if (!rec) return '<div class="card mb-12" style="text-align:center;padding:16px"><p>Set your phase to see today\'s recommendation.</p><button class="btn btn-secondary btn-sm mt-8" onclick="navigate(\'settings\')">Set Phase</button></div>';
  var session = rec.session;
  var routine = rec.routine;
  var isRest  = session.rest && !session.walk && !session.massage;
  var color   = warmupColor((rec.map || {}).routineId);
  var dayName = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  if (isRest) {
    return '<div class="card mb-12" style="border-color:rgba(99,102,241,0.25);background:rgba(99,102,241,0.07)">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:40px;height:40px;border-radius:var(--radius-md);background:rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;color:#6366f1;flex-shrink:0">' + icon('moon', 20) + '</div>' +
        '<div><div style="font-size:0.72rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.06em">Today -- ' + dayName + '</div>' +
        '<div style="font-size:0.9rem;font-weight:600">Full Rest Day</div>' +
        '<div style="font-size:0.82rem;color:var(--text-muted)">No warmup needed. Sleep, sunlight, cold shower.</div></div>' +
      '</div></div>';
  }

  var html = '<div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-xl);padding:16px;margin-bottom:12px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
    '<div><div style="font-size:0.7rem;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Today -- ' + dayName + '</div>' +
    '<div style="font-size:1rem;font-weight:700">' + session.focus + '</div>' +
    (session.split ? '<div style="font-size:0.78rem;color:var(--text-muted)">' + session.split + '</div>' : '') +
    '</div>' +
    '<span class="badge" style="background:rgba(255,255,255,0.06);color:' + color + '">' + (session.hrv ? 'Check HRV' : 'Train') + '</span>' +
  '</div>';

  // Pre-workout
  html += '<div style="background:var(--bg-card);border-radius:var(--radius-md);padding:12px;margin-bottom:8px">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<span style="font-size:0.7rem;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:.06em">Before Training</span>' +
      '<span class="badge" style="background:rgba(255,255,255,0.06);color:' + color + ';font-size:0.65rem">' + (routine ? routine.duration : '8-10 min') + '</span>' +
    '</div>' +
    '<div style="font-size:0.88rem;font-weight:600;margin-bottom:4px">' + (routine ? routine.name : 'Full Body Warmup') + '</div>' +
    '<div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:10px">' + ((rec.map || {}).reason || '') + '</div>' +
    (routine ? '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">' + routine.exercises.slice(0,4).map(function(ex){ return '<span class="badge badge-muted" style="font-size:0.68rem">' + ex.name + '</span>'; }).join('') + (routine.exercises.length > 4 ? '<span class="badge badge-muted" style="font-size:0.68rem">+' + (routine.exercises.length-4) + '</span>' : '') + '</div>' : '') +
    (rec.map && rec.map.routineId ? '<button class="btn btn-primary btn-full btn-sm" onclick="SoundSystem.unlock();startGuidedWarmup(\'' + rec.map.routineId + '\',\'warmup\')">' + icon('play', 14) + ' Start Pre-Workout Warmup</button>' : '') +
  '</div>';

  // Post-workout
  if (rec.postRoutine) {
    html += '<div style="background:var(--bg-card);border-radius:var(--radius-md);padding:12px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<span style="font-size:0.7rem;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:.06em">After Training</span>' +
        '<span class="badge badge-purple" style="font-size:0.65rem">15-20 min</span>' +
      '</div>' +
      '<div style="font-size:0.88rem;font-weight:600;margin-bottom:4px">Cooldown & Mobility</div>' +
      '<div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:10px">' + ((rec.map || {}).postReason || '') + '</div>' +
      '<button class="btn btn-secondary btn-full btn-sm" onclick="SoundSystem.unlock();startGuidedWarmup(\'mobility_only\',\'cooldown\')">' + icon('heart', 14) + ' Start Post-Workout Cooldown</button>' +
    '</div>';
  }

  html += '</div>';
  return html;
}

/*  WEEKLY SCHEDULE  */
function renderWeeklyWarmupSchedule() {
  var days    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var todayMon= new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  var phase   = PROGRAMS.phases[STATE.phase];
  if (!phase || !phase.schedule) return '';

  return '<div class="section-header"><h3>This Week</h3><span class="text-xs text-muted">Warmup plan</span></div>' +
  '<div style="margin-bottom:4px">' +
  phase.schedule.map(function(ses, i) {
    var rec     = getWarmupForDay(i);
    var isToday = i === todayMon;
    var isRest  = ses.rest && !ses.walk && !ses.massage;
    var color   = rec ? rec.color : 'var(--text-muted)';
    var label   = isRest ? 'Rest day' : (rec ? rec.label : 'Full Body Warmup');
    var preTime = rec && rec.map ? '8-10 min' : '';
    var routId  = rec ? rec.routineId : null;

    return '<div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">' +
      '<div style="width:36px;flex-shrink:0;text-align:center;padding-top:10px">' +
        '<div style="font-size:0.62rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">' + days[i] + '</div>' +
        '<div style="font-size:0.88rem;font-weight:700;color:' + (isToday ? color : 'var(--text-primary)') + '">' + (i+1) + '</div>' +
      '</div>' +
      '<div style="flex:1;background:var(--bg-card);border:1px solid ' + (isToday ? color : 'var(--border)') + ';border-radius:var(--radius-md);padding:10px 12px;' + (isRest ? 'opacity:0.55' : '') + '">' +
        '<div style="font-size:0.82rem;font-weight:600;color:' + (isToday ? color : 'var(--text-primary)') + ';display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
          '<span style="width:7px;height:7px;border-radius:50%;background:' + color + ';display:inline-block"></span>' +
          ses.focus + (isToday ? ' <span class="badge badge-accent" style="font-size:0.6rem">TODAY</span>' : '') +
        '</div>' +
        (!isRest ?
          '<div style="font-size:0.76rem;color:var(--text-muted)">' +
            '<span style="color:' + color + ';font-weight:700">Before:</span> ' + label + (preTime ? ' (' + preTime + ')' : '') +
          '</div>' +
          (rec && rec.map && rec.map.postRoutine ? '<div style="font-size:0.76rem;color:var(--text-muted);margin-top:2px"><span style="color:#8b5cf6;font-weight:700">After:</span> Cooldown & mobility (15 min)</div>' : '') +
          (isToday && routId ? '<button class="btn btn-sm btn-primary" style="margin-top:8px;padding:5px 14px;font-size:0.78rem" onclick="SoundSystem.unlock();startGuidedWarmup(\'' + routId + '\',\'warmup\')">' + icon('play', 12) + ' Start Now</button>' : '') :
          '<div style="font-size:0.76rem;color:var(--text-muted)">No warmup needed</div>'
        ) +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
}

/*  TAB SWITCHING  */
function switchWarmupTab(tab, btn) {
  qsa('.tab', el('warmup-tabs')).forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  var c = el('warmup-tab-content');
  try {
    if (tab === 'routines')  c.innerHTML = renderWarmupRoutines();
    else if (tab === 'stretches') c.innerHTML = renderStretchLibrary();
    else if (tab === 'foam') c.innerHTML = renderFoamRolling();
  } catch(e) { c.innerHTML = renderWarmupRoutinesFallback(); }
}

/*  ROUTINES LIST  */
function buildRoutineDayTags() {
  var days  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var phase = PROGRAMS.phases[STATE.phase];
  var tags  = {};
  if (!phase || !phase.schedule) return tags;
  phase.schedule.forEach(function(ses, i) {
    var rec = getWarmupForDay(i);
    if (rec && rec.routineId) {
      if (!tags[rec.routineId]) tags[rec.routineId] = [];
      tags[rec.routineId].push(days[i]);
    }
  });
  return tags;
}

function renderWarmupRoutines() {
  var routines = objValues(WARMUPS.routines);
  if (!routines.length) return '<div class="empty-state"><p>No warmup routines found.</p></div>';
  var dayTags = buildRoutineDayTags();
  return '<div class="section-header"><h3>All Routines</h3><span class="text-xs text-muted">Tap to expand</span></div>' +
    routines.map(function(r) { return renderWarmupRoutineCard(r, dayTags[r.id]); }).join('');
}

function renderWarmupRoutineCard(routine, dayTags) {
  var colorMap = { upper_body:'#00d4b4', lower_body:'#f59e0b', full_body:'#10b981', running:'#6366f1', mobility_only:'#8b5cf6' };
  var iconMap  = { upper_body:'push', lower_body:'run', full_body:'flame', running:'run', mobility_only:'heart' };
  var whenMap  = { upper_body:'Before upper body / push / pull sessions', lower_body:'Before lower body / squat / deadlift sessions', full_body:'Before full body sessions', running:'Before every run or cardio session', mobility_only:'Recovery days and post-workout cooldown' };

  var color   = colorMap[routine.id] || '#888';
  var iconName= iconMap[routine.id]  || 'sun';
  var when    = whenMap[routine.id]  || 'Before training';
  var tags    = dayTags || [];
  var todayMon= new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  var dayNames= ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var isToday = tags.indexOf(dayNames[todayMon]) !== -1;

  return '<div class="exercise-card mb-10" id="warmup-card-' + routine.id + '" style="' + (isToday ? 'border-color:' + color : '') + '">' +
    // Header
    '<div class="exercise-header" onclick="toggleWarmupCard(\'' + routine.id + '\')">' +
      '<div class="exercise-icon" style="width:48px;height:48px;background:rgba(0,0,0,0.2);color:' + color + '">' + icon(iconName, 22) + '</div>' +
      '<div class="exercise-meta">' +
        '<div class="name" style="display:flex;align-items:center;gap:6px">' + routine.name + (isToday ? ' <span class="badge badge-accent" style="font-size:0.62rem">TODAY</span>' : '') + '</div>' +
        '<div class="sub" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:3px">' +
          '<span>' + icon('sun', 12) + ' ' + (routine.duration || '8-10 min') + '</span>' +
          '<span class="badge badge-muted" style="font-size:0.65rem">' + routine.exercises.length + ' moves</span>' +
        '</div>' +
        '<div style="font-size:0.76rem;color:' + color + ';font-weight:600;margin-top:4px">' + icon('zap', 11) + ' ' + when + '</div>' +
        (tags.length ? '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:4px">' + tags.map(function(d){ return '<span class="badge" style="font-size:0.62rem;background:rgba(0,0,0,0.2);color:' + color + '">' + d + '</span>'; }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="exercise-chevron">' + icon('chevron_down', 18) + '</div>' +
    '</div>' +

    // Body
    '<div class="exercise-body" id="warmup-body-' + routine.id + '" style="display:none;padding:0 16px 16px">' +
      '<div style="background:rgba(0,0,0,0.15);border-radius:var(--radius-sm);padding:10px;margin-bottom:14px;margin-top:4px">' +
        '<div style="font-size:0.7rem;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">When to use</div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">' + when + '</div>' +
        (tags.length ? '<div style="margin-top:6px;font-size:0.78rem;color:var(--text-secondary)">This week: <strong style="color:' + color + '">' + tags.join(', ') + '</strong></div>' : '') +
      '</div>' +

      routine.exercises.map(function(ex, i) {
        return '<div class="warmup-step-item">' +
          '<div class="step-num-badge" style="background:rgba(0,0,0,0.2);color:' + color + '">' + (i+1) + '</div>' +
          '<div style="flex:1">' +
            '<div style="font-size:0.9rem;font-weight:500;margin-bottom:2px">' + ex.name + '</div>' +
            '<div style="font-size:0.8rem;color:' + color + ';font-weight:600">' + (ex.duration || (ex.reps ? ex.reps + ' reps' : '')) + '</div>' +
            (ex.notes ? '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;line-height:1.4">' + ex.notes + '</div>' : '') +
          '</div>' +
        '</div>';
      }).join('') +

      '<button class="btn btn-primary btn-full mt-12" onclick="SoundSystem.unlock();startGuidedWarmup(\'' + routine.id + '\',\'warmup\')">' + icon('play', 14) + ' Start Guided</button>' +
    '</div>' +
  '</div>';
}

function toggleWarmupCard(id) {
  var card = el('warmup-card-' + id);
  var body = el('warmup-body-' + id);
  if (!card || !body) return;
  var isOpen = body.style.display !== 'none';
  qsa('[id^="warmup-body-"]').forEach(function(b) { b.style.display = 'none'; });
  qsa('[id^="warmup-card-"]').forEach(function(c) { c.classList.remove('expanded'); });
  if (!isOpen) { body.style.display = 'block'; card.classList.add('expanded'); }
}

/*  GUIDED WARMUP PLAYER  */
function startGuidedWarmup(routineId, type) {
  var routine = WARMUPS.routines[routineId];
  if (!routine || !routine.exercises || !routine.exercises.length) { showToast('No exercises in this routine.', 'warning'); return; }

  // Stop any existing guide
  stopGuide();

  Guide.active    = true;
  Guide.routine   = routine;
  Guide.routineId = routineId;
  Guide.stepIndex = 0;
  Guide.paused    = false;
  Guide.type      = type || 'warmup';

  // Create overlay if missing
  var overlay = el('guided-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'guided-overlay';
    overlay.className = 'guided-overlay hidden';
    document.body.appendChild(overlay);
  }
  overlay.classList.remove('hidden');

  renderGuidedStep();
  SoundSystem.sessionStart();
}

function renderGuidedStep() {
  var overlay = el('guided-overlay');
  if (!overlay || !Guide.routine) return;

  var step        = Guide.routine.exercises[Guide.stepIndex];
  var total       = Guide.routine.exercises.length;
  var isFirst     = Guide.stepIndex === 0;
  var isLast      = Guide.stepIndex === total - 1;
  var pct         = Math.round((Guide.stepIndex / total) * 100);
  var color       = warmupColor(Guide.routineId);
  var isMobility  = Guide.type === 'cooldown' || Guide.routineId === 'mobility_only';
  var isBreathing = step.name && step.name.toLowerCase().indexOf('breath') !== -1;

  // Determine if timed or rep-based
  var stepSecs  = parseDurationToSeconds(step.duration || step.reps || '');
  var isTimed   = stepSecs > 0;
  var displayLabel = step.duration || (step.reps ? (String(step.reps) + ' reps') : '');

  Guide.totalSeconds = stepSecs;
  Guide.secondsLeft  = stepSecs;

  // Prev/Next arrows
  var arrowL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  var arrowR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  overlay.innerHTML =
    '<div class="guided-header">' +
      '<div>' +
        '<div class="routine-name">' + Guide.routine.name + '</div>' +
        '<div class="step-label">Step ' + (Guide.stepIndex + 1) + ' of ' + total + '</div>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm" onclick="closeGuide()">' + icon('close', 16) + '</button>' +
    '</div>' +

    '<div class="guided-progress"><div class="guided-progress-fill" id="guide-progress" style="width:' + pct + '%"></div></div>' +

    '<div class="guided-body">' +

      // Timer ring  only for timed steps
      (isTimed ?
        '<div class="guided-ring" id="guide-ring">' +
          '<svg viewBox="0 0 200 200">' +
            '<circle class="ring-bg" cx="100" cy="100" r="88"/>' +
            '<circle class="ring-track" cx="100" cy="100" r="88" id="guide-ring-track" ' +
              'stroke="' + color + '" ' +
              'stroke-dasharray="' + (2 * Math.PI * 88) + '" ' +
              'stroke-dashoffset="0"/>' +
          '</svg>' +
          '<div class="ring-inner">' +
            '<div class="ring-time" id="guide-time" style="color:' + color + '">' + formatTime(stepSecs) + '</div>' +
            '<div class="ring-label">remaining</div>' +
          '</div>' +
        '</div>'
      :
        // Rep-based  show large rep count instead of ring
        '<div style="width:160px;height:160px;border-radius:50%;border:8px solid ' + color + ';' +
          'display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 16px;' +
          'background:rgba(0,0,0,0.2)">' +
          '<div style="font-size:2.6rem;font-weight:800;color:' + color + ';line-height:1">' +
            (step.reps || step.duration || '--') +
          '</div>' +
          '<div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-top:4px">reps / sets</div>' +
        '</div>'
      ) +

      // Breathing orb
      ((isMobility || isBreathing) && isTimed ?
        '<div class="breathing-orb" id="breathing-orb"></div>' +
        '<div class="breathing-label" id="breathing-label">Breathe in...</div>'
      : '') +

      // Step name
      '<div class="guided-step-name">' + step.name + '</div>' +

      // Duration/reps label - shows what was in the data, clearly
      '<div class="guided-step-duration" style="color:' + color + '">' +
        displayLabel +
        (isTimed ? '' : '<span style="font-size:0.75rem;color:var(--text-muted);margin-left:6px">Tap Next when done</span>') +
      '</div>' +

      (step.notes ? '<div class="guided-step-notes">' + step.notes + '</div>' : '') +

      // Step dots
      '<div class="step-dots">' +
        Guide.routine.exercises.map(function(_, i) {
          var cls = i < Guide.stepIndex ? 'done' : i === Guide.stepIndex ? 'current' : '';
          return '<div class="step-dot ' + cls + '" onclick="jumpGuideStep(' + i + ')"></div>';
        }).join('') +
      '</div>' +

      // Up next
      (!isLast ?
        '<div class="guided-next">' + icon('zap', 12) + ' <span>Next: <strong>' + Guide.routine.exercises[Guide.stepIndex + 1].name + '</strong></span></div>'
        : '<div class="guided-next" style="color:var(--green)">' + icon('check', 12) + ' <span><strong>Last step</strong> - almost done!</span></div>'
      ) +

    '</div>' +

    // Footer
    '<div class="guided-footer">' +
      '<button class="btn-circle" onclick="guidePrev()" style="' + (isFirst ? 'opacity:0.3;pointer-events:none' : '') + '">' + arrowL + '</button>' +

      // Center button: pause/resume if timed, or just "Done" if rep-based
      (isTimed ?
        '<button class="btn btn-primary btn-main" id="guide-play-btn" onclick="toggleGuidePause()">' +
          icon(Guide.paused ? 'play' : 'pause', 18) + ' ' + (Guide.paused ? 'Resume' : 'Pause') +
        '</button>'
      :
        '<button class="btn btn-primary btn-main" onclick="guideNext()" style="' + (isLast ? 'display:none' : '') + '">' +
          icon('check', 18) + ' Done' +
        '</button>' +
        (isLast ?
          '<button class="btn btn-green btn-main" onclick="guideComplete()">' + icon('check', 18) + ' Finish</button>'
        : '')
      ) +

      (isLast && isTimed ?
        '<button class="btn-circle" style="background:var(--green);border-color:var(--green);color:white" onclick="guideComplete()">' + icon('check', 18) + '</button>'
        : (!isLast ? '<button class="btn-circle" onclick="guideNext()">' + arrowR + '</button>' : '<div style="width:52px"></div>')
      ) +
    '</div>';

  // Only start timer for timed steps
  if (isTimed) {
    startGuideTimer(stepSecs, color, isMobility || isBreathing);
  } else {
    clearInterval(Guide.timer);
    clearTimeout(Guide.breathTimer);
  }
}


function parseDurationToSeconds(str) {
  if (!str) return 0;
  str = String(str).toLowerCase().trim();

  // Contains 'min' -> minutes
  var minMatch = str.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;

  // Contains 'sec' or ends with 's' followed by non-letter (e.g. "30s", "30 sec", "30s each")
  var secMatch = str.match(/(\d+)\s*sec/);
  if (secMatch) return parseInt(secMatch[1]);

  // "30s" but NOT "30 steps" or "30 side" or "30 each"
  var sMatch = str.match(/^(\d+)s(?:\s|$|\/)/);
  if (sMatch) return parseInt(sMatch[1]);

  // Bare number that looks like a duration (large numbers = reps, not seconds)
  // e.g. "90s/side" - extract the 90
  var slashS = str.match(/(\d+)s\//);
  if (slashS) return parseInt(slashS[1]);

  // Has "each direction", "each side", "each leg", "steps", "reps" = rep-based, no timer
  if (str.match(/each|step|rep|side|leg|direction|time/)) return 0;

  // Bare number >= 30 could be seconds (e.g. "30", "45", "60", "90")
  var numMatch = str.match(/^(\d+)$/);
  if (numMatch) {
    var n = parseInt(numMatch[1]);
    // Heuristic: numbers <= 25 are almost certainly reps, not seconds
    return n > 25 ? n : 0;
  }

  return 0; // 0 = rep-based, show reps, no countdown
}

function isTimedStep(step) {
  // Returns true if step should show a countdown timer
  var secs = parseDurationToSeconds(step.duration || step.reps || '');
  return secs > 0;
}


function startGuideTimer(seconds, color, doBreathing) {
  clearInterval(Guide.timer);
  clearInterval(Guide.breathTimer);

  var total  = seconds;
  var circ   = 2 * Math.PI * 88;

  if (doBreathing) startBreathingAnimation();

  Guide.timer = setInterval(function() {
    if (Guide.paused) return;
    Guide.secondsLeft--;

    var timeEl   = el('guide-time');
    var trackEl  = el('guide-ring-track');
    var progress = Guide.secondsLeft / total;

    if (timeEl)  timeEl.textContent = formatTime(Math.max(0, Guide.secondsLeft));
    if (trackEl) trackEl.style.strokeDashoffset = circ * (1 - progress);

    // Color pulse when low
    if (Guide.secondsLeft <= 5 && Guide.secondsLeft > 0) {
      if (timeEl) timeEl.style.color = 'var(--red)';
      SoundSystem.countdown(Guide.secondsLeft);
    }

    if (Guide.secondsLeft <= 0) {
      clearInterval(Guide.timer);
      SoundSystem.stepDone();
      // Auto-advance after 1 second
      setTimeout(function() {
        if (Guide.active) guideNext();
      }, 1000);
    }
  }, 1000);
}

function startBreathingAnimation() {
  var orb   = el('breathing-orb');
  var label = el('breathing-label');
  if (!orb) return;

  // Breathing cycle: 4s in, 6s out
  function cycle() {
    if (!Guide.active || Guide.paused) return;
    // Inhale
    if (orb) orb.className = 'breathing-orb expand';
    if (label) label.textContent = 'Breathe in...';
    SoundSystem.breathIn();
    Guide.breathTimer = setTimeout(function() {
      if (!Guide.active || Guide.paused) return;
      // Exhale
      if (orb) orb.className = 'breathing-orb contract';
      if (label) label.textContent = 'Breathe out...';
      SoundSystem.breathOut();
      Guide.breathTimer = setTimeout(function() {
        if (Guide.active && !Guide.paused) cycle();
      }, 6500);
    }, 4500);
  }
  cycle();
}

function toggleGuidePause() {
  Guide.paused = !Guide.paused;
  var btn = el('guide-play-btn');
  if (btn) btn.innerHTML = icon(Guide.paused ? 'play' : 'pause', 18) + ' ' + (Guide.paused ? 'Resume' : 'Pause');
  var lbl = el('guide-ring-label');
  if (lbl) lbl.textContent = Guide.paused ? 'paused' : 'remaining';
  if (!Guide.paused) {
    var orb = el('breathing-orb');
    if (orb) startBreathingAnimation();
  }
}

function guideNext() {
  if (Guide.stepIndex < Guide.routine.exercises.length - 1) {
    Guide.stepIndex++;
    renderGuidedStep();
  } else {
    guideComplete();
  }
}

function guidePrev() {
  if (Guide.stepIndex > 0) {
    Guide.stepIndex--;
    renderGuidedStep();
  }
}

function jumpGuideStep(i) {
  Guide.stepIndex = i;
  renderGuidedStep();
}

function guideComplete() {
  stopGuide();
  closeGuide();
  SoundSystem.fanfare();
  var type = Guide.type === 'cooldown' ? 'Cooldown' : 'Warmup';
  showToast(type + ' complete. ' + (Guide.type === 'warmup' ? 'Time to train.' : 'Great session.'), 'success');
}

function stopGuide() {
  clearInterval(Guide.timer);
  clearTimeout(Guide.breathTimer);
  Guide.active = false;
}

function closeGuide() {
  stopGuide();
  var overlay = el('guided-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function toggleGuideSound() {
  var on  = SoundSystem.toggle();
  var btn = el('guide-sound-btn');
  if (btn) btn.innerHTML = icon(on ? 'sun' : 'moon', 16);
  showToast('Sound ' + (on ? 'on' : 'off'));
}

window.jumpGuideStep   = jumpGuideStep;
window.toggleGuidePause= toggleGuidePause;
window.guideNext       = guideNext;
window.guidePrev       = guidePrev;
window.guideComplete   = guideComplete;
window.closeGuide      = closeGuide;
window.toggleGuideSound= toggleGuideSound;

/*  STRETCHES TAB  */
function renderStretchLibrary() {
  if (!WARMUPS.stretchLibrary || !WARMUPS.stretchLibrary.length) return '<div class="empty-state"><p>No stretches found.</p></div>';
  return '<div class="section-header"><h3>Stretch Library</h3><span class="text-xs text-muted">Tap to expand</span></div>' +
    WARMUPS.stretchLibrary.map(function(s) {
      return '<div class="exercise-card mb-8">' +
        '<div class="exercise-header" onclick="this.closest(\'.exercise-card\').classList.toggle(\'expanded\')">' +
          '<div class="exercise-icon" style="background:rgba(139,92,246,0.1);color:#8b5cf6;width:44px;height:44px">' + icon('heart', 20) + '</div>' +
          '<div class="exercise-meta">' +
            '<div class="name">' + s.name + '</div>' +
            '<div class="sub" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
              '<span class="badge badge-purple" style="font-size:0.68rem">' + (s.muscle || '').replace(/_/g,' ') + '</span>' +
              '<span style="font-size:0.78rem;color:var(--accent)">' + s.duration + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="exercise-chevron">' + icon('chevron_down', 18) + '</div>' +
        '</div>' +
        '<div class="exercise-body">' +
          '<div class="exercise-section"><div class="exercise-section-title">' + icon('dumbbell',12) + ' Technique</div><div style="font-size:0.87rem;color:var(--text-secondary);line-height:1.6;background:var(--bg-secondary);padding:10px;border-radius:var(--radius-sm)">' + s.technique + '</div></div>' +
          '<div class="exercise-section"><div class="exercise-section-title">' + icon('sun',12) + ' Breathing</div><div style="font-size:0.87rem;color:var(--text-secondary);padding:8px;background:rgba(99,102,241,0.08);border-radius:var(--radius-sm)">' + s.breathing + '</div></div>' +
          (s.tips && s.tips.length ? '<div class="exercise-section"><div class="exercise-section-title">' + icon('zap',12) + ' Tips</div>' + s.tips.map(function(t){ return '<div class="hack-item">' + icon('zap',13) + ' ' + t + '</div>'; }).join('') + '</div>' : '') +
          '<button class="btn btn-secondary btn-full btn-sm mt-12" onclick="SoundSystem.unlock();startTimedStretch(\'' + s.id + '\')">' + icon('sun',14) + ' Start Timed Stretch</button>' +
        '</div>' +
      '</div>';
    }).join('');
}

function startTimedStretch(stretchId) {
  var stretch = WARMUPS.stretchLibrary.find(function(s) { return s.id === stretchId; });
  if (!stretch) return;
  // Build a mini routine from this stretch
  var miniRoutine = {
    id: 'stretch_' + stretchId,
    name: stretch.name,
    duration: stretch.duration,
    exercises: [
      { name: stretch.name + ' (Right)', duration: stretch.duration, notes: stretch.technique },
      { name: stretch.name + ' (Left)',  duration: stretch.duration, notes: 'Mirror image. Exhale to deepen.' }
    ]
  };
  WARMUPS.routines['_temp_stretch'] = miniRoutine;
  startGuidedWarmup('_temp_stretch', 'cooldown');
}

/*  FOAM ROLLING TAB  */
function renderFoamRolling() {
  if (!WARMUPS.foamRolling || !WARMUPS.foamRolling.length) return '<div class="empty-state"><p>No foam rolling data found.</p></div>';
  return '<div class="coach-tip mb-16"><div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div><div><div class="coach-name">Foam Rolling</div><p>Roll before training (activation) and after (recovery). 30-60s per area. Breathe through tight spots.</p></div></div>' +
  '<div class="section-header"><h3>Foam Roll Protocol</h3></div>' +
  WARMUPS.foamRolling.map(function(area) {
    return '<div class="card mb-8">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div style="width:38px;height:38px;border-radius:var(--radius-sm);background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;color:#8b5cf6">' + icon('heart', 18) + '</div>' +
        '<h4>' + area.area + '</h4>' +
      '</div>' +
      '<p style="font-size:0.87rem">' + area.technique + '</p>' +
      (area.warning ? '<div class="mistake-item mt-8">' + icon('warning',12) + ' ' + area.warning + '</div>' : '') +
    '</div>';
  }).join('');
}

/*  FALLBACK  */
function renderWarmupRoutinesFallback() {
  try {
    var routines = objValues(WARMUPS.routines);
    var html = '<div class="section-header"><h3>Warmup Routines</h3></div>';
    var colors = { upper_body:'#00d4b4', lower_body:'#f59e0b', full_body:'#10b981', running:'#6366f1', mobility_only:'#8b5cf6' };
    routines.forEach(function(r) {
      var color = colors[r.id] || '#888';
      html += '<div class="exercise-card mb-10" id="warmup-card-' + r.id + '">' +
        '<div class="exercise-header" onclick="toggleWarmupCard(\'' + r.id + '\')">' +
          '<div class="exercise-icon" style="width:48px;height:48px;background:var(--bg-secondary);color:' + color + '">' + icon('sun', 22) + '</div>' +
          '<div class="exercise-meta"><div class="name">' + r.name + '</div><div class="sub"><span class="badge badge-muted" style="font-size:0.68rem">' + (r.duration || '8-10 min') + '</span></div></div>' +
          '<div class="exercise-chevron">' + icon('chevron_down', 18) + '</div>' +
        '</div>' +
        '<div class="exercise-body" id="warmup-body-' + r.id + '" style="display:none;padding:0 16px 16px">';
      r.exercises.forEach(function(ex, i) {
        html += '<div class="warmup-step-item"><div class="step-num-badge" style="background:var(--bg-secondary);color:' + color + '">' + (i+1) + '</div><div style="flex:1"><div style="font-size:0.9rem;font-weight:500">' + ex.name + '</div><div style="font-size:0.8rem;color:' + color + '">' + (ex.duration || (ex.reps ? ex.reps + ' reps' : '')) + '</div>' + (ex.notes ? '<div style="font-size:0.78rem;color:var(--text-muted)">' + ex.notes + '</div>' : '') + '</div></div>';
      });
      html += '<button class="btn btn-primary btn-full mt-12" onclick="SoundSystem.unlock();startGuidedWarmup(\'' + r.id + '\',\'warmup\')">' + icon('play', 14) + ' Start Guided</button></div></div>';
    });
    return html;
  } catch(e) { return '<div class="empty-state"><p>Could not load warmup routines. Please refresh.</p></div>'; }
}
