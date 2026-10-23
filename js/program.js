/* --- PROGRAM PAGE --- ES5 compatible --- */

function renderProgram() {
  var phase = PROGRAMS.phases[STATE.phase];
  var phaseColor = getPhaseColor(STATE.phase);

  el('program-content').innerHTML =
    '<div class="top-header">' +
      '<h2>My Program</h2>' +
      '<span class="badge" style="background:rgba(136,136,136,0.2);color:' + phaseColor + '">Phase ' + STATE.phase + ' Active</span>' +
    '</div>' +
    '<div class="coach-tip mb-16">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Programming Philosophy</div>' +
      '<p>Every phase exists for a reason. Skipping foundation phase is how athletes get injured. Respect the progression.</p></div>' +
    '</div>' +
    '<div class="section-header"><h3>Training Phases</h3></div>' +
    '<div style="margin-bottom:20px">' +
      PROGRAMS.phases.map(function(p) { return renderPhaseCard(p); }).join('') +
    '</div>' +
    renderCurrentPhaseDetail() +
    renderTestosteronePlan();
}

function renderPhaseCard(phase) {
  var isActive    = phase.id === STATE.phase;
  var isCompleted = phase.id < STATE.phase;
  var color    = PHASE_COLORS[phase.id] || '#888';
  var progress = isActive ? getPhaseProgress() : (isCompleted ? 100 : 0);

  var html = '<div class="phase-card ' + (isActive ? 'active-phase' : '') + '" ' +
    'style="background:rgba(136,136,136,0.08);border-color:' + (isActive ? color : 'transparent') + ';margin-bottom:8px" ' +
    'onclick="selectPhase(' + phase.id + ')">' +
    '<div class="phase-num">' + phase.id + '</div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;position:relative">' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<span class="badge" style="background:rgba(136,136,136,0.2);color:' + color + '">Phase ' + phase.id + '</span>' +
        (isActive    ? '<span class="badge badge-accent">CURRENT</span>' : '') +
        (isCompleted ? '<span class="badge badge-green">DONE</span>'    : '') +
      '</div>' +
      '<span style="font-size:0.72rem;color:var(--text-muted)">' + phase.duration + '</span>' +
    '</div>' +
    '<h3 style="color:' + color + ';margin-bottom:2px;position:relative">' + phase.name + '</h3>' +
    '<p style="font-size:0.85rem;position:relative;margin-bottom:6px">' + phase.subtitle + '</p>' +
    (phase.split ? '<div style="position:relative"><span class="badge badge-muted" style="font-size:0.68rem">' + phase.split + '</span></div>' : '');

  if (isActive || isCompleted) {
    html +=
      '<div class="progress-bar" style="margin-top:10px;position:relative">' +
        '<div class="progress-fill" style="width:' + progress + '%;background:' + color + '"></div>' +
      '</div>' +
      '<div class="flex-between mt-4" style="position:relative">' +
        '<span style="font-size:0.72rem;color:var(--text-muted)">' + (isCompleted ? 'Completed' : 'Week ' + STATE.weekInPhase) + '</span>' +
        '<span style="font-size:0.72rem;color:var(--text-muted)">' + progress + '%</span>' +
      '</div>';
  }

  if (!isActive) {
    html += '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:6px;position:relative">' +
      phase.description.substring(0, 90) + '...' +
    '</div>';
  }

  html += '</div>';
  return html;
}

