/* dashboard.js - Home screen - ES5 */

var COACH_TIPS = [
  'Your body adapts to stress, not comfort. Every rep that feels hard changes you.',
  'Testosterone is built in bed. Sleep 8 hours - your most anabolic decision today.',
  'The cold shower you avoid is the exact thing that will rewire your dopamine system.',
  'Progressive overload is non-negotiable. Add weight, add reps, or add intensity.',
  'Compound lifts first. Always. Squat, deadlift, bench, row - these are the foundation.',
  'Zone 2 cardio burns fat you have been carrying for years.',
  'Mobility is not optional. You cannot build strength through a joint that does not move.',
  'Every time you choose discipline over comfort, you win.',
  'Your knees are protected by glutes, hamstrings, and calves. Strengthen them.',
  'Form beats weight. Always. Ego at the bar means injury on the bench.',
  'Sunlight within 30 minutes of waking is free testosterone.',
  'The workout you do consistently beats the perfect workout you do occasionally.',
  'Running is a skill. Slow down to speed up. Build the aerobic base first.',
  'Deload weeks are growth. Your tendons need rest that your muscles do not.',
  'The best pre-workout is 8 hours of sleep, morning sunlight, and protein.',
  'Discipline is choosing the 2-minute version of every good habit when motivation fails.',
  'Lean body does not mean low calorie. High protein, compound lifts, consistent cardio.'
];

var CheckinDraft = {};
var CheckinOpen = false;   // show the check-in card even when wearable data already gives a score

function renderDashboard() {
  var phase    = PROGRAMS.phases[STATE.phase];
  var dow      = new Date().getDay();
  var schedIdx = (dow === 0) ? 6 : dow - 1;
  var todaySes = (phase && phase.schedule) ? phase.schedule[schedIdx] : null;
  var isRest   = todaySes && todaySes.rest && !todaySes.walk && !todaySes.massage;
  var doneTdy  = STATE.completedWorkouts.indexOf(todayStr()) !== -1;
  var tipIdx   = Math.floor(Date.now() / 86400000) % COACH_TIPS.length;
  var phColor  = getPhaseColor(STATE.phase);
  var phRgb    = hexToRgb(phColor);
  var ready    = Readiness.getToday();

  var html =
    '<div class="top-header">' +
      '<div>' +
        '<div class="logo">ATHLETIC COACH</div>' +
        '<div style="font-size:0.72rem;color:var(--text-muted)">' + getDayGreeting() + '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<button id="install-btn" class="btn btn-sm btn-secondary hidden" onclick="triggerInstall()">Install</button>' +
        '<div style="display:flex;align-items:center;gap:5px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:5px 10px">' +
          icon('flame', 15) +
          '<span style="font-size:0.95rem;font-weight:800;color:var(--accent)">' + STATE.streak + '</span>' +
          '<span style="font-size:0.72rem;color:var(--text-muted)">day</span>' +
        '</div>' +
      '</div>' +
    '</div>' +

    Progression.renderBanners() +
    ((ready && !CheckinOpen) ? '' : renderCheckinCard()) +
    renderRings(ready) +
    renderHealthRow() +

    /* Today's session: the one primary action */
    '<div style="background:rgba(' + phRgb + ',0.08);border:1px solid rgba(' + phRgb + ',0.25);border-radius:var(--radius-xl);padding:16px;margin-bottom:14px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div>' +
          '<div style="font-size:0.72rem;font-weight:700;color:' + phColor + ';text-transform:uppercase;letter-spacing:.06em">Phase ' + STATE.phase + ' &bull; ' + (phase ? phase.name : 'Setup') + '</div>' +
          '<div style="font-size:1rem;font-weight:700;margin-top:2px">' + (todaySes ? todaySes.focus : 'Set your phase') + '</div>' +
          (todaySes && todaySes.split ? '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:1px">' + todaySes.split + '</div>' : '') +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
          (doneTdy ? '<span class="badge badge-green">Done</span>' : (isRest ? '<span class="badge badge-muted">Rest</span>' : '<span class="badge" style="background:rgba(' + phRgb + ',0.2);color:' + phColor + '">Today</span>')) +
          '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">Wk ' + STATE.weekInPhase + ' &bull; ' + getPhaseProgress() + '%</div>' +
        '</div>' +
      '</div>' +
      '<div class="progress-bar" style="margin-bottom:12px"><div class="progress-fill" style="width:' + getPhaseProgress() + '%;background:' + phColor + '"></div></div>' +
      (todaySes && !isRest ? renderTodayCompact(todaySes, doneTdy, schedIdx) : renderRestDay(todaySes)) +
    '</div>' +

    renderWeekStrip(phase) +
    renderWaterAndStreak() +

    '<div class="coach-tip">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Coach</div><p>' + COACH_TIPS[tipIdx] + '</p></div>' +
    '</div>';

  el('dashboard-content').innerHTML = html;
}

