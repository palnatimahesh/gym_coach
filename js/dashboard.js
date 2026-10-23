/* dashboard.js - ES5 */

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

  var html =
    //  Header 
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

    //  Phase + Today (single card, most important info) 
    Progression.renderBanners() +
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
      (todaySes && !isRest ? renderTodayCompact(todaySes, doneTdy) : renderRestDay(todaySes)) +
    '</div>' +

    //  Week strip 
    renderWeekStrip(phase) +

    //  Quick actions (4 tiles) 
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px;margin-bottom:14px">' +
      quickTile('book',   'Library',   'dictionary', '#3b82f6') +
      quickTile('trophy', 'History',   'history',    '#f59e0b') +
      quickTile('zap',    'Tools',     'tools',      '#8b5cf6') +
      quickTile('heart',  'Recovery',  'recovery',   '#ef4444') +
    '</div>' +

    //  Coach tip 
    '<div class="coach-tip">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Coach</div><p>' + COACH_TIPS[tipIdx] + '</p></div>' +
    '</div>';

  el('dashboard-content').innerHTML = html;
}


function renderDashboardQuickStats() {
  var water   = (typeof HistoryStore !== 'undefined') ? HistoryStore.getWaterToday() : 0;
  var target  = ((STATE.settings.bodyWeight || 80) * 0.035);
  target      = Math.max(2.5, Math.min(4, target));
  var pct     = Math.min(100, Math.round((water / target) * 100));
  var lastWod = STATE.lastWorkoutDate;
  var today   = HistoryStore.localDate();
  var daysAgo = lastWod ? Math.round((new Date(today) - new Date(lastWod)) / 86400000) : null;
  var streakMsg = '';
  if (daysAgo === null) streakMsg = 'No sessions yet';
  else if (daysAgo === 0) streakMsg = 'Trained today';
  else if (daysAgo === 1) streakMsg = 'Last trained yesterday';
  else if (daysAgo <= 3) streakMsg = 'Last trained ' + daysAgo + ' days ago';
  else streakMsg = daysAgo + ' days since last session - time to go!';
  var streakColor = daysAgo > 2 ? 'var(--red)' : 'var(--green)';

  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;margin-bottom:14px">' +

    // Water widget
    '<div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:var(--radius-md);padding:12px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
        '<div>' +
          '<div style="font-size:0.72rem;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:.06em">Water</div>' +
          '<div style="font-size:1.1rem;font-weight:800;color:#3b82f6;line-height:1">' + water.toFixed(1) + '<span style="font-size:0.72rem;font-weight:400">L</span></div>' +
          '<div style="font-size:0.72rem;color:var(--text-muted)">of ' + target.toFixed(1) + 'L</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px">' +
          '<button onclick="dashAddWater(0.25)" style="padding:3px 8px;background:rgba(59,130,246,0.15);color:#3b82f6;border:none;border-radius:6px;font-size:0.72rem;font-weight:600;cursor:pointer;font-family:var(--font)">+250</button>' +
          '<button onclick="dashAddWater(0.5)"  style="padding:3px 8px;background:rgba(59,130,246,0.15);color:#3b82f6;border:none;border-radius:6px;font-size:0.72rem;font-weight:600;cursor:pointer;font-family:var(--font)">+500</button>' +
        '</div>' +
      '</div>' +
      '<div style="height:4px;background:rgba(59,130,246,0.15);border-radius:100px"><div style="width:' + pct + '%;height:100%;background:#3b82f6;border-radius:100px;transition:width 0.4s"></div></div>' +
    '</div>' +

    // Streak + last session
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px">' +
      '<div style="font-size:0.72rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Streak</div>' +
      '<div style="font-size:1.8rem;font-weight:800;color:var(--accent);line-height:1;margin-bottom:4px">' + STATE.streak + '<span style="font-size:0.82rem;font-weight:400;color:var(--text-muted)"> days</span></div>' +
      '<div style="font-size:0.72rem;color:' + streakColor + '">' + streakMsg + '</div>' +
      '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">' + STATE.completedWorkouts.length + ' total sessions</div>' +
    '</div>' +

  '</div>';
}

function dashAddWater(litres) {
  if (typeof HistoryStore === 'undefined') return;
  HistoryStore.addWater(litres);
  showToast('+' + (litres * 1000) + 'ml logged', 'success');
  // Re-render just the stats section
  renderDashboard();
}

function renderTodayCompact(session, done) {
  var exList = (session.exercises || []).slice(0, 3);
  return '<div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:10px">' +
    (exList.length > 0 ?
      exList.map(function(e) {
        return '<div style="display:flex;justify-content:space-between;padding:3px 0">' +
          '<span style="font-size:0.82rem;color:var(--text-secondary)">' + getExerciseName(e.id) + '</span>' +
          '<span style="font-size:0.72rem;color:var(--text-muted)">' + e.sets + 'x' + e.reps + '</span>' +
        '</div>';
      }).join('') +
      ((session.exercises || []).length > 3 ? '<div style="font-size:0.72rem;color:var(--text-muted);padding-top:2px">+' + ((session.exercises||[]).length - 3) + ' more' + (session.coreFinisher ? ' + core' : '') + '</div>' : '') +
      '<button class="btn btn-primary btn-full btn-sm" style="margin-top:10px" onclick="navigate(\'workout\')">' +
        (done ? icon('refresh', 14) + ' Redo' : icon('play', 14) + ' Start Session') +
      '</button>'
    :
      '<button class="btn btn-primary btn-full btn-sm" onclick="navigate(\'workout\')">' + icon('play', 14) + ' Start Session</button>'
    ) +
  '</div>';
}