function renderCurrentPhaseDetail() {
  var phase = PROGRAMS.phases[STATE.phase];
  if (!phase || !phase.schedule) return '';
  var color = getPhaseColor(STATE.phase);

  var html = '';

  // HRV Rules
  if (phase.hrvRules) {
    var hrvCfg = {
      green:  { color: '#10b981', label: 'Green',  bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)'  },
      yellow: { color: '#f59e0b', label: 'Yellow', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)'  },
      red:    { color: '#ef4444', label: 'Red',    bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)'   },
      redx2:  { color: '#ef4444', label: 'Red x2', bg: 'rgba(139,0,0,0.12)',    border: 'rgba(239,68,68,0.4)'    }
    };
    html += '<div class="section-header"><h3>HRV Protocol</h3><span class="text-xs text-muted">Check every morning</span></div>' +
      '<div class="card mb-16">';
    Object.keys(phase.hrvRules).forEach(function(k) {
      var cfg = hrvCfg[k] || { color: '#888', label: k, bg: 'transparent', border: 'var(--border)' };
      html += '<div style="display:flex;gap:10px;padding:8px;margin-bottom:6px;background:' + cfg.bg + ';border:1px solid ' + cfg.border + ';border-radius:var(--radius-sm)">' +
        '<span style="font-size:0.75rem;font-weight:700;color:' + cfg.color + ';min-width:52px;margin-top:1px">' + cfg.label + '</span>' +
        '<span style="font-size:0.85rem;color:var(--text-secondary)">' + phase.hrvRules[k] + '</span>' +
      '</div>';
    });
    html += '</div>';
  }

  html += '<div class="section-header">' +
    '<h3>Phase ' + STATE.phase + ' Schedule</h3>' +
    '<button class="btn btn-ghost btn-sm" onclick="advanceWeek()">Week ' + STATE.weekInPhase + ' -- Next +</button>' +
  '</div>';

  if (phase.split) {
    html += '<div style="margin-bottom:12px"><span class="badge badge-purple" style="font-size:0.75rem">' + phase.split + '</span></div>';
  }

  // Goals
  if (phase.goals) {
    html += '<div class="card mb-12">' +
      '<div class="exercise-section-title">' + icon('trophy', 12) + ' Phase Goals</div>' +
      '<div style="margin-top:8px">' +
        phase.goals.map(function(g) {
          return '<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">' +
            '<span style="color:' + color + ';margin-top:2px;flex-shrink:0">' + icon('check', 14) + '</span>' +
            '<span style="font-size:0.87rem;color:var(--text-secondary)">' + g + '</span>' +
          '</div>';
        }).join('') +
      '</div></div>';
  }

  // Schedule
  html += '<div style="margin-bottom:20px">';
  phase.schedule.forEach(function(ses, i) {
    html += renderScheduleDay(ses, i, color);
  });
  html += '</div>';

  // Restrictions
  if (phase.restrictions) {
    html += '<div class="card mb-16" style="border-color:rgba(239,68,68,0.2);background:rgba(239,68,68,0.05)">' +
      '<div class="exercise-section-title">' + icon('warning', 12) + ' Phase Restrictions</div>' +
      phase.restrictions.map(function(r) { return '<div class="mistake-item" style="margin-top:4px">' + icon('warning', 12) + ' ' + r + '</div>'; }).join('') +
    '</div>';
  }

  return html;
}

