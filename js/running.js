/* --- RUNNING PAGE --- ES5 --- */

var runSession = { active: false, interval: null, seconds: 0 };

function renderRunning() {
  el('running-content').innerHTML =
    '<div class="top-header">' +
      '<h2>Running Plan</h2>' +
      '<span class="badge badge-purple">Week ' + STATE.runningWeek + '</span>' +
    '</div>' +
    '<div class="coach-tip mb-16">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Coach\'s Promise</div><p>' + RUNNING_PLAN.philosophy + '</p></div>' +
    '</div>' +
    '<div class="tabs" id="run-tabs">' +
      '<button class="tab active" onclick="switchRunTab(\'plan\',this)">10-Week Plan</button>' +
      '<button class="tab" onclick="switchRunTab(\'form\',this)">Running Form</button>' +
      '<button class="tab" onclick="switchRunTab(\'knee\',this)">Knee Safety</button>' +
    '</div>' +
    '<div id="run-tab-content">' + renderRunPlan() + '</div>';
}

function switchRunTab(tab, btn) {
  var tabs = qsa('.tab', el('run-tabs'));
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  btn.classList.add('active');
  var content = el('run-tab-content');
  if (tab === 'plan')  content.innerHTML = renderRunPlan();
  else if (tab === 'form') content.innerHTML = renderRunningForm();
  else if (tab === 'knee') content.innerHTML = renderKneeSafety();
}

function renderRunPlan() {
  var currentWeek = RUNNING_PLAN.weeks[STATE.runningWeek - 1];
  var html = '';
  if (currentWeek) {
    html +=
      '<div class="section-header">' +
        '<h3>This Week</h3>' +
        '<div style="display:flex;gap:8px">' +
          (STATE.runningWeek > 1 ? '<button class="btn btn-ghost btn-sm" onclick="changeRunWeek(-1)">-</button>' : '') +
          '<button class="btn btn-primary btn-sm" onclick="changeRunWeek(1)">Next Week</button>' +
        '</div>' +
      '</div>' +
      renderCurrentRunWeek(currentWeek);
  }
  html += '<div class="section-header mt-16"><h3>Full Program</h3></div>';
  RUNNING_PLAN.weeks.forEach(function(week) {
    html += renderRunWeekCard(week);
  });
  return html;
}

function renderCurrentRunWeek(week) {
  var phaseColors = {
    walk_jog: '#10b981', continuous: '#f59e0b', tempo: '#e84393',
    mixed: '#8b5cf6', '5k': '#ef4444', speed: '#3b82f6', athletic: '#ff6b35'
  };
  var color = phaseColors[week.phase] || '#6366f1';

  var protocolHtml = '';
  if (typeof week.protocol === 'string') {
    protocolHtml = '<div style="font-size:0.87rem;color:var(--text-secondary);line-height:1.6">' + week.protocol + '</div>';
  } else {
    Object.keys(week.protocol).forEach(function(k) {
      protocolHtml +=
        '<div style="padding:5px 0;border-bottom:1px solid var(--border)">' +
          '<div style="font-size:0.72rem;font-weight:700;color:' + color + ';text-transform:capitalize">' + k.replace(/_/g, ' ') + '</div>' +
          '<div style="font-size:0.87rem;color:var(--text-secondary)">' + week.protocol[k] + '</div>' +
        '</div>';
    });
  }

  return '<div style="background:rgba(136,136,136,0.1);border:1px solid rgba(136,136,136,0.3);border-radius:var(--radius-xl);padding:20px;margin-bottom:16px">' +
    (week.milestone ? '<div style="text-align:center;margin-bottom:12px;font-size:2rem">&#x1F3C5;</div>' : '') +
    '<div class="flex-between mb-10">' +
      '<span class="badge" style="background:rgba(136,136,136,0.2);color:' + color + '">Week ' + week.week + ': ' + week.title + '</span>' +
      '<span class="badge badge-muted">' + (week.runningMinutes ? week.runningMinutes + ' min' : '') + '</span>' +
    '</div>' +
    '<p style="font-size:0.88rem;margin-bottom:12px">' + (week.description || '') + '</p>' +
    '<div style="background:var(--bg-card);border-radius:var(--radius-md);padding:12px;margin-bottom:12px">' +
      '<div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Protocol</div>' +
      protocolHtml +
    '</div>' +
    (week.effort ? '<div class="badge badge-muted" style="margin-bottom:10px;display:inline-flex">Effort: ' + week.effort + '</div>' : '') +
    (week.coachNote ?
      '<div class="coach-tip" style="margin:0 0 12px 0">' +
        '<div class="coach-avatar" style="width:30px;height:30px;font-size:0.8rem">&#x1F9E0;</div>' +
        '<div><p style="font-size:0.83rem">' + week.coachNote + '</p></div>' +
      '</div>' : '') +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '<button class="btn btn-primary" onclick="startRunSession()">' + icon('play', 14) + ' Start Run</button>' +
      '<button class="btn btn-secondary" onclick="openPreRunWarmup()">Pre-Run Warmup</button>' +
    '</div>' +
  '</div>';
}

