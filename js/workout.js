/* --- ACTIVE WORKOUT PAGE --- ES5 compatible --- */

var activeWorkout = {
  exercises: [], currentExIdx: 0, sets: {}, title: '',
  startTime: null, restTimer: null, restRemaining: 0,
  paused: false, elapsedInterval: null, swappedExercises: {},
  frozenElapsed: undefined
};

/*  PAGE RENDER  */

function renderWorkout() {
  var phase      = PROGRAMS.phases[STATE.phase];
  var todayDow   = new Date().getDay();
  var schedIdx   = todayDow === 0 ? 6 : todayDow - 1;
  var session    = phase && phase.schedule ? phase.schedule[schedIdx] : null;
  var hasPaused  = activeWorkout.exercises.length > 0 && !activeWorkout.startTime && activeWorkout.frozenElapsed !== undefined;
  var hasActive  = activeWorkout.exercises.length > 0 && activeWorkout.startTime;

  var html =
    '<div class="top-header">' +
      '<h2>Workout</h2>' +
      '<div class="mode-toggle">' +
        '<button class="mode-btn ' + (STATE.mode === 'gym'        ? 'active' : '') + '" onclick="setMode(\'gym\',\'workout\')">Gym</button>' +
        '<button class="mode-btn ' + (STATE.mode === 'home'       ? 'active' : '') + '" onclick="setMode(\'home\',\'workout\')">Home</button>' +
        '<button class="mode-btn ' + (STATE.mode === 'bodyweight' ? 'active' : '') + '" onclick="setMode(\'bodyweight\',\'workout\')">No Kit</button>' +
      '</div>' +
    '</div>';

  if (hasPaused) {
    html +=
      '<div style="background:var(--accent);color:white;padding:10px 14px;border-radius:var(--radius-md);' +
        'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
        '<span style="font-size:0.88rem;font-weight:600">' + icon('dumbbell', 16) + ' Session paused &bull; ' + formatTime(activeWorkout.frozenElapsed || 0) + ' elapsed</span>' +
        '<button onclick="resumeWorkout()" style="background:white;color:var(--accent);border:none;border-radius:6px;padding:5px 14px;font-weight:700;cursor:pointer;font-size:0.83rem">Resume</button>' +
      '</div>';
  }

  html += hasActive ? renderActiveSession() : renderSessionSelector(phase, session);
  el('workout-content').innerHTML = html;
}

function setMode(mode, page) {
  STATE.mode = mode;
  Store.save('mode', mode);
  if (activeWorkout.startTime || activeWorkout.frozenElapsed !== undefined) {
    showToast('Mode: ' + (mode === 'gym' ? 'Gym' : mode === 'home' ? 'Home' : 'No Kit') + ' -- applies to next session');
    renderWorkout();
  } else {
    navigate(page);
  }
}