function renderScheduleDay(session, idx, color) {
  var days     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var today    = new Date().getDay();
  var todayMon = today === 0 ? 6 : today - 1;
  var isToday  = idx === todayMon;
  var isRest   = session.rest && !session.walk && !session.massage;
  var isMassage= session.massage;
  var isWalk   = session.walk;
  var exCount  = (session.exercises || []).length;
  var dotColor = isRest ? 'var(--text-muted)' : isMassage ? '#8b5cf6' : isWalk ? '#10b981' : color;

  var html = '<div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start">' +
    '<div style="width:36px;flex-shrink:0;text-align:center;padding-top:10px">' +
      '<div style="font-size:0.62rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">' + days[idx].slice(0,3) + '</div>' +
      '<div style="font-size:0.9rem;font-weight:700;color:' + (isToday ? color : 'var(--text-primary)') + '">' + (idx+1) + '</div>' +
    '</div>' +
    '<div style="flex:1;background:var(--bg-card);border:1px solid ' + (isToday ? color : 'var(--border)') + ';border-radius:var(--radius-md);overflow:hidden">' +
      '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer" onclick="this.parentElement.querySelector(\'.day-detail\') && this.parentElement.querySelector(\'.day-detail\').classList.toggle(\'hidden\')">' +
        '<div style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';flex-shrink:0"></div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:0.88rem;font-weight:600;color:' + (isToday ? color : 'var(--text-primary)') + ';display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
            session.focus +
            (isToday   ? ' <span class="badge badge-accent" style="font-size:0.62rem">TODAY</span>'   : '') +
            (isMassage ? ' <span class="badge badge-purple" style="font-size:0.62rem">MASSAGE</span>' : '') +
            (session.hrv ? ' <span class="badge badge-muted" style="font-size:0.62rem">HRV</span>'   : '') +
          '</div>' +
          '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">' +
            (session.split ? session.split : '') +
            (!isRest && !isWalk && exCount > 0 ? (session.split ? ' &bull; ' : '') + exCount + ' exercises' : '') +
            (isRest ? 'Rest day' : '') +
            (isWalk ? 'Active recovery' : '') +
          '</div>' +
        '</div>' +
        (!isRest ? icon('chevron_down', 14) : '') +
      '</div>';

  // Detail section
  if (!isRest) {
    html += '<div class="day-detail hidden" style="padding:0 12px 12px;border-top:1px solid var(--border)">';

    // Warmup
    if (session.warmup && session.warmup.length) {
      html += '<div style="margin-top:8px;margin-bottom:6px">' +
        '<div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Warmup</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
          session.warmup.map(function(w) { return '<span class="badge badge-muted" style="font-size:0.68rem">' + getExerciseName(w) + '</span>'; }).join('') +
        '</div></div>';
    }

    // Exercises
    if (exCount > 0) {
      html += '<div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;margin-top:8px">Main Work</div>';
      session.exercises.forEach(function(e) {
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid var(--border)">' +
          '<div style="flex:1"><span style="font-size:0.84rem;color:var(--text-secondary)">' + getExerciseName(e.id) + '</span>' +
          (e.note ? '<div style="font-size:0.74rem;color:var(--text-muted);margin-top:1px">' + e.note + '</div>' : '') +
          '</div><span style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap;margin-left:8px">' + e.sets + 'x' + e.reps + '</span>' +
        '</div>';
      });
    }

    // Core finisher
    if (session.coreFinisher && session.coreFinisher.length) {
      html += '<div style="margin-top:10px;padding:10px;background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-sm)">' +
        '<div style="font-size:0.7rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">' + icon('zap', 12) + ' Core Finisher</div>';
      session.coreFinisher.forEach(function(e) {
        html += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(16,185,129,0.15)">' +
          '<div><span style="font-size:0.83rem;color:var(--text-secondary)">' + getExerciseName(e.id) + '</span>' +
          (e.note ? '<div style="font-size:0.72rem;color:var(--text-muted)">' + e.note + '</div>' : '') + '</div>' +
          '<span style="font-size:0.78rem;color:var(--green);font-weight:600">' + e.sets + 'x' + e.reps + '</span>' +
        '</div>';
      });
      html += '</div>';
    }

    // Cardio / Running
    if (session.cardio) {
      html += '<div style="margin-top:10px;padding:8px;background:rgba(99,102,241,0.08);border-radius:var(--radius-sm);border:1px solid rgba(99,102,241,0.2)">' +
        '<div style="font-size:0.72rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Cardio</div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">' + session.cardio.description + '</div></div>';
    }
    if (session.running) {
      html += '<div style="margin-top:10px;padding:8px;background:rgba(16,185,129,0.08);border-radius:var(--radius-sm);border:1px solid rgba(16,185,129,0.2)">' +
        '<div style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Running</div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">' + session.running.description + '</div></div>';
    }

    // HIIT
    if (session.hiit) {
      var hiitExercises = STATE.mode === 'home'
        ? (session.hiit.home || [])
        : (session.hiit.gym  || []);
      html += '<div style="margin-top:10px;padding:10px;background:rgba(239,68,68,0.08);border-radius:var(--radius-sm);border:1px solid rgba(239,68,68,0.2)">' +
        '<div style="font-size:0.72rem;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">' +
          'HIIT Circuit -- ' + session.hiit.rounds + ' rounds &bull; ' + session.hiit.work + 's on / ' + session.hiit.rest + 's off' +
        '</div>' +
        '<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:6px">' + session.hiit.note + '</div>' +
        (hiitExercises.length > 0 ?
          hiitExercises.map(function(e, i) {
            return '<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid rgba(239,68,68,0.1)">' +
              '<span style="font-size:0.72rem;font-weight:700;color:var(--red);min-width:20px">' + (i+1) + '</span>' +
              '<div><div style="font-size:0.83rem;font-weight:500">' + e.name + '</div>' +
                '<div style="font-size:0.75rem;color:var(--text-muted)">' + e.note + '</div>' +
              '</div>' +
            '</div>';
          }).join('')
        : '') +
        '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:6px">Mode: ' + (STATE.mode === 'home' ? 'Home (no equipment)' : 'Gym') + ' -- switch in workout tab</div>' +
      '</div>';
    }

    // Massage
    if (session.massageProtocol) {
      html += '<div style="margin-top:10px;padding:8px;background:rgba(139,92,246,0.08);border-radius:var(--radius-sm);border:1px solid rgba(139,92,246,0.2)">' +
        '<div style="font-size:0.72rem;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Massage Protocol</div>' +
        '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">' + session.massageProtocol.timing + '</div>' +
        session.massageProtocol.focus.map(function(f) { return '<div style="font-size:0.83rem;color:var(--text-secondary);padding:2px 0">- ' + f + '</div>'; }).join('') +
        '<div style="font-size:0.8rem;color:#8b5cf6;margin-top:6px;font-style:italic">' + session.massageProtocol.note + '</div></div>';
    }

    // Progression
    if (session.progressionNote) {
      html += '<div style="margin-top:8px;padding:8px;background:rgba(245,158,11,0.07);border-radius:var(--radius-sm);border-left:3px solid var(--yellow)">' +
        '<div style="font-size:0.72rem;font-weight:700;color:var(--yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Progression</div>' +
        '<div style="font-size:0.83rem;color:var(--text-secondary)">' + session.progressionNote + '</div></div>';
    }

    // Coach cue
    if (session.coachCue) {
      html += '<div style="margin-top:8px;padding:8px;background:rgba(99,102,241,0.07);border-radius:var(--radius-sm);border-left:3px solid #6366f1">' +
        '<div style="font-size:0.72rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Coach</div>' +
        '<div style="font-size:0.83rem;color:var(--text-secondary);font-style:italic">' + session.coachCue + '</div></div>';
    }

    // Sleep note
    if (session.sleepNote) {
      html += '<div style="margin-top:6px;padding:6px 8px;background:rgba(239,68,68,0.06);border-radius:var(--radius-sm)">' +
        '<span style="font-size:0.78rem;color:var(--red)">' + icon('moon', 12) + ' Under 7hrs: ' + session.sleepNote + '</span></div>';
    }

    // Start button
    if (exCount > 0) {
      html += '<button class="btn btn-primary btn-full btn-sm" style="margin-top:12px" onclick="startSessionByIndex(' + idx + ')">' + icon('play', 14) + ' Start Session</button>';
    }

    html += '</div>';
  }

  // Rest/walk activities
  if ((isRest || isWalk) && session.activities) {
    html += '<div style="padding:0 12px 10px;border-top:1px solid var(--border)">';
    session.activities.forEach(function(a) {
      html += '<div style="font-size:0.83rem;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border)">' + a + '</div>';
    });
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}

function renderTestosteronePlan() {
  var phase = PROGRAMS.phases[STATE.phase];
  if (!phase || !phase.testosterone_boosters) return '';
  return '<div class="section-header"><h3>T-Boost Protocol</h3></div>' +
    '<div class="card" style="border-color:rgba(239,68,68,0.2);margin-bottom:16px">' +
      '<div class="exercise-section-title" style="color:var(--red)">' + icon('zap', 12) + ' Testosterone Boosters This Phase</div>' +
      phase.testosterone_boosters.map(function(t) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<span style="color:var(--red)">' + icon('flame', 14) + '</span>' +
          '<span style="font-size:0.87rem;color:var(--text-secondary)">' + t + '</span>' +
        '</div>';
      }).join('') +
      '<div style="margin-top:10px">' +
        '<button class="btn btn-sm btn-ghost" onclick="navigate(\'recovery\')">Full Protocol ' + icon('chevron_down', 14) + '</button>' +
      '</div>' +
    '</div>';
}

function selectPhase(phaseId) {
  if (phaseId === STATE.phase) return;
  if (!confirm('Switch to Phase ' + phaseId + ': ' + PROGRAMS.phases[phaseId].name + '? This will reset your week counter.')) return;
  Progression.setPhase(phaseId, 1);
  showToast('Switched to Phase ' + phaseId + ': ' + PROGRAMS.phases[phaseId].name, 'success');
  renderProgram();
}

function advanceWeek() {
  Progression.setWeek(STATE.weekInPhase + 1);
  showToast('Week ' + STATE.weekInPhase + ' started. Keep pushing!', 'success');
  renderProgram();
}

function startSessionByIndex(idx) {
  navigate('workout');
  setTimeout(function() { startSession(idx); }, 50);
}

function getPhaseProgress() {
  var total = Progression.phaseWeeks(STATE.phase);
  if (!total) return 50;
  return Math.min(100, Math.round((STATE.weekInPhase / total) * 100));
}
