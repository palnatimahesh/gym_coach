/* --- PROGRESSION ENGINE --- ES5 ---
   Week models (RPE / deload / circuit rounds), auto week sync, break re-entry,
   missed-session detection and readiness auto-regulation.
   Depends on: STATE, Store, PROGRAMS, HistoryStore (resolved at call time). */

var Progression = (function() {

  function W(label, rpe, extra) {
    var m = { label: label, rpe: rpe, setsMult: 1, loadPct: 100, deload: false, catchUp: false, rounds: 0, restStation: 30, restRound: 90 };
    for (var k in extra) if (extra.hasOwnProperty(k)) m[k] = extra[k];
    return m;
  }
  function DL(label) { return W(label, '5-6', { setsMult: 0.5, loadPct: 65, deload: true }); }

  /* Phase id -> ordered week models. Phase 4 cycles (every 4th week deloads). */
  var MODELS = {
    0: [W('Activation', '5-6', {}), W('Activation', '6', {})],
    1: [W('Learn', '6-7', {}), W('Build', '7', {}), W('Build', '7-8', {}), W('Peak', '8', {})],
    2: [W('Base', '6-7', {}), W('Build', '7', {}), W('Build', '7-8', {}), W('Push', '8', {}), W('Peak', '8-9', {}), DL('Deload')],
    3: [W('Base', '7', {}), W('Build', '7-8', {}), W('Push', '8', {}), DL('Deload'),
        W('Build', '8', {}), W('Push', '8-9', {}), W('Peak', '9', {}), DL('Deload')],
    4: [W('Accumulate', '7-8', {}), W('Intensify', '8', {}), W('Peak', '8-9', {}), DL('Deload')],
    5: [W('Re-entry', '6-7', { rounds: 3 }),
        W('Ramp', '7', { rounds: 3, catchUp: true }),
        W('Ramp', '7-8', { rounds: 4, catchUp: true }),
        W('Momentum', '8', { rounds: 4, catchUp: true })]
  };

  var READINESS = {
    green:  { label: 'Ready',   setsMult: 1,   load: 1,    note: 'Train as programmed.' },
    yellow: { label: 'Tired',   setsMult: 0.75, load: 0.9, note: 'About 25% fewer sets, load -10%.' },
    red:    { label: 'Wrecked', setsMult: 0.5, load: 0.8,  note: 'Half the sets, load -20%. Keep it crisp.' }
  };

  function today() { return HistoryStore.localDate(); }

  function mondayOf(d) { return HistoryStore.mondayOf(d); }

  function hasScheduledDeload(phaseId) {
    return (MODELS[phaseId] || []).some(function(m) { return m.deload; });
  }

  function phaseWeeks(phaseId) {
    return phaseId === 4 ? null : (MODELS[phaseId] ? MODELS[phaseId].length : null);
  }

  /* Manual deload: this calendar week only */
  function forceDeload() { Store.save('forceDeload', mondayOf()); }

  function getModel(phaseId, week) {
    var arr = MODELS[phaseId] || MODELS[1];
    week = Math.max(1, parseInt(week, 10) || 1);
    var base = phaseId === 4 ? arr[(week - 1) % arr.length] : arr[Math.min(week, arr.length) - 1];
    var m = {};
    for (var k in base) if (base.hasOwnProperty(k)) m[k] = base[k];
    /* One-off load reduction on the first circuit week after a break */
    if (phaseId === 5) {
      var re = Store.get('reentry', null);
      if (re && re.week === week && re.pct < 100) m.loadPct = re.pct;
    }
    return m;
  }

  function setPhase(phaseId, week) {
    STATE.phase       = phaseId;
    STATE.weekInPhase = Math.max(1, week || 1);
    Store.save('phase', STATE.phase);
    Store.save('weekInPhase', STATE.weekInPhase);
    Store.save('weekAnchor', mondayOf());
    Store.save('phaseDone', false);
  }

  function setWeek(week) {
    var cap = phaseWeeks(STATE.phase);
    var w = Math.max(1, parseInt(week, 10) || 1);
    STATE.weekInPhase = cap ? Math.min(w, cap) : w;
    Store.save('weekInPhase', STATE.weekInPhase);
    Store.save('weekAnchor', mondayOf());
  }

  /* Advance the week counter by calendar, but only if the elapsed week had training.
     A missed week never moves you forward and never sends you backwards. */
  function syncWeek() {
    var anchor = Store.get('weekAnchor', null);
    var mon = mondayOf();
    if (!anchor) { Store.save('weekAnchor', mon); return; }
    if (mon <= anchor) return;
    var trained = HistoryStore.getSessions().some(function(s) { return s.date >= anchor && s.date < mon; });
    if (trained) {
      var cap = phaseWeeks(STATE.phase);
      if (cap && STATE.weekInPhase >= cap) Store.save('phaseDone', true);
      else STATE.weekInPhase++;
      Store.save('weekInPhase', STATE.weekInPhase);
    }
    /* Running plan follows the same rule: advance only after a week with a logged run */
    var ranLastWeek = Store.get('runLog', []).some(function(d) { return d >= anchor && d < mon; });
    var runCap = (typeof RUNNING_PLAN !== 'undefined' && RUNNING_PLAN.weeks) ? RUNNING_PLAN.weeks.length : 0;
    if (ranLastWeek && runCap && STATE.runningWeek < runCap) {
      STATE.runningWeek++;
      Store.save('runningWeek', STATE.runningWeek);
    }
    Store.save('weekAnchor', mon);
  }

  function recordRun() {
    var log = Store.get('runLog', []);
    var t = today();
    if (log.indexOf(t) === -1) { log.push(t); Store.save('runLog', log.slice(-60)); }
  }

  function resumePhaseId() {
    var r = Store.get('resumePhase', null);
    if (r !== null && r !== 0 && r !== 5 && PROGRAMS.phases[r]) return r;
    return STATE.settings.level === 'beginner' ? 1 : 2;
  }

  function enterCircuit(startWeek, pct) {
    if (STATE.phase !== 5) {
      Store.save('resumePhase', (STATE.phase === 0 || STATE.phase === 5) ? resumePhaseId() : STATE.phase);
    }
    Store.save('reentry', { week: startWeek, pct: pct || 100 });
    setPhase(5, startWeek);
  }

  function breakKeyForDays(d) {
    if (d <= 10) return '1_week';
    if (d <= 24) return '2_3_weeks';
    if (d <= 45) return '1_month';
    if (d <= 120) return '2_3_months';
    return '6_months_plus';
  }

  function applyBreak(key) {
    var rec = PROGRAMS.breakRecoveryMatrix[key];
    if (!rec) return;
    if (STATE.settings.level === 'beginner') setPhase(rec.beginnerPhase, 1);
    else enterCircuit(rec.startWeek, rec.loadPct);
    Store.save('breakDismissed', STATE.lastWorkoutDate);
    var name = PROGRAMS.phases[STATE.phase].name;
    showToast('Plan set: ' + name + ', week ' + STATE.weekInPhase, 'success');
    renderPage(STATE.currentPage);
  }

  function dismissBreak() {
    Store.save('breakDismissed', STATE.lastWorkoutDate);
    renderPage(STATE.currentPage);
  }

  function breakStatus() {
    if (!STATE.lastWorkoutDate) return null;
    var days = dayDiff(STATE.lastWorkoutDate, today());
    if (days < 8 || Store.get('breakDismissed', null) === STATE.lastWorkoutDate) return null;
    return { days: days, key: breakKeyForDays(days) };
  }

  function finishPhase() {
    if (STATE.phase === 5) {
      setPhase(resumePhaseId(), 1);
    } else if (PROGRAMS.phases[STATE.phase + 1] && STATE.phase + 1 < 5) {
      setPhase(STATE.phase + 1, 1);
    } else {
      setWeek(1);
    }
    showToast('Now on ' + PROGRAMS.phases[STATE.phase].name, 'success');
    renderPage(STATE.currentPage);
  }

  /* Lifting sessions earlier this week with no logged workout of the same title */
  function missedSessions() {
    var phase = PROGRAMS.phases[STATE.phase];
    if (!phase || !phase.schedule) return [];
    var dow = new Date().getDay();
    var todayIdx = dow === 0 ? 6 : dow - 1;
    var titles = HistoryStore.getSessionsThisWeek().map(function(s) { return s.title; });
    var out = [];
    for (var i = 0; i < todayIdx; i++) {
      var s = phase.schedule[i];
      if (s && s.exercises && s.exercises.length && !s.rest && !s.walk && !s.massage && titles.indexOf(s.focus) === -1) {
        out.push({ idx: i, ses: s });
      }
    }
    return out;
  }

  /* 'grouped' = all sets of a station together (default, best for barbell lifts);
     'rounds' = rotate through the stations (conditioning style) */
  function getCircuitStyle() { return Store.get('circuitStyle', 'grouped') === 'rounds' ? 'rounds' : 'grouped'; }
  function setCircuitStyle(style) {
    Store.save('circuitStyle', style === 'rounds' ? 'rounds' : 'grouped');
    renderPage(STATE.currentPage);
  }

  function getReadiness() {
    /* Manual override (the Ready/Tired/Wrecked buttons) wins; otherwise today's readiness zone */
    var r = Store.get('readiness', null);
    if (r && r.date === today() && READINESS[r.level]) return r.level;
    var rd = (typeof Readiness !== 'undefined') ? Readiness.getToday() : null;
    return rd ? rd.zone : 'green';
  }

  function setReadiness(level) {
    if (!READINESS[level]) return;
    Store.save('readiness', { date: today(), level: level });
    renderPage(STATE.currentPage);
  }

  /* Model for the session about to start: week model x readiness */
  function getSessionModel() {
    var m = Store.get('forceDeload', null) === mondayOf() ? getModel(2, 6) : getModel(STATE.phase, STATE.weekInPhase);
    var key = getReadiness();
    var r = READINESS[key];
    m.readiness = key;
    m.setsMult = m.setsMult * r.setsMult;
    m.loadPct = Math.round(m.loadPct * r.load);
    m.reduced = m.deload || key !== 'green';
    return m;
  }

  function adjustSets(sets, model) {
    var n = parseInt(sets, 10) || 3;
    if (model.setsMult >= 1) return String(n);
    return String(Math.max(2, Math.round(n * model.setsMult)));
  }

  /* Round-robin expansion: A1 B1 C1 A2 B2 C2 ... each entry is a single set */
  function expandCircuit(stations, rounds, rests) {
    var out = [];
    for (var r = 1; r <= rounds; r++) {
      stations.forEach(function(st, i) {
        var lastOfRound = i === stations.length - 1;
        var e = {};
        for (var k in st) if (st.hasOwnProperty(k)) e[k] = st[k];
        e.sets = '1';
        e._round = r;
        e._rounds = rounds;
        e._rest = lastOfRound ? (r === rounds ? 0 : rests.restRound) : rests.restStation;
        out.push(e);
      });
    }
    return out;
  }

  /* ---- UI fragments ---- */
  function renderBanners() {
    var html = '';
    var br = breakStatus();
    if (br) {
      var rec = PROGRAMS.breakRecoveryMatrix[br.key];
      html +=
        '<div class="card-accent mb-12" style="border-color:rgba(6,182,212,0.4)">' +
          '<div style="font-size:0.72rem;font-weight:700;color:#06b6d4;text-transform:uppercase;letter-spacing:.06em">Welcome back</div>' +
          '<p style="font-size:0.88rem;margin:4px 0 10px">' + br.days + ' days since your last session. ' + rec.message + '</p>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
            '<button class="btn btn-primary btn-sm" onclick="Progression.applyBreak(\'' + br.key + '\')">Use recommended plan</button>' +
            '<button class="btn btn-secondary btn-sm" onclick="Progression.dismissBreak()">Keep current plan</button>' +
          '</div>' +
        '</div>';
    }
    if (Store.get('phaseDone', false)) {
      var isCircuit = STATE.phase === 5;
      html +=
        '<div class="card-accent mb-12" style="border-color:rgba(16,185,129,0.4)">' +
          '<div style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em">Phase complete</div>' +
          '<p style="font-size:0.88rem;margin:4px 0 10px">' + (isCircuit ? 'Momentum rebuilt. Return to ' + PROGRAMS.phases[resumePhaseId()].name + '.' : 'You finished ' + PROGRAMS.phases[STATE.phase].name + '. Move on when ready.') + '</p>' +
          '<button class="btn btn-green btn-sm" onclick="Progression.finishPhase()">Continue</button>' +
        '</div>';
    }
    var missed = missedSessions();
    if (missed.length) {
      html += '<div class="card mb-12"><div style="font-size:0.72rem;font-weight:700;color:var(--yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Missed this week</div>';
      missed.slice(0, 2).forEach(function(m) {
        html +=
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0">' +
            '<span style="font-size:0.85rem">' + m.ses.focus + '</span>' +
            '<button class="btn btn-secondary btn-sm" onclick="startSessionByIndex(' + m.idx + ')">Do it now</button>' +
          '</div>';
      });
      html += '</div>';
    }
    return html;
  }

  function renderCircuitStyle() {
    var cur = getCircuitStyle();
    function chip(id, label) {
      return '<button class="btn btn-sm ' + (cur === id ? 'btn-primary' : 'btn-secondary') + '" style="flex:1" onclick="Progression.setCircuitStyle(\'' + id + '\')">' + label + '</button>';
    }
    return '<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">' +
      '<div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Circuit style</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:6px">' + chip('grouped', 'Grouped sets') + chip('rounds', 'Rounds') + '</div>' +
      '<div style="font-size:0.75rem;color:var(--text-muted)">' + (cur === 'grouped'
        ? 'All sets of one exercise together, then the next. Best for barbell lifts: no plate changes between sets.'
        : 'One set of every station, then repeat. Short station rests, longer round rest. Best for lighter stations and conditioning.') + '</div>' +
    '</div>';
  }

  function renderPlanStatus() {
    var m = getSessionModel();
    var cur = getReadiness();
    var chips = Object.keys(READINESS).map(function(k) {
      var on = k === cur;
      return '<button class="btn btn-sm ' + (on ? 'btn-primary' : 'btn-secondary') + '" style="flex:1" onclick="Progression.setReadiness(\'' + k + '\')">' + READINESS[k].label + '</button>';
    }).join('');
    return '<div class="card mb-16">' +
      '<div class="flex-between" style="margin-bottom:8px">' +
        '<div style="font-size:0.85rem;font-weight:700">Week ' + STATE.weekInPhase + ' &bull; ' + m.label + '</div>' +
        '<div style="display:flex;gap:6px">' +
          '<span class="badge badge-muted">Target RPE ' + m.rpe + '</span>' +
          (m.deload ? '<span class="badge badge-yellow">Deload</span>' : '') +
        '</div>' +
      '</div>' +
      '<div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">How do you feel today?</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:6px">' + chips + '</div>' +
      '<div style="font-size:0.78rem;color:var(--text-muted)">' + READINESS[cur].note + '</div>' +
      (STATE.phase === 5 ? renderCircuitStyle() : '') +
    '</div>';
  }

  return {
    MODELS: MODELS,
    getModel: getModel,
    getSessionModel: getSessionModel,
    phaseWeeks: phaseWeeks,
    hasScheduledDeload: hasScheduledDeload,
    setPhase: setPhase,
    setWeek: setWeek,
    forceDeload: forceDeload,
    syncWeek: syncWeek,
    recordRun: recordRun,
    enterCircuit: enterCircuit,
    applyBreak: applyBreak,
    dismissBreak: dismissBreak,
    finishPhase: finishPhase,
    missedSessions: missedSessions,
    setReadiness: setReadiness,
    adjustSets: adjustSets,
    getCircuitStyle: getCircuitStyle,
    setCircuitStyle: setCircuitStyle,
    expandCircuit: expandCircuit,
    renderBanners: renderBanners,
    renderPlanStatus: renderPlanStatus
  };
})();