/*  SESSION SELECTOR  */
function renderSessionSelector(phase, session) {
  if (!phase) {
    return '<div class="empty-state">' + icon('dumbbell', 40) + '<p>Set your training phase in Settings first.</p>' +
      '<button class="btn btn-secondary mt-12" onclick="navigate(\'settings\')">Go to Settings</button></div>';
  }

  var dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var todayMon = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  var schedule = phase.schedule || [];
  var mode     = STATE.mode;
  var html     = '';

  // Phase banner
  html +=
    '<div class="card-accent mb-16">' +
      '<div class="flex-between">' +
        '<div><h3>Phase ' + STATE.phase + ': ' + phase.name + '</h3>' +
          '<p style="font-size:0.83rem;margin-top:2px">Week ' + STATE.weekInPhase + ' -- ' + phase.subtitle + '</p></div>' +
        '<span class="badge" style="background:rgba(136,136,136,0.2);color:' + getPhaseColor(STATE.phase) + '">' + phase.duration + '</span>' +
      '</div>' +
    '</div>';

  html += Progression.renderPlanStatus();

  // Mode info
  html +=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:10px 12px;' +
      'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">' +
      '<div style="width:8px;height:8px;border-radius:50%;background:' + (mode === 'gym' ? 'var(--accent)' : 'var(--green)') + ';flex-shrink:0"></div>' +
      '<span style="font-size:0.85rem;font-weight:600">' + (mode === 'gym' ? 'Gym Mode' : mode === 'home' ? 'Home Mode' : 'No Kit Mode') + '</span>' +
      '<span style="font-size:0.8rem;color:var(--text-muted)">-- exercises auto-adapted</span>' +
    '</div>';

  html += '<div class="section-header"><h3>Select Session</h3></div><div style="margin-bottom:16px">';

  schedule.forEach(function(ses, i) {
    var isToday    = i === todayMon;
    var exList     = ses.exercises || [];
    var exCount    = exList.length;
    var isRest     = ses.rest && !ses.walk && !ses.massage;
    var isWalk     = ses.walk;
    var isMassage  = ses.massage;
    var modeInfo   = (!isRest && !isWalk && exCount > 0) ? getSessionModeInfo(exList, mode) : null;
    var disabled   = modeInfo && modeInfo.unavailable === modeInfo.total;

    var modeTag = '';
    if (modeInfo) {
      if (modeInfo.unavailable === 0 && modeInfo.substituted === 0)
        modeTag = '<span class="badge badge-green" style="font-size:0.62rem">All ' + mode + '</span>';
      else if (disabled)
        modeTag = '<span class="badge badge-red" style="font-size:0.62rem">No ' + mode + '</span>';
      else
        modeTag = '<span class="badge badge-yellow" style="font-size:0.62rem">' + modeInfo.substituted + ' swapped</span>';
    }

    html += '<div class="exercise-card" style="' + (isToday ? 'border-color:var(--accent)' : '') + ';margin-bottom:8px;opacity:' + (disabled ? 0.5 : 1) + '">';

    // Header
    html +=
      '<div class="exercise-header" onclick="' + (!isRest && !isWalk && !disabled ? 'Player.start(' + i + ')' : '') + '" ' +
        'style="cursor:' + (!isRest && !isWalk && !disabled ? 'pointer' : 'default') + '">' +
        '<div class="exercise-icon" style="background:' + (isRest || isWalk ? 'var(--bg-secondary)' : isMassage ? 'rgba(139,92,246,0.15)' : getCategoryBg(ses.focus)) + ';font-size:1.2rem;width:44px;height:44px">' +
          (isRest ? '' : isWalk ? '' : isMassage ? '' : getSessionEmoji(ses.focus)) +
        '</div>' +
        '<div class="exercise-meta">' +
          '<div class="name" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;' + (isToday ? 'color:var(--accent)' : '') + '">' +
            ses.focus +
            (isToday   ? ' <span class="badge badge-accent" style="font-size:0.62rem">TODAY</span>'   : '') +
            (isMassage ? ' <span class="badge badge-purple" style="font-size:0.62rem">MASSAGE</span>' : '') +
            (ses.hrv   ? ' <span class="badge badge-muted" style="font-size:0.62rem">HRV</span>'      : '') +
            ' ' + modeTag +
          '</div>' +
          '<div class="sub">' +
            dayNames[i] +
            (ses.split ? ' &bull; ' + ses.split : '') +
            (isRest  ? ' &bull; Rest day'        : '') +
            (isWalk  ? ' &bull; Active recovery' : '') +
            (!isRest && !isWalk && exCount > 0 ? ' &bull; ' + exCount + ' exercises' : '') +
          '</div>' +
        '</div>' +
        (!isRest && !isWalk && !disabled ? icon('chevron_down', 18) : '') +
      '</div>';

    // Exercise preview
    if (!isRest && !isWalk && exCount > 0 && !disabled) {
      html += '<div style="padding:0 16px 14px">';
      exList.slice(0, 4).forEach(function(e) {
        var exD    = EXERCISES[e.id];
        var modeOk = exD && exD.mode.indexOf(mode) !== -1;
        var altId  = modeOk ? null : findBestAlt(e.id, mode);
        var altEx  = altId ? EXERCISES[altId] : null;
        html +=
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)">' +
            '<div style="flex:1;min-width:0">' +
              '<span style="font-size:0.83rem;color:' + (modeOk ? 'var(--text-secondary)' : 'var(--text-muted)') + ';text-decoration:' + (modeOk ? 'none' : 'line-through') + '">' + (exD ? exD.name : e.id) + '</span>' +
              (altEx ? '<span style="font-size:0.75rem;color:var(--yellow);margin-left:6px">-&gt; ' + altEx.name + '</span>' : '') +
            '</div>' +
            '<span style="font-size:0.78rem;color:var(--text-muted);flex-shrink:0;margin-left:8px">' + e.sets + 'x' + e.reps + '</span>' +
          '</div>';
      });

      if (exCount > 4) html += '<div style="font-size:0.75rem;color:var(--text-muted);padding-top:4px">+' + (exCount - 4) + ' more</div>';

      // Core finisher preview
      if (ses.coreFinisher && ses.coreFinisher.length) {
        html +=
          '<div style="margin-top:10px;background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-sm);padding:8px 10px">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
              '<span style="color:var(--green)">' + icon('zap', 13) + '</span>' +
              '<span style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em">Core Finisher</span>' +
            '</div>';
        ses.coreFinisher.forEach(function(e) {
          html +=
            '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(16,185,129,0.12)">' +
              '<span style="font-size:0.83rem;color:var(--text-secondary)">' + getExerciseName(e.id) + '</span>' +
              '<span style="font-size:0.78rem;color:var(--green);font-weight:600">' + e.sets + 'x' + e.reps + '</span>' +
            '</div>';
        });
        html += '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:5px">Done after main exercises.</div></div>';
      }

      html += '<button class="btn btn-primary btn-full btn-sm mt-12" onclick="Player.start(' + i + ')">' + icon('play', 14) + ' Start session' + (modeInfo && modeInfo.substituted > 0 ? ' (' + modeInfo.substituted + ' auto-swapped)' : '') + '</button>';
      html += '<button class="link-btn" onclick="startSession(' + i + ')">Log manually without the guide</button>';
      html += '<button class="link-btn" onclick="Plan.openEditor(' + i + ')">Edit exercises' + (Plan.isEdited(STATE.phase, i) ? ' (customised)' : '') + '</button>';
      html += '</div>';
    }

    // Disabled message
    if (disabled) {
      html += '<div style="padding:0 16px 12px"><div style="font-size:0.83rem;color:var(--red);padding:8px;background:var(--red-dim);border-radius:var(--radius-sm)">' + icon('warning', 14) + ' No exercises available for ' + mode + ' mode.</div></div>';
    }

    // Rest/walk activities
    if ((isRest || isWalk) && ses.activities) {
      html += '<div style="padding:0 16px 10px;border-top:1px solid var(--border)">';
      ses.activities.forEach(function(a) {
        html += '<div style="font-size:0.83rem;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border)">' + a + '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
  });

  html += '</div>';

  // Custom session
  html +=
    '<div class="section-header"><h3>Custom Session</h3></div>' +
    '<div class="card mb-16">' +
      '<p style="font-size:0.85rem;margin-bottom:12px">Auto-builds a balanced session using only <strong>' + mode + '</strong> exercises.</p>' +
      '<button class="btn btn-secondary btn-full" onclick="startCustomSession()">' + icon('dumbbell', 16) + ' Build Custom Workout</button>' +
    '</div>';

  return html;
}

/*  ACTIVE SESSION  */
function renderActiveSession() {
  var ex      = activeWorkout.exercises[activeWorkout.currentExIdx];
  if (!ex) return '<div class="empty-state"><p>No exercises in session.</p></div>';
  var exData  = EXERCISES[ex.id];
  if (!exData) return '';
  var key     = ex._key || (ex.id + '_' + activeWorkout.currentExIdx);
  var setData = activeWorkout.sets[key] || [];
  var totalEx = activeWorkout.exercises.length;
  var all     = [];
  Object.keys(activeWorkout.sets).forEach(function(k) { all = all.concat(activeWorkout.sets[k]); });
  var doneCount= all.filter(function(s){ return s.done; }).length;
  var totalSets= all.length;
  var elapsed = activeWorkout.startTime ? Math.floor((Date.now() - activeWorkout.startTime) / 1000) : 0;
  var isFirst = activeWorkout.currentExIdx === 0;
  var isLast  = activeWorkout.currentExIdx === totalEx - 1;
  var pct     = totalSets > 0 ? Math.round((doneCount / totalSets) * 100) : 0;
  var isCore  = ex._isCore;
  var logType = getLogTypeFor(ex.id, ex.reps);
  var model   = activeWorkout.model || Progression.getSessionModel();
  var hasLoad = logType === 'weighted' || logType === 'weighted_bw' || logType === 'per_side';

  var arrowL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  var arrowR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  var html   = '';

  // Top bar
  html +=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
      '<button class="btn btn-ghost btn-sm btn-icon" onclick="backToSessionList()" style="flex-shrink:0;border:1px solid var(--border)">' + arrowL + '</button>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:0.72rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (activeWorkout.title || 'Workout') + ' &bull; ' + (activeWorkout.currentExIdx + 1) + '/' + totalEx + '</div>' +
        '<div style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)" id="elapsed-display">' + formatTime(elapsed) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-shrink:0">' +
        '<button class="btn btn-sm btn-secondary" onclick="openSwapModal(\'' + ex.id + '\', function(newId){ swapExercise(newId); })" style="padding:6px 10px">' + icon('swap', 14) + ' Swap</button>' +
        '<button class="btn btn-sm btn-red" onclick="endWorkout()" style="padding:6px 10px">End</button>' +
      '</div>' +
    '</div>';

  // Progress
  html +=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">' +
      '<div class="progress-bar" style="flex:1;margin:0"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span style="font-size:0.72rem;color:var(--text-muted);flex-shrink:0">' + pct + '%</span>' +
    '</div>';

  // Core banner
  if (isCore) {
    html +=
      '<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px">' +
        '<div style="color:var(--green);flex-shrink:0">' + icon('zap', 20) + '</div>' +
        '<div><div style="font-size:0.75rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em">Core Finisher</div>' +
        '<div style="font-size:0.82rem;color:var(--text-secondary)">Main workout done. This seals the session.</div></div>' +
      '</div>';
  }

  // Exercise card
  var cardBorder = isCore ? 'rgba(16,185,129,0.3)' : 'var(--accent-dim)';
  var cardBg     = isCore ? 'rgba(16,185,129,0.05)' : '';
  var icColor    = isCore ? 'var(--green)' : 'var(--accent)';
  var icBg       = isCore ? 'rgba(16,185,129,0.15)' : 'var(--accent-dim)';
  var muscle     = (exData.muscle || '').replace(/_/g, ' ');

  html +=
    '<div class="card-accent mb-12" style="border-color:' + cardBorder + ';background:' + cardBg + '">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
        '<div class="exercise-icon" style="width:48px;height:48px;background:' + icBg + ';color:' + icColor + '">' + icon(isCore ? 'zap' : 'dumbbell', 22) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + exData.name + '</h3>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">' +
            getDifficultyBadge(exData.difficulty) +
            '<span class="badge badge-muted">' + muscle + '</span>' +
            (exData.testosterone ? '<span class="badge badge-red">T-boost</span>' : '') +
            (isCore ? '<span class="badge badge-green">Core</span>' : '') +
            (ex._round ? '<span class="badge badge-accent">Round ' + ex._round + '/' + ex._rounds + '</span>' : '') +
            (!isCore ? '<span class="badge badge-muted">RPE ' + model.rpe + '</span>' : '') +
            '<button class="badge badge-blue" style="border:none;cursor:pointer" onclick="ExerciseMedia.open(\'' + ex.id + '\')">Form</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:var(--radius-sm);padding:10px;margin-bottom:8px">' +
        '<div style="font-size:0.7rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Breathing</div>' +
        '<p style="font-size:0.85rem;margin:0">' + exData.breathing + '</p>' +
      '</div>' +
      '<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-sm);padding:10px">' +
        '<div style="font-size:0.7rem;font-weight:700;color:var(--yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Grip &amp; Setup</div>' +
        '<p style="font-size:0.85rem;margin:0">' + exData.grip + '</p>' +
      '</div>' +
    '</div>';

  // Rest timer slot
  html +=
    '<div id="rest-timer-container" class="hidden mb-12">' +
      '<div class="card" style="text-align:center;padding:20px">' +
        '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em">Rest Timer</div>' +
        '<div class="timer-ring">' +
          '<svg width="140" height="140" viewBox="0 0 140 140">' +
            '<circle class="timer-bg" cx="70" cy="70" r="62"/>' +
            '<circle class="timer-track" cx="70" cy="70" r="62" id="timer-circle" stroke-dasharray="389.56" stroke-dashoffset="0"/>' +
          '</svg>' +
          '<div class="timer-display"><div class="time" id="rest-display">00:00</div><div class="label">rest</div></div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-sm mt-12" onclick="skipRest()">Skip Rest</button>' +
      '</div>' +
    '</div>';

  // Overload prompt
  var overload = hasLoad ? HistoryStore.getOverloadSuggestion(ex.id, ex.reps, model) : null;
  if (overload) {
    html +=
      '<div class="overload-prompt">' +
        '<div style="color:var(--green);flex-shrink:0">' + icon('zap', 16) + '</div>' +
        '<div><p>' + overload.tip + '</p>' +
          '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">Last: ' + overload.lastWeight + STATE.settings.units + ' x ' + overload.lastReps + ' reps</div>' +
        '</div>' +
      '</div>';
  }

  // Sets
  // -- Warmup sets for weighted exercises --
  if (logType === 'weighted' && overload && !ex._round && (exData.rest || 0) >= 90 && overload.lastWeight > 0) {
    var ww = overload.suggestedWeight || overload.lastWeight;
    var wSets = [{p:40,r:8},{p:60,r:5},{p:80,r:3}];
    html +=
      '<details style="margin-top:10px">' +
        '<summary style="cursor:pointer;font-size:0.82rem;color:var(--yellow);padding:6px 0;border-bottom:1px solid var(--border);list-style:none">' +
          icon('sun',14) + ' Warmup Sets (based on ' + ww + STATE.settings.units + ')' +
        '</summary>' +
        '<div style="padding:8px;background:rgba(245,158,11,0.05);border-radius:var(--radius-sm);margin-top:4px">' +
          wSets.map(function(ws){ var w=Math.round(ww*ws.p/100*2)/2; return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span style="font-size:0.82rem;color:var(--text-secondary)">'+ws.p+'% warmup</span><span style="font-size:0.82rem;font-weight:600;color:var(--yellow)">'+w+STATE.settings.units+' x '+ws.r+'</span></div>'; }).join('') +
          '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">Do these before your working sets. Not logged.</div>' +
        '</div>' +
      '</details>';
  }

  html += '<div class="section-header"><h3>Sets</h3><span class="text-xs text-muted">' + (ex._round ? 'Round ' + ex._round + '/' + ex._rounds + ' - ' + ex.reps : ex.sets + ' x ' + ex.reps) + '</span></div>' +
    '<div id="sets-container">';
  setData.forEach(function(s, i) {
    if (!s.weight && overload && overload.suggestedWeight) s.weight = String(overload.suggestedWeight);
    html += renderSetRow(key, i, s);
  });
  html += '</div>';


  // -- RPE Slider --
  var curRpe = (activeWorkout.rpe && activeWorkout.rpe[activeWorkout.currentExIdx]) ? activeWorkout.rpe[activeWorkout.currentExIdx] : 7;
  var rpeCol = curRpe <= 3 ? '#10b981' : curRpe <= 6 ? '#f59e0b' : '#ef4444';
  html +=
    '<div style="margin-top:14px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-md)">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
        '<span style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Rate this set (RPE)</span>' +
        '<span id="rpe-val-' + activeWorkout.currentExIdx + '" style="font-size:0.9rem;font-weight:700;color:' + rpeCol + '">' + curRpe + '/10</span>' +
      '</div>' +
      '<input type="range" min="1" max="10" step="1" value="' + curRpe + '" ' +
        'oninput="updateRPE(' + activeWorkout.currentExIdx + ',this.value)" ' +
        'style="width:100%;accent-color:var(--accent);cursor:pointer">' +
      '<div style="display:flex;justify-content:space-between;font-size:0.68rem;color:var(--text-muted);margin-top:2px">' +
        '<span>1 Easy</span><span>5 Moderate</span><span>10 Max</span>' +
      '</div>' +
    '</div>';

  // Form cues
  html +=
    '<details style="margin-top:16px">' +
      '<summary style="cursor:pointer;font-size:0.9rem;font-weight:600;color:var(--text-secondary);padding:8px 0;border-bottom:1px solid var(--border);list-style:none;display:flex;align-items:center;justify-content:space-between">' +
        'Form Cues ' + icon('chevron_down', 16) +
      '</summary>' +
      '<div style="margin-top:10px">' +
        '<ul class="form-list">' + exData.form.map(function(f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
        (exData.hacks && exData.hacks.length ? exData.hacks.map(function(h) { return '<div class="hack-item">' + icon('zap', 14) + ' ' + h + '</div>'; }).join('') : '') +
      '</div>' +
    '</details>';

  // Navigation
  html += '<div style="display:grid;grid-template-columns:' + (isFirst ? '1fr' : '1fr 1fr') + ';gap:10px;margin-top:16px;margin-bottom:8px">';
  if (!isFirst) html += '<button class="btn btn-secondary" onclick="prevExercise()">' + arrowL + ' Prev</button>';
  if (!isLast) {
    html += '<button class="btn btn-primary" onclick="nextExercise()" style="' + (isFirst ? 'grid-column:1/-1' : '') + '">Next ' + arrowR + '</button>';
  } else {
    html += '<button class="btn btn-green" onclick="completeWorkout()" style="' + (isFirst ? 'grid-column:1/-1' : '') + '">' + icon('check', 16) + ' Complete Workout</button>';
  }
  html += '</div>';

  // Exercise overview list
  html += '<div class="section-header mt-16"><h3>All Exercises</h3></div><div style="margin-bottom:24px">';
  var coreStarted = false;
  activeWorkout.exercises.forEach(function(e, i) {
    var exD      = EXERCISES[e.id];
    var eKey     = e._key || (e.id + '_' + i);
    var exSets   = activeWorkout.sets[eKey] || [];
    var done     = exSets.filter(function(s) { return s.done; }).length;
    var isCur    = i === activeWorkout.currentExIdx;
    var allDone  = done === exSets.length && exSets.length > 0;
    var eIsCore  = e._isCore;

    if (eIsCore && !coreStarted) {
      coreStarted = true;
      html +=
        '<div style="display:flex;align-items:center;gap:8px;margin:12px 0 8px">' +
          '<div style="height:1px;flex:1;background:rgba(16,185,129,0.3)"></div>' +
          '<span style="font-size:0.7rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap">' + icon('zap', 11) + ' Core Finisher</span>' +
          '<div style="height:1px;flex:1;background:rgba(16,185,129,0.3)"></div>' +
        '</div>';
    }

    var rowBorder = isCur ? 'border-color:var(--accent)' : (eIsCore ? 'border-color:rgba(16,185,129,0.25);background:rgba(16,185,129,0.04)' : '');
    var numStyle  = isCur ? 'background:var(--accent);color:white' : (allDone ? 'background:var(--green);color:white' : (eIsCore ? 'background:rgba(16,185,129,0.15);color:var(--green)' : ''));

    html +=
      '<div class="set-row ' + (isCur ? 'completed' : '') + '" style="cursor:pointer;' + rowBorder + ';margin-bottom:6px" onclick="jumpToExercise(' + i + ')">' +
        '<div class="set-num" style="' + numStyle + '">' + (i + 1) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:0.88rem;font-weight:' + (isCur ? 700 : 400) + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + (eIsCore ? 'var(--green)' : 'inherit') + '">' + (exD ? exD.name : e.id) + '</div>' +
          '<div style="font-size:0.75rem;color:var(--text-muted)">' + (e._round ? 'R' + e._round + '/' + e._rounds + ' - ' + e.reps : e.sets + ' x ' + e.reps) + (eIsCore ? ' <span style="color:var(--green);font-weight:600">Core</span>' : '') + '</div>' +
        '</div>' +
        '<div style="font-size:0.78rem;color:' + (allDone ? 'var(--green)' : (done > 0 ? 'var(--yellow)' : 'var(--text-muted)')) + ';flex-shrink:0">' + done + '/' + exSets.length + '</div>' +
        (activeWorkout.swappedExercises[i] ? '<span class="badge badge-yellow" style="font-size:0.65rem;margin-left:4px">Swapped</span>' : '') +
        (isCur ? '<span style="margin-left:6px;color:var(--accent)">' + arrowR + '</span>' : '') +
      '</div>';
  });
  html += '</div>';

  // Start elapsed timer only if actively running
  if (activeWorkout.startTime) {
    clearInterval(activeWorkout.elapsedInterval);
    activeWorkout.elapsedInterval = setInterval(function() {
      var s = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
      var d = el('elapsed-display');
      if (d) d.textContent = formatTime(s);
      else clearInterval(activeWorkout.elapsedInterval);
    }, 1000);
  }

  return html;
}

/*  SESSION CONTROL  */
function startSession(scheduleIndex) {
  var phase = PROGRAMS.phases[STATE.phase];
  if (!phase || !phase.schedule) return;
  var session = phase.schedule[scheduleIndex];
  if (!session || session.rest) return;

  var model = Progression.getSessionModel();
  var core  = (session.coreFinisher || []).map(function(e) {
    return { id: e.id, sets: String(e.sets), reps: e.reps, note: e.note || '', _isCore: true };
  });
  var main = resolveExercisesForMode((session.exercises || []).slice(), STATE.mode);
  if (main.length === 0) { showToast('No exercises for this mode.', 'warning'); return; }
  core = resolveExercisesForMode(core, STATE.mode);

  function withSets(e) { var c = Object.assign({}, e); c.sets = Progression.adjustSets(e.sets, model); return c; }

  var list;
  if (session.circuit && model.rounds) {
    var rounds = Math.max(2, Math.round(model.rounds * Math.min(1, model.setsMult)));
    list = Progression.getCircuitStyle() === 'rounds'
      ? Progression.expandCircuit(main, rounds, model)
      : main.map(function(e) { var c = Object.assign({}, e); c.sets = String(rounds); return c; });
  } else {
    list = main.map(withSets);
  }
  initActiveWorkout(list.concat(core.map(withSets)), session.focus, model);
}

function startCustomSession() {
  var allByMode = Object.keys(EXERCISES).map(function(k) { return EXERCISES[k]; }).filter(function(ex) {
    return exerciseMatchesMode(ex, STATE.mode);
  });

  function pick(cat, count) {
    return allByMode.filter(function(ex) { return ex.category === cat && ex.difficulty <= 2; })
      .slice(0, count)
      .map(function(ex) { return { id: ex.id, sets: ex.sets || '3', reps: ex.reps || '10-12' }; });
  }

  var exercises = pick('legs', 2).concat(pick('push', 2)).concat(pick('pull', 2)).concat(pick('core', 1));
  if (exercises.length === 0) { showToast('No exercises available for this mode.', 'warning'); return; }
  initActiveWorkout(exercises, 'Custom Workout');
}

function initActiveWorkout(exercises, title, model) {
  Native.keepAwake(true);
  var indexed = exercises.map(function(e, i) {
    return Object.assign({}, e, { _key: e.id + '_' + i });
  });

  activeWorkout = {
    exercises: indexed, title: title || 'Workout', currentExIdx: 0, sets: {}, rpe: {}, sessionNote: '',
    model: model || Progression.getSessionModel(),
    startTime: Date.now(), restTimer: null, restRemaining: 0,
    paused: false, elapsedInterval: null, swappedExercises: {}, frozenElapsed: undefined
  };

  indexed.forEach(function(e) {
    var n = parseInt(e.sets) || 3;
    activeWorkout.sets[e._key] = [];
    for (var i = 0; i < n; i++) activeWorkout.sets[e._key].push({ weight: '', reps: '', done: false });
  });

  SoundSystem.sessionStart();
  navigate('workout');
}

function jumpToExercise(idx) { activeWorkout.currentExIdx = idx; renderWorkout(); }
function nextExercise() { if (activeWorkout.currentExIdx < activeWorkout.exercises.length - 1) { activeWorkout.currentExIdx++; renderWorkout(); } }
function prevExercise() { if (activeWorkout.currentExIdx > 0) { activeWorkout.currentExIdx--; renderWorkout(); } }
function updateSetData(key, setIdx, field, value) { if (activeWorkout.sets[key]) activeWorkout.sets[key][setIdx][field] = value; }


function updateRPE(exIdx, val) {
  if (!activeWorkout.rpe) activeWorkout.rpe = {};
  activeWorkout.rpe[exIdx] = parseInt(val);
  var display = document.getElementById('rpe-val-' + exIdx);
  if (display) {
    var v = parseInt(val);
    var col = v <= 3 ? '#10b981' : v <= 6 ? '#f59e0b' : '#ef4444';
    display.textContent = val + '/10';
    display.style.color = col;
  }
}

function completeSet(key, setIdx) {
  if (!activeWorkout.sets[key]) return;
  var exId = key.replace(/_\d+$/, '');
  var set  = activeWorkout.sets[key][setIdx];
  if (!set.done) autoFillTimed(key, set);
  set.done = !set.done;

  if (set.done && set.weight && set.reps && PR_KINDS[setKindForKey(key)]) {
    var weight = parseFloat(set.weight);
    var reps   = parseInt(set.reps);
    if (!isNaN(weight) && !isNaN(reps)) {
      var oneRM = weight * (1 + reps / 30);
      var prev  = STATE.personalRecords[exId];
      if (!prev || oneRM > prev.oneRM) {
        STATE.personalRecords[exId] = { weight: weight, reps: reps, oneRM: Math.round(oneRM), date: todayStr() };
        Store.save('personalRecords', STATE.personalRecords);
        showToast('New PR on ' + ((EXERCISES[exId] || {}).name || exId) + '!', 'success');
      }
    }
  }

  var row = el('set-' + key + '-' + setIdx);
  if (row) row.outerHTML = renderSetRow(key, setIdx, set);
  if (set.done) {
    SoundSystem.tick();
    Native.haptic('light');
    var sx = findSessionExercise(key);
    var finalSet = sx && sx === activeWorkout.exercises[activeWorkout.exercises.length - 1] && setIdx === activeWorkout.sets[key].length - 1;
    var rs = sx ? getRestSeconds(sx) : 0;
    if (rs > 0 && !finalSet) { if (Player.isActive()) Player.rest(rs); else startRestTimer(rs); }
  }
}

/* After a rest: once every set of the current exercise is done, move on to the next exercise by itself */
function autoAdvanceAfterRest(fromIdx) {
  if (activeWorkout.currentExIdx !== fromIdx) return;   // the user already moved on
  var ex = activeWorkout.exercises[fromIdx];
  if (!ex) return;
  var sets = activeWorkout.sets[ex._key || ex.id] || [];
  var allDone = sets.length > 0 && sets.every(function(s) { return s.done; });
  if (allDone && fromIdx < activeWorkout.exercises.length - 1) {
    activeWorkout.currentExIdx = fromIdx + 1;
    renderWorkout();
    window.scrollTo(0, 0);
  }
}

function startRestTimer(seconds) {
  clearInterval(activeWorkout.restTimer);
  activeWorkout.restIdx = activeWorkout.currentExIdx;
  activeWorkout.restRemaining = seconds;
  var container = el('rest-timer-container');
  if (!container) return;
  container.classList.remove('hidden');
  var circ  = 2 * Math.PI * 62;
  var total = seconds;
  var endAt = Date.now() + seconds * 1000;   // wall-clock based: correct even if the phone throttles timers

  function tick() {
    activeWorkout.restRemaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    var disp   = el('rest-display');
    var circle = el('timer-circle');
    if (disp)   disp.textContent = formatTime(Math.max(0, activeWorkout.restRemaining));
    if (circle) circle.style.strokeDashoffset = circ * (1 - activeWorkout.restRemaining / total);
    if (activeWorkout.restRemaining <= 0) {
      clearInterval(activeWorkout.restTimer);
      if (container) container.classList.add('hidden');
      SoundSystem.restDone();
      Native.haptic('success');
      var nextMsg = 'Rest done -- next set!';
      if (activeWorkout.exercises && activeWorkout.currentExIdx < activeWorkout.exercises.length - 1) {
        var nx = EXERCISES[activeWorkout.exercises[activeWorkout.currentExIdx + 1].id];
        if (nx) nextMsg = 'Rest done! Next: ' + nx.name;
      }
      showToast(nextMsg, 'success');
      autoAdvanceAfterRest(activeWorkout.restIdx);
    }
  }
  tick();
  activeWorkout.restTimer = setInterval(tick, 1000);
}

function skipRest() {
  clearInterval(activeWorkout.restTimer);
  var c = el('rest-timer-container');
  if (c) c.classList.add('hidden');
  autoAdvanceAfterRest(activeWorkout.restIdx);
}

function swapExercise(newId) {
  var idx    = activeWorkout.currentExIdx;
  var oldEx  = activeWorkout.exercises[idx];
  var oldKey = oldEx._key || (oldEx.id + '_' + idx);
  var n      = parseInt(oldEx.sets) || 3;
  var newEx  = EXERCISES[newId];
  if (!newEx) return;
  var newKey = newId + '_' + idx;
  activeWorkout.swappedExercises[idx] = oldEx.id;
  activeWorkout.exercises[idx] = { id: newId, _key: newKey, sets: String(n), reps: newEx.reps || '10-12', note: 'Swapped in', _isCore: oldEx._isCore || false, _round: oldEx._round, _rounds: oldEx._rounds, _rest: oldEx._rest };
  activeWorkout.sets[newKey] = [];
  for (var i = 0; i < n; i++) activeWorkout.sets[newKey].push({ weight: '', reps: '', done: false });
  delete activeWorkout.sets[oldKey];
  showToast('Swapped to ' + newEx.name, 'success');
  renderWorkout();
}

/* One history entry per exercise: circuit rounds of the same lift are merged into one set list */
function mergeLoggedExercises() {
  var order = [], byId = {};
  activeWorkout.exercises.forEach(function(e) {
    var sets = (activeWorkout.sets[e._key || e.id] || []).map(function(s) {
      return { weight: s.weight, reps: s.reps, done: s.done, kind: getLogTypeFor(e.id, e.reps) };
    });
    if (!byId[e.id]) {
      var exData = EXERCISES[e.id];
      byId[e.id] = { id: e.id, name: exData ? exData.name : e.id, sets: [] };
      order.push(e.id);
    }
    byId[e.id].sets = byId[e.id].sets.concat(sets);
  });
  return order.map(function(id) { return byId[id]; });
}

var lastSessionId = null;

/* Build and save the session log from the active workout */
function logSession() {
  var duration = activeWorkout.startTime ? Math.floor((Date.now() - activeWorkout.startTime) / 1000) : 0;
  var allSets  = [];
  Object.keys(activeWorkout.sets).forEach(function(k) { allSets = allSets.concat(activeWorkout.sets[k]); });
  var doneCount = allSets.filter(function(s) { return s.done; }).length;

  var sessionLog = {
    id: Date.now(), date: todayStr(), title: activeWorkout.title || 'Workout',
    phase: STATE.phase, duration: duration, doneSets: doneCount, totalSets: allSets.length,
    exercises: mergeLoggedExercises(),
    reduced: !!(activeWorkout.model && activeWorkout.model.reduced),
    week: STATE.weekInPhase,
    rpe: activeWorkout.rpe || {}
  };
  HistoryStore.saveSession(sessionLog);
  lastSessionId = sessionLog.id;
  return { id: sessionLog.id, duration: duration, doneCount: doneCount, totalSets: allSets.length };
}

/* The note box only exists after the session is saved, so it updates the saved entry */
function saveSessionNote(text) {
  if (lastSessionId) HistoryStore.updateSessionNote(lastSessionId, text);
}

function completeWorkout() {
  cancelSetTimer();
  Native.keepAwake(false);
  clearInterval(activeWorkout.elapsedInterval);
  clearInterval(activeWorkout.restTimer);
  var res = logSession();
  var duration = res.duration, doneCount = res.doneCount;
  markWorkoutDone();
  SoundSystem.fanfare();
  Native.haptic('success');

  el('workout-content').innerHTML =
    '<div style="text-align:center;padding:40px 20px">' +
      '<div style="font-size:3rem;margin-bottom:12px">' + icon('trophy', 48) + '</div>' +
      '<h2 style="margin-bottom:8px">Session Complete!</h2>' +
      '<p style="margin-bottom:24px">You crushed it. Recovery starts now.</p>' +
      '<div class="stats-row" style="margin-bottom:24px">' +
        '<div class="stat-tile"><div class="value text-green">' + formatTime(duration) + '</div><div class="label">Duration</div></div>' +
        '<div class="stat-tile"><div class="value text-accent">' + doneCount + '</div><div class="label">Sets Done</div></div>' +
        '<div class="stat-tile"><div class="value text-yellow">' + STATE.streak + '</div><div class="label">Streak</div></div>' +
      '</div>' +
      '<div style="margin-bottom:14px">' +
      '<label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Session note</label>' +
      '<input type="text" id="session-note-input" placeholder="How did it feel? Any pain? PRs hit?" maxlength="300" onchange="saveSessionNote(this.value)" ' +
        'style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);padding:8px 12px;color:var(--text-primary);font-size:0.9rem;font-family:var(--font);outline:none">' +
    '</div>' +
    '<div class="coach-tip" style="text-align:left;margin-bottom:20px">' +
        '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
        '<div><div class="coach-name">Post-Workout Protocol</div><p>Protein within 45 min. Cold shower. Sleep.</p></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
        '<button class="btn btn-secondary" onclick="navigate(\'warmup\')">' + icon('heart', 16) + ' Cooldown</button>' +
        '<button class="btn btn-secondary" onclick="navigate(\'nutrition\')">' + icon('sun', 16) + ' Nutrition</button>' +
      '</div>' +
      '<button class="btn btn-primary btn-full" onclick="resetWorkout()">Back to Dashboard</button>' +
    '</div>';

  activeWorkout = { exercises: [], currentExIdx: 0, sets: {}, title: '', startTime: null, restTimer: null, restRemaining: 0, paused: false, elapsedInterval: null, swappedExercises: {}, frozenElapsed: undefined };
}

function endWorkout() {
  if (!confirm('End session? Completed sets are saved.')) return;
  cancelSetTimer();
  Native.keepAwake(false);
  clearInterval(activeWorkout.elapsedInterval);
  clearInterval(activeWorkout.restTimer);
  var res = activeWorkout.exercises.length ? logSession() : null;
  if (res && res.doneCount > 0) {
    if (res.doneCount * 2 >= res.totalSets) markWorkoutDone();
    showToast('Saved ' + res.doneCount + ' completed sets', 'success');
  } else if (res) {
    HistoryStore.deleteSession(res.id);
  }
  activeWorkout = { exercises: [], currentExIdx: 0, sets: {}, title: '', startTime: null, restTimer: null, restRemaining: 0, paused: false, elapsedInterval: null, swappedExercises: {}, frozenElapsed: undefined };
  renderWorkout();
}

function resetWorkout() { navigate('dashboard'); }

function backToSessionList() {
  clearInterval(activeWorkout.elapsedInterval);
  clearInterval(activeWorkout.restTimer);
  activeWorkout.frozenElapsed = activeWorkout.startTime ? Math.floor((Date.now() - activeWorkout.startTime) / 1000) : 0;
  activeWorkout.startTime = null;
  renderWorkout();
}

function resumeWorkout() {
  if (!activeWorkout.exercises.length) return;
  activeWorkout.startTime = Date.now() - ((activeWorkout.frozenElapsed || 0) * 1000);
  activeWorkout.frozenElapsed = undefined;
  renderWorkout();
}

/*  MODE RESOLUTION  */
function exerciseMatchesMode(ex, mode) {
  if (!ex) return false;
  if (mode === 'bodyweight') {
    return ex.mode.indexOf('home') !== -1 &&
      ['bodyweight', 'resistance_band', 'pullup_bar'].indexOf(ex.equipment) !== -1;
  }
  return ex.mode.indexOf(mode) !== -1;
}

function resolveExercisesForMode(plannedExercises, mode) {
  var resolved = [], substituted = [], skipped = [];
  plannedExercises.forEach(function(planned) {
    var ex = EXERCISES[planned.id];
    if (ex && exerciseMatchesMode(ex, mode)) {
      resolved.push(Object.assign({}, planned, { _resolved: 'original' }));
      return;
    }
    var alt = findBestAlt(planned.id, mode);
    if (alt) {
      var altEx = EXERCISES[alt];
      resolved.push({ id: alt, sets: planned.sets || altEx.sets || '3', reps: planned.reps || altEx.reps || '10-12', note: 'Auto-subst: ' + (ex ? ex.name : planned.id), _resolved: 'substituted', _original: planned.id, _isCore: planned._isCore || false });
      substituted.push(altEx.name);
    } else {
      skipped.push(ex ? ex.name : planned.id);
    }
  });
  if (substituted.length > 0) setTimeout(function() { showToast(substituted.length + ' exercise(s) swapped for ' + mode + ' mode'); }, 300);
  if (skipped.length > 0)     setTimeout(function() { showToast(skipped.length + ' exercise(s) skipped -- no ' + mode + ' alternative', 'warning'); }, 800);
  return resolved;
}

function findBestAlt(exerciseId, mode) {
  var ex = EXERCISES[exerciseId];
  if (!ex) return null;
  var alts = ex.alternatives || [];
  for (var i = 0; i < alts.length; i++) {
    var altEx = EXERCISES[alts[i].id];
    if (altEx && exerciseMatchesMode(altEx, mode)) return alts[i].id;
  }
  var exKeys = Object.keys(EXERCISES);
  for (var j = 0; j < exKeys.length; j++) {
    var e = EXERCISES[exKeys[j]];
    if (e.id !== exerciseId && e.category === ex.category && e.muscle === ex.muscle && exerciseMatchesMode(e, mode)) return e.id;
  }
  for (var k = 0; k < exKeys.length; k++) {
    var e2 = EXERCISES[exKeys[k]];
    if (e2.id !== exerciseId && e2.category === ex.category && exerciseMatchesMode(e2, mode)) return e2.id;
  }
  return null;
}

function getSessionModeInfo(exercises, mode) {
  var comp = 0, sub = 0, unavail = 0;
  (exercises || []).forEach(function(e) {
    var ex = EXERCISES[e.id];
    if (!ex) { unavail++; return; }
    if (exerciseMatchesMode(ex, mode)) { comp++; return; }
    if (findBestAlt(e.id, mode)) sub++;
    else unavail++;
  });
  return { compatible: comp, substituted: sub, unavailable: unavail, total: (exercises || []).length };
}

function getCategoryBg(focusLabel) {
  if (!focusLabel) return 'var(--bg-secondary)';
  var fl = focusLabel.toLowerCase();
  if (fl.indexOf('push') !== -1 || fl.indexOf('chest') !== -1) return 'rgba(0,212,180,0.15)';
  if (fl.indexOf('pull') !== -1 || fl.indexOf('back') !== -1)  return 'rgba(59,130,246,0.15)';
  if (fl.indexOf('leg')  !== -1 || fl.indexOf('lower') !== -1) return 'rgba(245,158,11,0.15)';
  if (fl.indexOf('core') !== -1)                               return 'rgba(16,185,129,0.15)';
  if (fl.indexOf('cardio') !== -1 || fl.indexOf('zone') !== -1)return 'rgba(99,102,241,0.15)';
  return 'var(--bg-secondary)';
}

function getSessionEmoji(focusLabel) {
  if (!focusLabel) return '';
  var fl = focusLabel.toLowerCase();
  if (fl.indexOf('push')  !== -1 || fl.indexOf('chest') !== -1) return icon('dumbbell', 20);
  if (fl.indexOf('pull')  !== -1 || fl.indexOf('back')  !== -1) return icon('dumbbell', 20);
  if (fl.indexOf('leg')   !== -1 || fl.indexOf('squat') !== -1) return icon('zap', 20);
  if (fl.indexOf('core')  !== -1)                               return icon('zap', 20);
  if (fl.indexOf('run')   !== -1 || fl.indexOf('cardio') !== -1)return icon('run', 20);
  if (fl.indexOf('full')  !== -1)                               return icon('flame', 20);
  return icon('dumbbell', 20);
}