function renderRestDay(session) {
  var label = session ? session.focus : 'Rest Day';
  var acts  = session && session.activities ? session.activities.slice(0,3) : ['Sleep well', 'Morning sunlight', 'Cold shower'];
  return '<div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:10px">' +
    acts.map(function(a) {
      return '<div style="font-size:0.82rem;color:var(--text-secondary);padding:3px 0">' + a + '</div>';
    }).join('') +
  '</div>';
}

function quickTile(iconName, label, page, color) {
  return '<button onclick="navigate(\'' + page + '\')" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px 4px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);cursor:pointer;transition:0.2s;font-family:var(--font);width:100%">' +
    '<div style="color:' + color + '">' + icon(iconName, 22) + '</div>' +
    '<span style="font-size:0.72rem;font-weight:500;color:var(--text-secondary)">' + label + '</span>' +
  '</button>';
}


function renderTodaySession(session, isRest, done) {
  if (isRest) {
    var acts = '';
    if (session.activities) {
      acts = '<div style="margin-top:12px">' +
        session.activities.map(function(a) {
          return '<div style="font-size:0.85rem;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border)">' + a + '</div>';
        }).join('') + '</div>';
    }
    return '<div style="display:flex;align-items:center;gap:12px">' +
      '<div style="width:46px;height:46px;border-radius:var(--radius-md);background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:1.4rem">&#x1F634;</div>' +
      '<div><div style="font-weight:600">' + session.focus + '</div>' +
        '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px">Active recovery day</div>' +
      '</div></div>' + acts;
  }
  var exCount = (session.exercises || []).length;
  var rows = (session.exercises || []).slice(0, 3).map(function(e) {
    return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">' +
      '<span style="font-size:0.82rem;color:var(--text-secondary);flex:1">' + getExerciseName(e.id) + '</span>' +
      '<span style="font-size:0.78rem;color:var(--text-muted)">' + e.sets + 'x' + e.reps + '</span>' +
    '</div>';
  }).join('');
  return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">' +
    '<div style="width:46px;height:46px;border-radius:var(--radius-md);background:var(--accent-dim);display:flex;align-items:center;justify-content:center">' + icon('dumbbell', 22) + '</div>' +
    '<div style="flex:1"><div style="font-weight:600">' + session.focus + '</div>' +
      '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px">' + exCount + ' exercises</div>' +
    '</div>' + (done ? '<span class="badge badge-green">Done</span>' : '') +
  '</div>' + rows +
  (exCount > 3 ? '<div style="font-size:0.78rem;color:var(--text-muted);padding-top:5px">+' + (exCount - 3) + ' more</div>' : '') +
  '<button class="btn btn-primary btn-full mt-12" onclick="navigate(\'workout\')">' +
    (done ? icon('refresh', 16) + ' Redo Session' : icon('play', 16) + ' Start Session') +
  '</button>';
}

function renderNoSession() {
  return '<div class="empty-state" style="padding:24px 0">' +
    icon('dumbbell', 40) +
    '<p>Set your phase to see today\'s workout.</p>' +
    '<button class="btn btn-secondary btn-sm mt-12" onclick="navigate(\'settings\')">Setup Phase</button>' +
  '</div>';
}

function renderWeekStrip(phase) {
  var days     = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var today    = new Date().getDay();
  var todayMon = (today === 0) ? 6 : today - 1;
  var schedule = (phase && phase.schedule) ? phase.schedule : [];
  var now      = new Date();
  var monday   = new Date(now);
  monday.setDate(now.getDate() - todayMon);
  var html = '<div class="week-strip">';
  for (var i = 0; i < 7; i++) {
    var d   = new Date(monday);
    d.setDate(monday.getDate() + i);
    var mm  = String(d.getMonth() + 1); if (mm.length < 2) mm = '0' + mm;
    var dd  = String(d.getDate());      if (dd.length < 2) dd = '0' + dd;
    var ds  = d.getFullYear() + '-' + mm + '-' + dd;
    var ses = schedule[i];
    var done    = STATE.completedWorkouts.indexOf(ds) !== -1;
    var isToday = i === todayMon;
    var isRest  = ses && ses.rest && !ses.walk && !ses.massage;
    html += '<div class="day-dot' + (isToday ? ' today' : '') + (done ? ' done' : '') + (isRest ? ' rest' : '') + '" onclick="navigate(\'workout\')">' +
      '<span class="day-label">' + days[i].charAt(0) + '</span>' +
      '<span class="day-num">' + d.getDate() + '</span>' +
      (done ? icon('check', 10) : '') +
    '</div>';
  }
  return html + '</div>';
}

function quickAction(iconName, label, page, color) {
  return '<button class="card" style="cursor:pointer;text-align:left;border:none;display:flex;align-items:center;gap:10px;padding:14px" onclick="navigate(\'' + page + '\')">' +
    '<div style="width:38px;height:38px;border-radius:var(--radius-sm);background:rgba(136,136,136,0.15);color:' + color + ';display:flex;align-items:center;justify-content:center">' + icon(iconName, 20) + '</div>' +
    '<span style="font-size:0.88rem;font-weight:600">' + label + '</span>' +
  '</button>';
}

function getDayGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good morning - make it count';
  if (h < 17) return 'Keep pushing - halfway there';
  return 'Evening session - respect the grind';
}