function renderRunWeekCard(week) {
  var isCurrent   = week.week === STATE.runningWeek;
  var isCompleted = week.week < STATE.runningWeek;
  var phaseColors = {
    walk_jog: '#10b981', continuous: '#f59e0b', tempo: '#e84393',
    mixed: '#8b5cf6', '5k': '#ef4444', speed: '#3b82f6', athletic: '#ff6b35'
  };
  var color = phaseColors[week.phase] || '#6366f1';

  var protocolText = typeof week.protocol === 'string' ? week.protocol : JSON.stringify(week.protocol);

  return '<div class="running-week' + (isCurrent ? ' expanded' : '') + '" id="run-week-' + week.week + '">' +
    '<div class="running-week-header" onclick="this.closest(\'.running-week\').classList.toggle(\'expanded\')">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:' + (isCurrent ? color : 'var(--bg-input)') + ';display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:' + (isCurrent ? 'white' : (isCompleted ? 'var(--green)' : 'var(--text-muted)')) + '">' +
        (isCompleted ? icon('check', 14) : week.week) +
      '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:0.9rem;font-weight:600;color:' + (isCurrent ? color : 'var(--text-primary)') + '">' +
          'Week ' + week.week + ': ' + week.title +
          (isCurrent ? ' <span class="badge badge-accent" style="font-size:0.62rem">CURRENT</span>' : '') +
          (week.milestone ? ' <span class="badge badge-yellow" style="font-size:0.62rem">MILESTONE</span>' : '') +
        '</div>' +
        '<div style="font-size:0.75rem;color:var(--text-muted)">' + (week.sessions || 3) + ' sessions/week &bull; ' + (week.runningMinutes || '--') + ' min running</div>' +
      '</div>' +
      icon('chevron_down', 16) +
    '</div>' +
    '<div class="running-week-body">' +
      '<p style="font-size:0.87rem;margin-bottom:10px">' + (week.description || '') + '</p>' +
      '<div style="font-size:0.82rem;color:var(--accent);font-weight:600;margin-bottom:4px">Protocol</div>' +
      '<div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">' + protocolText + '</div>' +
      (week.coachNote ? '<div style="font-size:0.83rem;color:var(--indigo);font-style:italic;padding:8px;background:rgba(99,102,241,0.08);border-radius:var(--radius-sm);margin-bottom:10px">"' + week.coachNote + '"</div>' : '') +
      (!isCurrent ? '<button class="btn btn-secondary btn-sm" onclick="jumpToRunWeek(' + week.week + ')">Jump to Week ' + week.week + '</button>' : '') +
    '</div>' +
  '</div>';
}

function renderRunningForm() {
  var cues = RUNNING_PLAN.landingMechanics.cues;
  var html =
    '<div class="section-header"><h3>Running Mechanics</h3></div>' +
    '<div class="coach-tip mb-16">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Form First</div><p>Bad form = knee damage. Learn this before your first run.</p></div>' +
    '</div>';

  cues.forEach(function(c) {
    html +=
      '<div class="card mb-8">' +
        '<div style="display:flex;gap:10px;align-items:flex-start">' +
          '<div style="min-width:80px"><span class="badge badge-purple" style="font-size:0.72rem">' + c.label + '</span></div>' +
          '<p style="font-size:0.87rem;margin:0">' + c.text + '</p>' +
        '</div>' +
      '</div>';
  });

  html += '<div class="section-header mt-16"><h3>Pre-Run Warmup</h3></div>';
  RUNNING_PLAN.kneeProtocol.preRunWarmup.forEach(function(ex) {
    html += '<div class="set-row" style="margin-bottom:4px">' +
      '<div style="flex:1;font-size:0.87rem">' + ex.name + '</div>' +
      '<div style="font-size:0.78rem;color:var(--accent)">' + ex.duration + '</div>' +
    '</div>';
  });

  html += '<div class="section-header mt-16"><h3>Post-Run Cooldown</h3></div>';
  RUNNING_PLAN.kneeProtocol.postRunCooldown.forEach(function(ex) {
    html += '<div class="set-row" style="margin-bottom:4px">' +
      '<div style="flex:1;font-size:0.87rem">' + ex.name + '</div>' +
      '<div style="font-size:0.78rem;color:var(--green)">' + ex.duration + '</div>' +
    '</div>';
  });

  return html;
}