/* ---- Readiness / Effort / Week rings + plain-language coach line ---- */
function renderRings(ready) {
  var effort = Readiness.dayEffort(HistoryStore.localDate());
  var model  = Progression.getSessionModel();
  var target = Readiness.targetEffort(model.rpe);
  var week   = Readiness.consistency();

  var rings =
    Rings.ring({
      pct: ready ? ready.score : 0, display: ready ? String(ready.score) : '--', label: 'Readiness',
      sub: ready ? ready.label : 'Check in', color: ready ? ready.color : 'var(--text-muted)'
    }) +
    Rings.ring({
      pct: (effort / 21) * 100, display: effort ? effort.toFixed(1) : '0', label: 'Effort',
      sub: target ? 'Target ' + target.low + '-' + target.high : 'of 21', color: 'var(--strain)'
    }) +
    Rings.ring({
      pct: week.pct, display: week.done + '/' + week.planned, label: 'This week',
      sub: week.pct + '%', color: 'var(--accent)'
    });

  return '<div class="card mb-12" style="padding:16px 12px">' +
    '<div class="rings-row">' + rings + '</div>' +
    '<p class="coach-line">' + esc(Readiness.coachLine()) + '</p>' +
    (ready && ready.source === 'health' ? '<button class="link-btn" onclick="openCheckin()">Add how you feel</button>' : '') +
    (ready && ready.source !== 'health' ? '<button class="link-btn" onclick="redoCheckin()">Redo check-in</button>' : '') +
  '</div>';
}

/* ---- 4-tap morning check-in ---- */
function renderCheckinCard() {
  var rows = Readiness.QUESTIONS.map(function(q) {
    var chips = q.opts.map(function(o, i) {
      return '<button class="chip' + (CheckinDraft[q.id] === i ? ' active' : '') + '" onclick="checkinPick(\'' + q.id + '\',' + i + ')">' + esc(o[0]) + '</button>';
    }).join('');
    return '<div class="checkin-q"><div class="checkin-label">' + esc(q.label) + '</div><div class="chip-row">' + chips + '</div></div>';
  }).join('');
  return '<div class="card-accent mb-12">' +
    '<div style="font-size:0.72rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.06em">Morning check-in</div>' +
    '<p style="font-size:0.85rem;margin:2px 0 10px">10 seconds. Your plan adapts to how you feel.</p>' + rows +
  '</div>';
}

function checkinPick(qid, idx) {
  CheckinDraft[qid] = idx;
  if (Readiness.scoreFor(CheckinDraft) !== null) {
    var res = Readiness.saveCheckin(CheckinDraft);
    CheckinDraft = {};
    CheckinOpen = false;
    if (res) showToast('Readiness ' + res.score + ' - ' + Readiness.ZONES[res.zone].label, 'success');
  }
  renderDashboard();
}

function redoCheckin() {
  Readiness.clearToday();
  CheckinDraft = {};
  CheckinOpen = true;
  renderDashboard();
}

function openCheckin() {
  CheckinOpen = true;
  renderDashboard();
}

/* Sleep / steps / HRV / resting HR from Health Connect, when connected and available */
function renderHealthRow() {
  if (!Health.connected()) return '';
  var defs = [['Sleep', 'sleepH', function(v) { return (Math.round(v * 10) / 10) + 'h'; }],
              ['HRV', 'hrv', function(v) { return Math.round(v) + ' ms'; }],
              ['Resting HR', 'rhr', function(v) { return Math.round(v) + ' bpm'; }],
              ['Steps', 'steps', function(v) { return Math.round(v).toLocaleString(); }]];
  var items = defs.map(function(d) {
    var e = Health.latest(d[1]);
    return e ? { label: d[0], value: d[2](e.value), age: Health.ageLabel(e.date) } : null;
  }).filter(Boolean);
  if (!items.length) return '';
  return '<div class="stats-row mb-12">' + items.map(function(i) {
    return '<div class="stat-tile"><div class="value" style="font-size:1.05rem">' + esc(i.value) + '</div><div class="label">' + esc(i.label) + '</div>' +
      (i.age !== 'today' ? '<div style="font-size:0.6rem;color:var(--text-muted)">' + esc(i.age) + '</div>' : '') + '</div>';
  }).join('') + '</div>';
}