function renderKneeSafety() {
  var protocol = RUNNING_PLAN.kneeProtocol;
  var html =
    '<div class="section-header"><h3>Knee-Safe Protocol</h3></div>' +
    '<div class="card" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);margin-bottom:16px">' +
      '<div class="exercise-section-title" style="color:var(--red)">' + icon('warning', 12) + ' The 6 Golden Rules</div>' +
      protocol.rules.map(function(r) {
        return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<span style="color:var(--red);flex-shrink:0">' + icon('check', 14) + '</span>' +
          '<span style="font-size:0.87rem;color:var(--text-secondary)">' + r + '</span>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div class="section-header"><h3>Knee Strengthening</h3><span class="text-xs text-muted">Do before every run</span></div>';

  protocol.kneeStrengthening.forEach(function(ex) {
    var exData = EXERCISES[ex.id];
    html +=
      '<div class="card-sm mb-8" style="display:flex;gap:10px;align-items:center">' +
        '<div style="width:36px;height:36px;border-radius:var(--radius-sm);background:var(--green-dim);color:var(--green);display:flex;align-items:center;justify-content:center">' + icon('check', 16) + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:0.88rem;font-weight:600">' + (exData ? exData.name : ex.id) + '</div>' +
          '<div style="font-size:0.78rem;color:var(--text-muted)">' + ex.note + '</div>' +
        '</div>' +
      '</div>';
  });

  html += '<div class="section-header mt-16"><h3>Warning Signals</h3></div>';
  RUNNING_PLAN.kneeWarnings.forEach(function(w) {
    html +=
      '<div class="knee-warning" style="margin-bottom:8px">' +
        '<div style="color:var(--red);flex-shrink:0">' + icon('warning', 18) + '</div>' +
        '<div>' +
          '<div style="font-size:0.87rem;font-weight:600;margin-bottom:3px">' + w.signal + '</div>' +
          '<div style="font-size:0.83rem;color:var(--text-secondary)">' + w.action + '</div>' +
        '</div>' +
      '</div>';
  });

  return html;
}

function startRunSession() {
  var week = RUNNING_PLAN.weeks[STATE.runningWeek - 1];
  if (!week) return;

  runSession = { active: true, interval: null, seconds: 0 };

  var overlay = el('workout-overlay') || createRunOverlay();
  overlay.classList.add('open');

  var protocolText = typeof week.protocol === 'string' ? week.protocol : (week.protocol.session1 || '');

  overlay.innerHTML =
    '<div class="modal-sheet" style="border-radius:var(--radius-xl)">' +
      '<div class="modal-handle"></div>' +
      '<div class="flex-between mb-16">' +
        '<div><h3>Week ' + week.week + ': ' + week.title + '</h3><p style="font-size:0.83rem">' + (week.effort || 'Comfortable pace') + '</p></div>' +
        '<button class="btn btn-ghost btn-sm" onclick="closeRunSession()">' + icon('close', 16) + '</button>' +
      '</div>' +
      '<div style="text-align:center;margin-bottom:24px">' +
        '<div style="font-size:3rem;font-weight:800;font-family:var(--mono);color:var(--accent);letter-spacing:-0.05em" id="run-timer-display">00:00</div>' +
        '<div style="font-size:0.8rem;color:var(--text-muted)">elapsed time</div>' +
      '</div>' +
      '<div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:12px;margin-bottom:16px">' +
        '<div style="font-size:0.72rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Today\'s Protocol</div>' +
        '<div style="font-size:0.87rem;color:var(--text-secondary)">' + protocolText + '</div>' +
      '</div>' +
      '<div class="coach-tip mb-16" style="margin:0 0 16px 0">' +
        '<div class="coach-avatar" style="width:28px;height:28px;font-size:0.75rem">&#x1F9E0;</div>' +
        '<div><p style="font-size:0.82rem">Land midfoot. Breathe rhythmically. If you cannot talk, slow down.</p></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<button class="btn btn-red" onclick="closeRunSession()">Stop Run</button>' +
        '<button class="btn btn-green" onclick="completeRun()">Complete</button>' +
      '</div>' +
    '</div>';

  runSession.interval = setInterval(function() {
    runSession.seconds++;
    var d = el('run-timer-display');
    if (d) d.textContent = formatTime(runSession.seconds);
  }, 1000);
}

function completeRun() {
  var duration = runSession.seconds;
  closeRunSession();
  showToast('Run complete - ' + formatTime(duration) + '. Well done!', 'success');
  Progression.recordRun();
  markWorkoutDone();
}

function closeRunSession() {
  clearInterval(runSession.interval);
  runSession = { active: false, interval: null, seconds: 0 };
  var overlay = el('workout-overlay');
  if (overlay) { overlay.classList.remove('open'); overlay.innerHTML = ''; }
}

function createRunOverlay() {
  var d = document.createElement('div');
  d.id  = 'workout-overlay';
  d.className = 'modal-overlay';
  d.onclick = function(e) { if (e.target === d) closeRunSession(); };
  document.body.appendChild(d);
  return d;
}

function openPreRunWarmup() {
  navigate('warmup');
  setTimeout(function() {
    if (typeof startGuidedWarmup === 'function') startGuidedWarmup('running', 'warmup');
  }, 100);
}

function changeRunWeek(dir) {
  var newWeek = Math.max(1, Math.min(RUNNING_PLAN.weeks.length, STATE.runningWeek + dir));
  STATE.runningWeek = newWeek;
  Store.save('runningWeek', newWeek);
  renderRunning();
}

function jumpToRunWeek(week) {
  if (!confirm('Jump to Week ' + week + '? Only do this if you have completed previous weeks.')) return;
  STATE.runningWeek = week;
  Store.save('runningWeek', week);
  showToast('Running Week set to ' + week, 'success');
  renderRunning();
}