/* ---- Water + last session ---- */
function renderWaterAndStreak() {
  var water  = HistoryStore.getWaterToday();
  var target = Math.max(2.5, Math.min(4, (STATE.settings.bodyWeight || 80) * 0.035));
  var pct    = Math.min(100, Math.round((water / target) * 100));
  var daysAgo = STATE.lastWorkoutDate ? dayDiff(STATE.lastWorkoutDate, HistoryStore.localDate()) : null;
  var msg;
  if (daysAgo === null) msg = 'No sessions yet';
  else if (daysAgo === 0) msg = 'Trained today';
  else if (daysAgo === 1) msg = 'Last trained yesterday';
  else if (daysAgo <= 3) msg = 'Last trained ' + daysAgo + ' days ago';
  else msg = daysAgo + ' days since last session';
  var msgColor = daysAgo > 2 ? 'var(--red)' : 'var(--green)';
  var btn = 'padding:3px 8px;background:var(--strain-dim);color:var(--strain);border:none;border-radius:6px;font-size:0.72rem;font-weight:600;cursor:pointer;font-family:var(--font)';

  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
    '<div class="card-sm" style="background:var(--strain-dim);border-color:rgba(0,147,231,0.2)">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
        '<div>' +
          '<div style="font-size:0.72rem;font-weight:700;color:var(--strain);text-transform:uppercase;letter-spacing:.06em">Water</div>' +
          '<div style="font-size:1.1rem;font-weight:800;color:var(--strain);line-height:1">' + water.toFixed(1) + '<span style="font-size:0.72rem;font-weight:400">L</span></div>' +
          '<div style="font-size:0.72rem;color:var(--text-muted)">of ' + target.toFixed(1) + 'L</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px">' +
          '<button onclick="dashAddWater(0.25)" style="' + btn + '">+250</button>' +
          '<button onclick="dashAddWater(0.5)" style="' + btn + '">+500</button>' +
        '</div>' +
      '</div>' +
      '<div style="height:4px;background:rgba(0,147,231,0.15);border-radius:100px"><div style="width:' + pct + '%;height:100%;background:var(--strain);border-radius:100px;transition:width 0.4s"></div></div>' +
    '</div>' +
    '<div class="card-sm">' +
      '<div style="font-size:0.72rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Streak</div>' +
      '<div style="font-size:1.8rem;font-weight:800;color:var(--accent);line-height:1;margin-bottom:4px">' + STATE.streak + '<span style="font-size:0.82rem;font-weight:400;color:var(--text-muted)"> days</span></div>' +
      '<div style="font-size:0.72rem;color:' + msgColor + '">' + msg + '</div>' +
      '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">' + STATE.completedWorkouts.length + ' total sessions</div>' +
    '</div>' +
  '</div>';
}

function dashAddWater(litres) {
  HistoryStore.addWater(litres);
  showToast('+' + (litres * 1000) + 'ml logged', 'success');
  renderDashboard();
}

function renderTodayCompact(session, done, dayIdx) {
  var exList = (session.exercises || []).slice(0, 3);
  var more   = (session.exercises || []).length - 3;
  return '<div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:10px">' +
    exList.map(function(e) {
      return '<div style="display:flex;justify-content:space-between;padding:3px 0">' +
        '<span style="font-size:0.82rem;color:var(--text-secondary)">' + getExerciseName(e.id) + '</span>' +
        '<span style="font-size:0.72rem;color:var(--text-muted)">' + e.sets + 'x' + e.reps + '</span>' +
      '</div>';
    }).join('') +
    (more > 0 ? '<div style="font-size:0.72rem;color:var(--text-muted);padding-top:2px">+' + more + ' more' + (session.coreFinisher ? ' + core' : '') + '</div>' : '') +
    '<button class="btn btn-primary btn-full btn-sm" style="margin-top:10px" onclick="Player.start(' + dayIdx + ')">' +
      (done ? icon('refresh', 14) + ' Redo' : icon('play', 14) + ' Start Session') +
    '</button>' +
  '</div>';
}

function renderRestDay(session) {
  var acts = session && session.activities ? session.activities.slice(0, 3) : ['Sleep well', 'Morning sunlight', 'Cold shower'];
  return '<div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:10px">' +
    acts.map(function(a) {
      return '<div style="font-size:0.82rem;color:var(--text-secondary);padding:3px 0">' + a + '</div>';
    }).join('') +
  '</div>';
}

function renderWeekStrip(phase) {
  var days     = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dow      = new Date().getDay();
  var todayMon = (dow === 0) ? 6 : dow - 1;
  var schedule = (phase && phase.schedule) ? phase.schedule : [];
  var now      = new Date();
  var html = '<div class="week-strip">';
  for (var i = 0; i < 7; i++) {
    var d       = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayMon + i);
    var ds      = HistoryStore.localDate(d);
    var ses     = schedule[i];
    var done    = STATE.completedWorkouts.indexOf(ds) !== -1;
    var isRest  = ses && ses.rest && !ses.walk && !ses.massage;
    html += '<div class="day-dot' + (i === todayMon ? ' today' : '') + (done ? ' done' : '') + (isRest ? ' rest' : '') + '" onclick="navigate(\'workout\')">' +
      '<span class="day-label">' + days[i].charAt(0) + '</span>' +
      '<span class="day-num">' + d.getDate() + '</span>' +
      (done ? icon('check', 10) : '') +
    '</div>';
  }
  return html + '</div>';
}

function getDayGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good morning - make it count';
  if (h < 17) return 'Keep pushing - halfway there';
  return 'Evening session - respect the grind';
}
